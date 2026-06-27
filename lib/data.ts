import path from "node:path";
import env from "@/env";
import * as fs from "node:fs/promises";
import matter from "gray-matter";
import { isValidAssetSlugFull, isValidAssetSlugPart, isValidPageSlugFull, isValidPageSlugPart, renderMarkdown } from "./helpers";
import { AppError, AppErrorCode } from "./errors";

const INDEX_PAGE_NAME = "_index"

async function doesFileExist(fullPath: string): Promise<boolean> {
  try {
    if (!(await fs.stat(fullPath)).isFile) {
      return false
    }
  } catch (err) {
    if (err.code === "ENOENT") { return false }
    throw err
  }
  return true
}

function isPathInside(child: string, parent: string): boolean {
  const relative = path.relative(parent, child)
  return relative !== "" && !relative.startsWith("..") && !path.isAbsolute(relative)
}

function isPathIndex(fullPath: string): boolean {
  return fullPath === env.WIKI_PATH
}

/**
 * Get the absolute system path for given slug.
 *
 * - Assumes slug has been validated
 * - Will prevent path traversal outside of `WIKI_PATH`
 * - Must NOT be passed to client
 */
function getFullPath(currentSlug: string): string {
  const fullPath = path.join(env.WIKI_PATH, path.normalize(currentSlug))
  if (fullPath !== env.WIKI_PATH && !isPathInside(fullPath, env.WIKI_PATH)) {
    console.warn(`path traversal attempt at: '${fullPath}'`)
    throw new AppError(`invalid slug given: '${currentSlug}'`, AppErrorCode.Validation)
  }
  return fullPath
}

/**
 * Get the child page slugs (relative to parent) for given parent slug.
 *
 * - Expects a full page slug
 * - Performs slug validation
 */
export async function getChildrenBySlug(currentSlug: string): Promise<string[]> {
  if (!isValidPageSlugFull(currentSlug, { allowIndex: true })) {
    throw new AppError(`invalid slug given: '${currentSlug}'`, AppErrorCode.Validation)
  }
  const fullPath = getFullPath(currentSlug)
  const globOptions = {
    cwd: fullPath,
    withFileTypes: true,
  }
  if (isPathIndex(fullPath)) {
    globOptions.exclude = [`${INDEX_PAGE_NAME}.md`]
  }
  try {
    const results = new Set<string>()
    for await (const entry of fs.glob("*", globOptions)) {
      if (entry.isFile() && path.extname(entry.name) === ".md") {
        const slug = path.basename(entry.name, ".md")
        if (isValidPageSlugPart(slug))
          results.add(slug)
      } else if (!entry.isFile()) {
        const slug = path.basename(entry.name)
        if (isValidPageSlugPart(slug))
          results.add(slug)
      }
    }
    return results.values().toArray()
  } catch (err) {
    if (err.code === "ENOENT") {
      if (isPathIndex(fullPath) || await doesFileExist(`${fullPath}.md`)) {
        return []
      }
      throw new AppError(
        `given page slug does not exist: '${currentSlug}'`,
        AppErrorCode.NotFound,
        { cause: err })
    }
    throw err
  }
}

/**
 * Get asset slugs (relative to parent) for given page slug.
 *
 * - Expects a full page slug
 * - Performs slug validation
 */
export async function* getPageAssetsBySlug(currentSlug: string): AsyncIterableIterator<string> {
  if (!isValidPageSlugFull(currentSlug, { allowIndex: true })) {
    throw new AppError(`invalid slug given: '${currentSlug}'`, AppErrorCode.Validation)
  }
  const fullPath = getFullPath(currentSlug)
  try {
    const results = fs.glob("*", {
      cwd: fullPath,
      exclude: ["*.md"],
      withFileTypes: true
    })
    for await (const entry of results) {
      if (entry.isFile() && isValidAssetSlugPart(entry.name)) {
        yield entry.name
      }
    }
  } catch (err) {
    if (err.code === "ENOENT") {
      if (isPathIndex(fullPath) || await doesFileExist(`${fullPath}.md`)) {
        return
      }
      throw new AppError(
        `given page slug does not exist: '${currentSlug}'`,
        AppErrorCode.NotFound,
        { cause: err })
    }
    throw err
  }
}

/**
 * Create a new page under given parent slug.
 *
 * - Parent slug will be created if does not exist
 * - Performs slug validation
 */
