import Database from "better-sqlite3"
import env from "@/env"
import { discoverPagePaths, IndexedPage, indexPagePath } from "./indexer"
import { PageMetadata } from "@/lib/types"

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
  const ftsQuery = query.split(/\s+/).map(v => `"${v.replace(/"/g, ' ')}"*`).join(' AND ');
  const rows = getDb().prepare(`
    SELECT slug, title,
           snippet(pages_fts, 2, '<mark>', '</mark>', '…', 12) AS excerpt,
           rank
    FROM pages_fts
    WHERE pages_fts MATCH ?
    ORDER BY rank
    LIMIT ?
  `).all(ftsQuery, limit);
  return rows as SearchResult[]
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
