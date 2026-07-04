import env from './env'
import { auth } from './lib/auth'

export async function register() {
  if (process.env.NEXT_RUNTIME === 'nodejs') {
    // create wiki path
    const { mkdir } = await import('node:fs/promises')
    await mkdir(env.WIKI_PATH, { recursive: true })
    // create/setup db
    const { getMigrations } = await import("better-auth/db/migration")
    const { runMigrations } = await getMigrations(auth.options);
    await runMigrations();
    // setup search index
    const searchDb = await import("@/lib/search/db")
    searchDb.rebuildIndex()
  }
}
