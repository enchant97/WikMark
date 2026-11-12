import Database from "better-sqlite3"
import env from "@/env"
import { DiscoveredPagePath, discoverPagePaths, IndexedPage, indexPageDirPath, indexPageFilePath } from "./indexer"
import { PageMetadata } from "@/lib/types"
import { unlink } from "node:fs/promises"

const CURRENT_DB_VERSION = "2"

const MAX_SQ_LENGTH = 256
const MAX_SQ_TERMS = 8
const MAX_SQ_TERM_LENGTH = 50

const globalForDb = globalThis
let __db: Database.Database | null = globalForDb.__search_db ?? null

process.on("exit", () => {
  closeDb()
})

function closeDb() {
  if (__db !== null) {
    console.debug("closing search index db")
    __db.close()
    __db = null
    if (process.env.NODE_ENV !== "production") {
      // only set for when hot-reload is used
      globalForDb.__search_db = null
    }
  }
}

function createTables(db: Database.Database) {
  db.transaction(() => {
    // pages table
    db.exec(`
    CREATE TABLE pages (
      id INTEGER PRIMARY KEY,
      slug TEXT NOT NULL UNIQUE,
      title TEXT NOT NULL,
      content TEXT NOT NULL,
      parentSlug TEXT GENERATED ALWAYS AS (
        CASE
          WHEN slug = '' THEN NULL
          WHEN instr(slug, '/') = 0 THEN ''
          ELSE rtrim(rtrim(slug, replace(slug, '/', '')), '/')
        END
      ) VIRTUAL
    )
  `)
    db.exec("CREATE INDEX idx_pages_parent_slug ON pages(parentSlug, slug)")
    // pages FTS table
    db.exec(`
    CREATE VIRTUAL TABLE pages_fts USING fts5(
      title,
      content,
      content = 'pages', content_rowid = 'id',
      tokenize = 'porter unicode61'
    )
  `)
    // after insert trigger
    db.exec(`
    CREATE TRIGGER pages_ai AFTER INSERT ON pages BEGIN
      INSERT INTO pages_fts(rowid, title, content) VALUES (new.id, new.title, new.content);
    END
  `)
    // after delete trigger
    db.exec(`
    CREATE TRIGGER pages_ad AFTER DELETE ON pages BEGIN
      INSERT INTO pages_fts(pages_fts, rowid, title, content) VALUES ('delete', old.id, old.title, old.content);
    END
  `)
    // after update trigger
    db.exec(`
    CREATE TRIGGER pages_au AFTER UPDATE ON pages BEGIN
      INSERT INTO pages_fts(pages_fts, rowid, title, content) VALUES ('delete', old.id, old.title, old.content);
      INSERT INTO pages_fts(rowid, title, content) VALUES (new.id, new.title, new.content);
    END
  `)
    // index config table
    db.exec(`
    CREATE TABLE pages_config(
      key TEXT PRIMARY KEY,
      value TEXT
    )
  `)
  })()
}

/**
 * Get the database connection,
 * by either creating or using the existing one.
 */
function getDb() {
  if (__db !== null) {
    return __db
  }
  __db = new Database(env.SEARCH_DB_PATH)
  __db.pragma("journal_mode = WAL")
  if (process.env.NODE_ENV !== "production") {
    // only set for when hot-reload is used
    globalForDb.__search_db = __db
  }
  return __db
}

function escapeLike(s: string) {
  return s.replace(/[\\%_]/g, (c) => '\\' + c)
}

export interface MatchSegment {
  type: "text" | "match"
  /** raw content, not sanitised! */
  content: string
}

export interface SearchResult {
  slug: string
  title: string
  /** raw excerpt, not sanitised! */
  excerpt: string
  segments: MatchSegment[]
  rank: number
}

export function excerptToSegments(excerpt: string) {
  const segments: MatchSegment[] = []
  const re = /\u0001(.*?)\u0002/gs
  let last = 0
  for (const m of excerpt.matchAll(re)) {
    const start = m.index!
    if (start > last) {
      segments.push({ type: "text", content: excerpt.slice(last, start) })
    }
    segments.push({ type: "match", content: m[1] })
    last = start + m[0].length
  }
  if (last < excerpt.length) {
    segments.push({ type: "text", content: excerpt.slice(last) })
  }
  return segments
}

