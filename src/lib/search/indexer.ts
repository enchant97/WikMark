import env from "@/env";
import * as fs from "node:fs/promises";
import path from "node:path";
import { isValidPageSlugPart, renderToIndexable, extractFrontmatter } from "@/lib/helpers";
import { PageContentParts } from "@/lib/data/page";
import { PageMetadata, parsePageMetadata } from "@/lib/types";
import { Dirent } from "node:fs";

export interface IndexedPage {
  slug: string
  title: string
  content: string
}

function pathToSlug(p: string): string {
  const relPath = path.relative(env.WIKI_PATH, p)
  const parts = relPath.split(path.sep)
  const basename = path.basename(parts.pop()!, ".md")
  return [...parts, (basename === "_index" && parts.length === 0) ? "" : basename].join("/")
}

export interface DiscoveredPagePath {
  type: "file" | "dir"
  path: string
}

export async function* discoverPagePaths(): AsyncIterableIterator<DiscoveredPagePath> {
  const results = fs.glob("**", {
    cwd: env.WIKI_PATH,
    withFileTypes: true,
    exclude: (entry: Dirent) => entry.isDirectory() && !isValidPageSlugPart(entry.name) && entry.name !== "_index",
  })
  for await (const entry of results as AsyncIterable<Dirent>) {
    if (entry.isDirectory()) {
      yield { type: "dir", path: path.join(entry.parentPath, entry.name) }
    } else if (
      entry.isFile() &&
      entry.name.endsWith(".md") &&
      isValidPageSlugPart(path.basename(entry.name, ".md"))
    ) {
      yield { type: "file", path: path.join(entry.parentPath, entry.name) }
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

export function indexPageFromNew(slug: string, metadata: PageMetadata): IndexedPage {
  return {
    slug,
    title: metadata?.title ?? "",
    content: "",
  }
}

export async function indexPageFilePath(filePath: string): Promise<IndexedPage> {
  const rawContent = await fs.readFile(filePath)
  const { content, data } = extractFrontmatter(rawContent)
  const metadata = parsePageMetadata(data)
  return await indexPageFromParts(pathToSlug(filePath), { content, metadata })
}

export function indexPageDirPath(dirPath: string): IndexedPage {
  return {
    slug: pathToSlug(dirPath),
    title: "",
    content: "",
  }
}