export async function createPage(parentSlug: string, slug: string, metadata: object) {
  if (!isValidPageSlugFull(parentSlug, { allowIndex: true })) {
    throw new AppError(`invalid slug given: '${parentSlug}'`, AppErrorCode.Validation)
  } else if (!isValidPageSlugPart(slug)) {
    throw new AppError(`invalid slug given: '${slug}'`, AppErrorCode.Validation)
  } else if (parentSlug === "" && slug === INDEX_PAGE_NAME) {
    throw new AppError(`invalid slug given: '${slug}'`, AppErrorCode.Validation)
  }
  const rawContent = matter.stringify("", metadata)
  if (parentSlug !== "") {
    await fs.mkdir(getFullPath(parentSlug), { recursive: true })
  }
  const fullSlug = parentSlug === "" ? slug : `${parentSlug}/${slug}`
  const pathSuffix = fullSlug === ""
    ? `/${INDEX_PAGE_NAME}.md`
    : ".md"
  const fullPath = `${getFullPath(fullSlug)}${pathSuffix}`
  try {
    await fs.writeFile(fullPath, rawContent, { flag: "wx" })
  } catch (err) {
    if (err.code === "EEXIST") {
      throw new AppError(
        `page already exists with that slug: ${slug}`,
        AppErrorCode.Conflict,
        { cause: err })
    }
  }
  return fullSlug
}

/**
 * Create a new asset under given parent page slug.
 *
 * - Parent slug will be created if does not exist
 * - Performs slug validation
 */
export async function createAsset(parentSlug: string, slug: string, rawContent: Blob) {
  if (!isValidPageSlugFull(parentSlug, { allowIndex: true })) {
    throw new AppError(`invalid slug given: '${parentSlug}'`, AppErrorCode.Validation)
  } else if (!isValidAssetSlugPart(slug)) {
    throw new AppError(`invalid slug given: '${slug}'`, AppErrorCode.Validation)
  }
  const parentFullPath = getFullPath(parentSlug)
  const fullPath = `${parentFullPath}/${slug}`
  await fs.mkdir(parentFullPath, { recursive: true })
  try {
    await fs.writeFile(fullPath, await rawContent.bytes(), { flag: "wx" })
  }
  catch (err) {
    if (err.code === "EEXIST") {
      throw new AppError(
        `asset already exists with that slug: ${slug}`,
        AppErrorCode.Conflict,
        { cause: err })
    }
  }
}

/**
 * Get the raw page content at given page slug.
 *
 * - Performs slug validation
 */
export async function getPageContentRaw(fullSlug: string) {
  if (!isValidPageSlugFull(fullSlug, { allowIndex: true })) {
    throw new AppError(`invalid slug given: '${fullSlug}'`, AppErrorCode.Validation)
  }
  const fullPath = getFullPath(fullSlug)
  if (isPathIndex(fullPath)) {
    try {
      return await fs.readFile(`${fullPath}/${INDEX_PAGE_NAME}.md`)
    } catch (err) {
      if (err.code === "ENOENT") {
        return Buffer.alloc(0)
      }
      throw err
    }
  }
  try {
    return await fs.readFile(`${fullPath}.md`)
  } catch (err) {
    if (err.code === "ENOENT") {
      try {
        const stat = await fs.stat(fullPath)
        if (stat.isDirectory()) {
          return Buffer.alloc(0)
        }
      } catch (err) {
        if (err.code === "ENOENT") {
          throw new AppError(
            `given page slug does not exist: '${fullSlug}'`,
            AppErrorCode.NotFound,
            { cause: err })
        }
        throw err
      }
    }
    throw err
  }
}

/**
 * Write raw page content to given page slug.
 *
 * - Will overwrite existing file
 * - Will error if parent does not exist
 * - Performs slug validation
 */
export async function writePageContentRaw(fullSlug: string, rawContent: string) {
  if (!isValidPageSlugFull(fullSlug, { allowIndex: true })) {
    throw new AppError(`invalid slug given: '${fullSlug}'`, AppErrorCode.Validation)
  }
  const pathSuffix = fullSlug === ""
    ? `/${INDEX_PAGE_NAME}.md`
    : ".md"
  const fullPath = `${getFullPath(fullSlug)}${pathSuffix}`
  await fs.writeFile(fullPath, rawContent)
}

