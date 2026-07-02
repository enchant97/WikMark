import env from "@/env";
import * as fs from "node:fs/promises";
import path from "node:path";
import { isValidPageSlugPart, renderToIndexable } from "@/lib/helpers";
import matter from "gray-matter";
import { PageContentParts } from "@/lib/data/page";

export interface IndexedPage {
  slug: string
  title: string
  content: string
}

function pathToSlug(p: string): string {
  const relPath = path.relative(env.WIKI_PATH, p)
  const parts = relPath.split(path.sep)
  const basename = path.basename(parts.pop()!, ".md")
  return [...parts, basename === "_index" ? "" : basename].join("/")
}

export async function* discoverPagePaths(): AsyncIterableIterator<string> {
  const results = fs.glob("**/*.md", { cwd: env.WIKI_PATH, withFileTypes: true })
  for await (const entry of results) {
    if (entry.isFile() && isValidPageSlugPart(path.basename(entry.name, ".md"))) {
      yield path.join(entry.parentPath, entry.name)
    }
  }
}

export async function indexPageFromParts(slug: string, parts: PageContentParts): Promise<IndexedPage> {
  const indexableContent = await renderToIndexable(parts.content)
  return {
    slug,
    title: parts.metadata?.title ?? "",
    content: indexableContent,
  }
}

export function indexPageFromNew(slug: string, metadata: object): IndexedPage {
  return {
    slug,
    title: metadata?.title ?? "",
    content: "",
  }
}

export async function indexPagePath(pagePath: string): Promise<IndexedPage> {
  const rawContent = await fs.readFile(pagePath)
  const { content, data: metadata } = matter(rawContent)
  return await indexPageFromParts(pathToSlug(pagePath), { content, metadata })
}
