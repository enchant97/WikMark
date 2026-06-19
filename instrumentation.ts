import env from './env'

export async function register() {
  if (process.env.NEXT_RUNTIME === 'nodejs') {
    const { mkdir } = await import('node:fs/promises')
    await mkdir(env.WIKI_PATH, { recursive: true })
  }
}
