import path from "node:path";
import env from "@/env";
import { stat, glob, readFile, writeFile } from "node:fs/promises";
import rehypeSanitize from 'rehype-sanitize'
import rehypeStringify from 'rehype-stringify'
import remarkParse from 'remark-parse'
import remarkRehype from 'remark-rehype'
import { unified } from 'unified'
import remarkFrontmatter from "remark-frontmatter";
import remarkGfm from "remark-gfm";
import matter from "gray-matter";

const INDEX_PAGE_NAME = "_index"

function isPathInside(child: string, parent: string): boolean {
  const relative = path.relative(parent, child)
  return relative !== "" && !relative.startsWith("..") && !path.isAbsolute(relative)
}

function isPathIndex(fullPath: string): boolean {
  return fullPath === env.WIKI_PATH
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
  const globOptions = { cwd: fullPath }
  if (isPathIndex(fullPath)) {
    globOptions.exclude = [`${INDEX_PAGE_NAME}.md`]
  }
  try {
    const results = glob("*.md", globOptions)
    for await (const filename of results) {
      yield path.basename(filename, ".md")
    }
  } catch (err) {
    const contentPath = isPathIndex(fullPath)
      ? `${fullPath}/${INDEX_PAGE_NAME}.md`
      : `${fullPath}.md`
    if (!(await stat(contentPath)).isFile) {
      throw err
    }
  }
}

export async function getPageContentRaw(fullSlug: string) {
  const fullPath = `${getFullPath(fullSlug)}`
  if (isPathIndex(fullPath)) {
    return await readFile(`${fullPath}/${INDEX_PAGE_NAME}.md`)
  }
  return await readFile(`${fullPath}.md`)
}

export async function writePageContentRaw(fullSlug: string, rawContent: string) {
  const pathSuffix = fullSlug === ""
    ? `/${INDEX_PAGE_NAME}.md`
    : ".md"
  const fullPath = `${getFullPath(fullSlug)}${pathSuffix}`
  await writeFile(fullPath, rawContent)
}

export interface PageContentParts {
  content: string
  metadata: Object
}

export async function getPageContentParts(fullSlug: string): Promise<PageContentParts> {
  const contentRaw = await getPageContentRaw(fullSlug)
  const out = matter(contentRaw)
  return {
    content: out.content,
    metadata: out.data,
  }
}

export async function getPageContentAsHTML(fullSlug: string): Promise<string> {
  return String(await unified()
    .use(remarkParse)
    .use(remarkFrontmatter)
    .use(remarkGfm)
    .use(remarkRehype)
    .use(rehypeSanitize)
    .use(rehypeStringify)
    .process(await getPageContentRaw(fullSlug)))
}

export async function writePageContentParts(fullSlug: string, contentParts: PageContentParts) {
  const contentRaw = matter.stringify(contentParts.content, contentParts.metadata)
  writePageContentRaw(fullSlug, contentRaw)
}