export interface PageContentParts {
  content: string
  metadata: object
}

/**
 * Get the page content, split into content and metadata.
 *
 * - internally calls `getPageContentRaw()`
 */
export async function getPageContentParts(fullSlug: string): Promise<PageContentParts> {
  const contentRaw = await getPageContentRaw(fullSlug)
  const out = matter(contentRaw)
  return {
    content: out.content,
    metadata: out.data,
  }
}

/**
 * Get the page content rendered as HTML.
 *
 * - internally calls `getPageContentRaw()`
 */
export async function getPageContentAsHTML(fullSlug: string): Promise<string> {
  return await renderMarkdown(await getPageContentRaw(fullSlug))
}

/**
 * Write page content and given metadata.
 *
 * - internally calls `writePageContentRaw()`
 */
export async function writePageContentParts(fullSlug: string, contentParts: PageContentParts) {
  const contentRaw = matter.stringify(contentParts.content, contentParts.metadata)
  writePageContentRaw(fullSlug, contentRaw)
}

/**
 * Rename a page, moving assets and any child pages.
 *
 * - Prevents renaming of index
 * - Performs slug validation
 */
export async function renamePage(currentFullSlug: string, newFullSlug: string) {
  if (!isValidPageSlugFull(currentFullSlug, { allowIndex: false })) {
    throw new AppError(`invalid slug given: '${currentFullSlug}'`, AppErrorCode.Validation)
  } else if (!isValidPageSlugFull(newFullSlug, { allowIndex: false })) {
    throw new AppError(`invalid slug given: '${newFullSlug}'`, AppErrorCode.Validation)
  } else if (newFullSlug === INDEX_PAGE_NAME) {
    throw new AppError(`invalid slug given: '${newFullSlug}'`, AppErrorCode.Validation)
  }
  const currentFullPath = getFullPath(currentFullSlug)
  const newFullPath = getFullPath(newFullSlug)
  // check if page already exists at new location
  if (await doesFileExist(`${newFullPath}.md`)) {
    throw new AppError(
      `cannot overwrite existing page: ${newFullSlug}`,
      AppErrorCode.Conflict)
  }
  // create parent folders
  await fs.mkdir(path.dirname(newFullPath), { recursive: true })
  // move page
  try {
    await fs.rename(`${currentFullPath}.md`, `${newFullPath}.md`)
  } catch { }
  try {
    // move page children
    await fs.rename(`${currentFullPath}`, `${newFullPath}`)
  } catch { }
}

/**
 * Delete a page, including assets and child pages.
 *
 * - Prevents deletion of index
 * - Performs slug validation
 */
export async function deletePage(fullSlug: string) {
  if (!isValidPageSlugFull(fullSlug, { allowIndex: false })) {
    throw new AppError(`invalid slug given: '${fullSlug}'`, AppErrorCode.Validation)
  }
  const fullPath = getFullPath(fullSlug)
  await Promise.allSettled([
    fs.rm(`${fullPath}.md`, { force: true }),
    fs.rm(fullPath, { recursive: true, force: true }),
  ])
}

/**
 * Delete an asset.
 *
 * - Prevents page deletion
 * - Performs slug validation
 */
export async function deleteAsset(fullSlug: string) {
  if (!isValidAssetSlugFull(fullSlug)) {
    throw new AppError(`invalid slug given: '${fullSlug}'`, AppErrorCode.Validation)
  }
  const fullPath = getFullPath(fullSlug)
  if (path.extname(fullPath) === ".md") {
    throw new AppError(`cannot delete pages: ${fullSlug}`, AppErrorCode.Validation)
  }
  await fs.rm(fullPath, { force: true })
}

/**
 * Read raw file content from given slug.
 *
 * - Expects a slug with extension
 * - Can return raw markdown by using `.md`
 * - Performs slug validation
 */
export async function getRawContent(fullSlug: string) {
  if (!isValidAssetSlugFull(fullSlug)) {
    throw new AppError(`invalid slug given: '${fullSlug}'`, AppErrorCode.Validation)
  }
  const fullPath = getFullPath(fullSlug)
  try {
    return await fs.readFile(fullPath)
  } catch (err) {
    if (err.code === "ENOENT") {
      throw new AppError(
        `given asset slug does not exist: '${fullSlug}'`,
        AppErrorCode.NotFound,
        { cause: err })
    }
    throw err
  }
}