export function getSearchResults(query: string, limit: number): SearchResult[] {
  const MARK_START = '\u0001'
  const MARK_END = '\u0002'

  if (!Number.isInteger(limit) || limit < 0) {
    throw new Error("limit must be a non-negative integer")
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

  const rows = getDb().prepare<unknown[], SearchResult>(`
    SELECT p.slug, p.title,
           snippet(pages_fts, 1, ?, ?, '…', 12) AS excerpt,
           pages_fts.rank
    FROM pages_fts
    JOIN pages p ON p.id = pages_fts.rowid
    WHERE pages_fts MATCH ?
    ORDER BY pages_fts.rank
    LIMIT ?
  `).all(MARK_START, MARK_END, ftsQuery, limit)
  return rows.map(r => ({
    ...r,
    excerpt: r.excerpt
      .replaceAll(MARK_START, "")
      .replaceAll(MARK_END, ""),
    segments: excerptToSegments(r.excerpt),
  }))
}

export function getPageTitle(slug: string): string | undefined {
  const db = getDb()
  const stmt = db.prepare<unknown[], string>("SELECT title FROM pages WHERE slug = ?")
  return stmt.pluck().get(slug)
}

export interface PageTreeEntry {
  slug: string
  title: string
}

export function getPageTree(currentSlug: string): PageTreeEntry[] {
  const db = getDb()
  const getPagesStmt = db.prepare<unknown[], PageTreeEntry>("SELECT slug, title FROM pages WHERE parentSlug = ?")
  return getPagesStmt.all(currentSlug)
}

export function deleteIndexedPage(slug: string, options: { children: boolean } = { children: true }) {
  const db = getDb()
  if (options.children) {
    const deletePage = db.prepare(
      "DELETE FROM pages WHERE slug = ? OR slug LIKE ? ESCAPE '\\'"
    )
    deletePage.run(slug, escapeLike(slug) + "/%")
  } else {
    const deletePage = db.prepare(
      "DELETE FROM pages WHERE slug = ?"
    )
    deletePage.run(slug)
  }
}

export function renameIndexedPage(oldSlug: string, newSlug: string) {
  const db = getDb()
  const rows = db.prepare(
    "SELECT slug FROM pages WHERE slug = ? OR slug LIKE ? ESCAPE '\\'"
  ).all(oldSlug, escapeLike(oldSlug) + "/%") as { slug: string }[]
  const rename = db.prepare("UPDATE pages SET slug = ? WHERE slug = ?")
  const insertIndexedDir = db.prepare("INSERT OR IGNORE INTO pages (slug, title, content) VALUES (@slug, '', '')")
  const parentParts = newSlug.split("/").slice(undefined, -1)
  const tx = db.transaction(() => {
    // rename all existing pages
    for (const { slug } of rows) {
      const updated = slug === oldSlug ? newSlug : newSlug + slug.slice(oldSlug.length)
      rename.run(updated, slug)
    }
    // ensure all parent directories are created/exists
    for (let index = 0; index < parentParts.length + 1; index++) {
      insertIndexedDir.run({ slug: parentParts.slice(undefined, index).join("/") })
    }
  })
  tx()
}

export function updateIndexedPage(indexedPage: IndexedPage) {
  const db = getDb()
  const insertIndexedPage = db.prepare(
    "INSERT INTO pages (slug, title, content) VALUES (@slug, @title, @content)"
  )
  const insertIndexedDir = db.prepare("INSERT OR IGNORE INTO pages (slug, title, content) VALUES (@slug, '', '')")
  const parentParts = indexedPage.slug.split("/").slice(undefined, -1)
  const tx = db.transaction(() => {
    // ensure parent directories are created
    for (let index = 0; index < parentParts.length + 1; index++) {
      insertIndexedDir.run({ slug: parentParts.slice(undefined, index).join("/") })
    }
    // overwrite any existing indexed page
    // (going from a dir with no page to one with)
    deleteIndexedPage(indexedPage.slug, { children: false })
    // insert actual page
    insertIndexedPage.run(indexedPage)
  })
  tx()
}

export function updateIndexedPageMetadata(slug: string, metadata: PageMetadata) {
  const db = getDb()
  const stmt = db.prepare(
    "UPDATE pages SET title = @title WHERE slug = @slug"
  )
  stmt.run({ slug, title: metadata?.title ?? slug })
}

async function reIndexPagePath(discoveredPage: DiscoveredPagePath) {
  if (discoveredPage.type === "file") {
    const indexedPage = await indexPageFilePath(discoveredPage.path)
    updateIndexedPage(indexedPage)
  } else if (discoveredPage.type === "dir") {
    const indexedPage = indexPageDirPath(discoveredPage.path)
    const db = getDb()
    const stmt = db.prepare(
      "INSERT OR IGNORE INTO pages (slug, title, content) VALUES (@slug, @title, @content)"
    )
    stmt.run(indexedPage)
  }
}

function getIndexDetails(db: Database.Database) {
  const getConfigStmt = db.prepare<unknown[], string | undefined>("SELECT value FROM pages_config WHERE key = ?").pluck()
  const createdAt = getConfigStmt.get("createdAt")
  const version = getConfigStmt.get("version")
  const isPending = getConfigStmt.get("isPending")
  return {
    createdAt,
    version,
    isPending,
  }
}

async function reIndex(db: Database.Database) {
  const updateConfigStmt = db.prepare("INSERT OR REPLACE INTO pages_config(key, value) VALUES (@key, @value)")
  console.log("rebulding search index")
  updateConfigStmt.run({ key: "isPending", value: "true" })
  db.exec("DELETE FROM pages")
  const pagePaths = discoverPagePaths()
  for await (const pagePath of pagePaths) {
    console.log(`indexing: '${pagePath.path}'`)
    await reIndexPagePath(pagePath)
  }
  updateConfigStmt.run({ key: "createdAt", value: (new Date()).toISOString() })
  updateConfigStmt.run({ key: "version", value: CURRENT_DB_VERSION })
  updateConfigStmt.run({ key: "isPending", value: "false" })
}

export async function rebuildIndex() {
  if (!getDb().prepare("SELECT 1 FROM sqlite_master WHERE type = 'table' AND name = ?").get("pages_config")) {
    console.log("init index database")
    createTables(getDb())
  }

  const { createdAt, version, isPending } = getIndexDetails(getDb())

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
  } else if (version !== CURRENT_DB_VERSION) {
    console.log("index version incorrect, rebuild required")
    rebuildRequired = true
  }

  if (!rebuildRequired) {
    console.log(`skipping index build, using existing created at: '${createdAt}'`)
    return
  }

  closeDb()
  await unlink(env.SEARCH_DB_PATH)
  createTables(getDb())
  await reIndex(getDb())
}
