import path from "node:path";
import * as fs from "node:fs/promises";
import { isValidAssetSlugFull, isValidAssetSlugPart, isValidPageSlugFull, } from "@/lib/helpers";
import { AppError, AppErrorCode } from "@/lib/errors";
import { doesDirExist, doesFileExist, getFullPath, isPathIndex } from "./helpers";

/**
 * Get asset slugs (relative to parent) for given page slug.
 *
 * - Expects a full page slug
 * - Performs slug validation
 *
 * @deprecated replace usage with `@lib/data/explore/getAssetTree`
 */
export async function* getPageAssetsBySlug(currentSlug: string): AsyncIterableIterator<string> {
  // TODO replace usage with `@lib/data/explore/getAssetTree`
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
      if (path.extname(fullPath) === ".md") {
        if (
          isPathIndex(fullPath) ||
          await doesDirExist(path.join(path.dirname(fullPath), path.basename(fullPath, ".md")))
        ) {
          return Buffer.alloc(0)
        }
      }
      throw new AppError(
        `given asset slug does not exist: '${fullSlug}'`,
        AppErrorCode.NotFound,
        { cause: err })
    }
    throw err
  }
}
