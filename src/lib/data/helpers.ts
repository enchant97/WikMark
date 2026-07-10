import path from "node:path";
import env from "@/env";
import * as fs from "node:fs/promises";
import { AppError, AppErrorCode } from "@/lib/errors";

export const INDEX_PAGE_NAME = "_index"

export async function doesFileExist(fullPath: string): Promise<boolean> {
  try {
    if (!(await fs.stat(fullPath)).isFile()) {
      return false
    }
  } catch (err) {
    if (err.code === "ENOENT") { return false }
    throw err
  }
  return true
}

export async function doesDirExist(fullPath: string): Promise<boolean> {
  try {
    if (!(await fs.stat(fullPath)).isDirectory()) {
      return false
    }
  } catch (err) {
    if (err.code === "ENOENT") { return false }
    throw err
  }
  return true
}

export function isPathInside(child: string, parent: string): boolean {
  const relative = path.relative(parent, child)
  return relative !== "" && !relative.startsWith("..") && !path.isAbsolute(relative)
}

export function isPathIndex(fullPath: string): boolean {
  return fullPath === env.WIKI_PATH
}

/**
 * Get the absolute system path for given slug.
 *
 * - Assumes slug has been validated
 * - Will prevent path traversal outside of `WIKI_PATH`
 * - Must NOT be passed to client
 */
export function getFullPath(currentSlug: string): string {
  const fullPath = path.join(env.WIKI_PATH, path.normalize(currentSlug))
  if (fullPath !== env.WIKI_PATH && !isPathInside(fullPath, env.WIKI_PATH)) {
    console.warn(`path traversal attempt at: '${fullPath}'`)
    throw new AppError(`invalid slug given: '${currentSlug}'`, AppErrorCode.Validation)
  }
  return fullPath
}
