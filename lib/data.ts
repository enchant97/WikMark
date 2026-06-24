import path from "node:path";
import env from "@/env";
import { stat, glob, readFile, writeFile, mkdir, rename, rm } from "node:fs/promises";
import matter from "gray-matter";
import { renderMarkdown } from "./helpers";

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

export async function* getPageAssetsBySlug(currentSlug: string): AsyncIterableIterator<string> {
  const fullPath = getFullPath(currentSlug)
  try {
    const results = glob("*", {
      cwd: fullPath,
      exclude: ["*.md"],
      withFileTypes: true
    })
    for await (const entry of results) {
      if (entry.isFile()) {
        yield entry.name
      }
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

export async function createPage(parentSlug: string, slug: string, metadata: Object) {
  const rawContent = matter.stringify("", metadata)
  if (parentSlug !== "") {
    await mkdir(getFullPath(parentSlug), { recursive: true })
  }
  const fullSlug = parentSlug === "" ? slug : `${parentSlug}/${slug}`
  const pathSuffix = fullSlug === ""
    ? `/${INDEX_PAGE_NAME}.md`
    : ".md"
  const fullPath = `${getFullPath(fullSlug)}${pathSuffix}`
  await writeFile(fullPath, rawContent, { flag: "wx" })
  return fullSlug
}

export async function createAsset(parentSlug: string, slug: string, rawContent: Blob) {
  const parentFullPath = getFullPath(parentSlug)
  const fullPath = `${parentFullPath}/${slug}`
  await mkdir(parentFullPath, { recursive: true })
  await writeFile(fullPath, await rawContent.bytes(), { flag: "wx" })
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
  return await renderMarkdown(await getPageContentRaw(fullSlug))
}

export async function writePageContentParts(fullSlug: string, contentParts: PageContentParts) {
  const contentRaw = matter.stringify(contentParts.content, contentParts.metadata)
  writePageContentRaw(fullSlug, contentRaw)
}

export async function renamePage(currentFullSlug: string, newFullSlug: string) {
  const currentFullPath = getFullPath(currentFullSlug)
  const newFullPath = getFullPath(newFullSlug)
  // guard against renaming index
  if (isPathIndex(currentFullPath)) {
    throw new Error("cannot rename index")
  }
  if (isPathIndex(newFullSlug)) {
    throw new Error("cannot rename to index")
  }
  // create parent folders
  await mkdir(path.dirname(newFullPath), { recursive: true })
  // move page
  try {
    await rename(`${currentFullPath}.md`, `${newFullPath}.md`)
  } catch { }
  try {
    // move page children
    await rename(`${currentFullPath}`, `${newFullPath}`)
  } catch { }
}

export async function deletePage(fullSlug: string) {
  const fullPath = getFullPath(fullSlug)
  if (fullSlug === "") {
    throw new Error("cannot delete index")
  }
  await Promise.allSettled([
    rm(`${fullPath}.md`, { force: true }),
    rm(fullPath, { recursive: true, force: true }),
  ])
}

export async function deleteAsset(fullSlug: string) {
  const fullPath = getFullPath(fullSlug)
  if (fullPath === "" || path.extname(fullPath) === ".md") {
    throw new Error("cannot delete pages")
  }
  await rm(fullPath, { force: true })
}

export async function getRawContent(fullSlug: string) {
  const fullPath = getFullPath(fullSlug)
  return await readFile(fullPath)
}
