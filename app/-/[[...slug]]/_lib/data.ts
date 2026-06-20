import path from "node:path";
import env from "@/env";
import { stat, glob, readFile } from "node:fs/promises";
import rehypeSanitize from 'rehype-sanitize'
import rehypeStringify from 'rehype-stringify'
import remarkParse from 'remark-parse'
import remarkRehype from 'remark-rehype'
import { unified } from 'unified'

function isPathInside(child: string, parent: string): boolean {
  const relative = path.relative(parent, child)
  return relative !== "" && !relative.startsWith("..") && !path.isAbsolute(relative)
}

function getFullPath(currentSlug: string): string {
  const fullPath = path.join(env.WIKI_PATH, path.normalize(currentSlug))
  if (fullPath !== env.WIKI_PATH && !isPathInside(fullPath, env.WIKI_PATH)) {
    throw new Error(`path traversal attempt at: ${fullPath}`)
  }
  return fullPath
}

export async function* getChildrenBySlug(currentSlug: string): AsyncIterableIterator<string> {
  const fullPath = getFullPath(currentSlug)
  try {
    const results = glob("*.md", { cwd: fullPath })
    for await (const filename of results) {
      yield path.basename(filename, ".md")
    }
  } catch (err) {
    if (!(await stat(`${fullPath}.md`)).isFile) {
      throw err
    }
  }
}

export async function getPageContentRaw(fullSlug: string) {
  const contentPath = `${getFullPath(fullSlug)}.md`
  return await readFile(contentPath)
}

export async function getPageContentAsHTML(fullSlug: string): Promise<string> {
  return String(await unified()
    .use(remarkParse)
    .use(remarkRehype)
    .use(rehypeSanitize)
    .use(rehypeStringify)
    .process(await getPageContentRaw(fullSlug)))
}
