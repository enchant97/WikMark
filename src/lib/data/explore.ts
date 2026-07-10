import * as fs from "node:fs/promises";
import path from "node:path";
import { AppError, AppErrorCode } from "@/lib/errors";
import { isValidAssetSlugPart, isValidPageSlugFull, isValidPageSlugPart } from "@/lib/helpers";
import { doesFileExist, getFullPath, INDEX_PAGE_NAME, isPathIndex } from "./helpers";

/**
 * Get the child page slugs (relative to parent) for given parent slug.
 *
 * - Expects a full page slug
 * - Performs slug validation
 */
export async function getPageTree(currentSlug: string): Promise<string[]> {
  if (!isValidPageSlugFull(currentSlug, { allowIndex: true })) {
    throw new AppError(`invalid slug given: '${currentSlug}'`, AppErrorCode.Validation)
  }
  const fullPath = getFullPath(currentSlug)
  try {
    const pages = new Set<string>()
    const entries = await fs.readdir(fullPath, { withFileTypes: true })
    for (const entry of entries) {
      if (entry.isFile() && path.extname(entry.name) === ".md") {
        const pageSlug = path.basename(entry.name, ".md")
        if (isValidPageSlugPart(pageSlug)) {
          if (pageSlug !== INDEX_PAGE_NAME) {
            pages.add(pageSlug)
          }
        }
      } else if (entry.isDirectory()) {
        const pageSlug = path.basename(entry.name)
        if (isValidPageSlugPart(pageSlug)) {
          pages.add(pageSlug)
        }
      }
    }
    return Array.from(pages)
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
export async function* getAssetTree(currentSlug: string): AsyncIterableIterator<string> {
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
