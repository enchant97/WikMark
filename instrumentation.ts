
export async function register() {
  if (process.env.NEXT_RUNTIME === 'nodejs') {
    const { mkdir } = await import('node:fs/promises')
    const WIKI_PATH = process.env.WIKI_PATH
    if (!WIKI_PATH) {
      throw new Error("environment variable `WIKI_PATH` must be set!")
    }
    await mkdir(WIKI_PATH, { recursive: true })
  }
}
