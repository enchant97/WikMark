import Database from "better-sqlite3"
import env from "@/env"
import { discoverPagePaths, IndexedPage, indexPagePath } from "./indexer"
import { PageMetadata } from "@/lib/types"

const MAX_SQ_LENGTH = 256
const MAX_SQ_TERMS = 8
const MAX_SQ_TERM_LENGTH = 50

const globalForDb = globalThis
let db: Database.Database | null = globalForDb.__search_db ?? null

function getDb() {
  if (db !== null) {
    return db
  }
  db = new Database(env.SEARCH_DB_PATH)
  process.on("exit", () => {
    console.debug("closing search index db")
    db?.close()
  })
  db.pragma("journal_mode = WAL")
  db.exec(`
    CREATE VIRTUAL TABLE IF NOT EXISTS pages_fts USING fts5(
      slug UNINDEXED,
      title,
      content,
      tokenize = 'porter unicode61'
    )
  `)
  db.exec(`
    CREATE TABLE IF NOT EXISTS pages_config(
      key TEXT PRIMARY KEY,
      value TEXT
    )
  `)
  if (process.env.NODE_ENV !== "production") {
    // only set for when hot-reload is used
    globalForDb.__search_db = db
  }
  return db
}

function escapeLike(s: string) {
  return s.replace(/[\\%_]/g, (c) => '\\' + c)
}


export interface SearchResult {
  slug: string
  title: string
  excerpt: string
  rank: number
}

export function getSearchResults(query: string, limit: number) {
  const MARK_START = '\u0001'
  const MARK_END = '\u0002'

  if (!Number.isInteger(limit) || limit < 0) {
    throw new Error("limit must not be a non-negative integer")
  }

  // prevent empty queries & add limits
  const terms = query
    .slice(0, MAX_SQ_LENGTH)
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, MAX_SQ_TERMS)
    .map(t => t.slice(0, MAX_SQ_TERM_LENGTH))

  if (terms.length === 0) { return [] }

  const ftsQuery = terms
    .map((v, i) => {
      const quoted = `"${v.replace(/"/g, ' ')}"`;
      // Only prefix-match the last term,
      // and only if it's at least 2 characters.
      const isLast = i === terms.length - 1;
      return isLast && v.length >= 2 ? `${quoted}*` : quoted;
    })
    .join(' AND ')

  const rows = getDb().prepare(`
    SELECT slug, title,
           snippet(pages_fts, 2, ?, ?, '…', 12) AS excerpt,
           rank
    FROM pages_fts
    WHERE pages_fts MATCH ?
    ORDER BY rank
    LIMIT ?
  `).all(MARK_START, MARK_END, ftsQuery, limit)
  // TODO return better excerpt without the need to escape.
  //      instead text/match segments that JSX can process handle
  return rows.map(r => ({
    ...r,
    title: r.title,
    excerpt: r.excerpt.replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#39;')
      .replaceAll(MARK_START, '<mark>')
      .replaceAll(MARK_END, '</mark>'),
  })) as SearchResult[]
}

export function deleteIndexedPage(slug: string, options: { children: boolean } = { children: true }) {
  const db = getDb()
  if (options.children) {
    const deletePage = db.prepare(
      "DELETE FROM pages_fts WHERE slug = ? OR slug LIKE ? ESCAPE '\\'"
    )
    deletePage.run(slug, escapeLike(slug) + "/%")
  } else {
    const deletePage = db.prepare(
      "DELETE FROM pages_fts WHERE slug = ?"
    )
    deletePage.run(slug)
  }
}

export function renameIndexedPage(oldSlug: string, newSlug: string) {
  const db = getDb()
  const rows = db.prepare(
    "SELECT slug FROM pages_fts WHERE slug = ? OR slug LIKE ? ESCAPE '\\'"
  ).all(oldSlug, escapeLike(oldSlug) + "/%") as { slug: string }[]
  const rename = db.prepare("UPDATE pages_fts SET slug = ? WHERE slug = ?")
  const tx = db.transaction(() => {
    for (const { slug } of rows) {
      const updated = slug === oldSlug ? newSlug : newSlug + slug.slice(oldSlug.length)
      rename.run(updated, slug)
    }
  })
  tx()
}

export function updateIndexedPage(indexedPage: IndexedPage) {
  const db = getDb()
  const insertIndexedPage = db.prepare(
    "INSERT INTO pages_fts (slug, title, content) VALUES (@slug, @title, @content)"
  )
  const tx = db.transaction(() => {
    deleteIndexedPage(indexedPage.slug, { children: false })
    insertIndexedPage.run(indexedPage)
  })
  tx()
}

export function updateIndexedPageMetadata(slug: string, metadata: PageMetadata) {
  const db = getDb()
  const stmt = db.prepare(
    "UPDATE pages_fts SET title = @title WHERE slug = @slug"
  )
  stmt.run({ slug, title: metadata?.title ?? slug })
}

async function reIndexPagePath(pagePath: string) {
  const indexedPage = await indexPagePath(pagePath)
  updateIndexedPage(indexedPage)
}

export async function rebuildIndex() {
  const db = getDb()
  const updateConfigStmt = db.prepare("INSERT OR REPLACE INTO pages_config(key, value) VALUES (@key, @value)")
  const getConfigStmt = db.prepare("SELECT value FROM pages_config WHERE key = ?").pluck()

  const createdAt = getConfigStmt.get("createdAt") as string | undefined
  const version = getConfigStmt.get("version") as string | undefined
  const isPending = getConfigStmt.get("isPending") as string | undefined

  let rebuildRequired = false
  if (isPending === "true") {
    console.log("index in detected in pending state, rebuild required")
    rebuildRequired = true
  } else if (createdAt === undefined) {
    console.log("index does not exist, rebuild required")
    rebuildRequired = true
  } else if (createdAt > (new Date()).toISOString()) {
    console.log("index created in future, rebuild required")
    rebuildRequired = true
  } else if (version !== "1") {
    console.log("index version incorrect, rebuild required")
    rebuildRequired = true
  }

  if (!rebuildRequired) {
    console.log(`skipping index build, using existing created at: '${createdAt}'`)
    return
  }

  console.log("rebulding search index")
  updateConfigStmt.run({ key: "isPending", value: "true" })
  db.exec("DELETE FROM pages_fts")
  const pagePaths = discoverPagePaths()
  for await (const pagePath of pagePaths) {
    console.log(`indexing: '${pagePath}'`)
    await reIndexPagePath(pagePath)
  }
  updateConfigStmt.run({ key: "createdAt", value: (new Date()).toISOString() })
  updateConfigStmt.run({ key: "version", value: "1" })
  updateConfigStmt.run({ key: "isPending", value: "false" })
}
