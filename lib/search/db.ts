import Database from "better-sqlite3"
import env from "@/env"
import { discoverPagePaths, IndexedPage, indexPagePath } from "./indexer"

let db: Database.Database | null = null

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
  const ftsQuery = query.split(/\s+/).map(v => `${v.replace(/"/g, '')}*`).join(' AND ');
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

export function updateIndexedPageMetadata(slug: string, metadata: object) {
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
  // TODO could implement content hashing, to make re-index faster?
  // Would require new table field `content_hash UNINDEXED`
  console.log("rebulding search index")
  const db = getDb()
  db.exec("DELETE FROM pages_fts")
  const pagePaths = discoverPagePaths()
  for await (const pagePath of pagePaths) {
    console.log(`indexing: '${pagePath}'`)
    await reIndexPagePath(pagePath)
  }
}
