import path from "node:path";
import { Glob } from "bun";
import env from "@/env";
import { stat } from "node:fs/promises";

const scanPagesGlob = new Glob("*.md")

function isPathInside(child: string, parent: string): boolean {
  const relative = path.relative(parent, child)
  return relative !== "" && !relative.startsWith("..") && !path.isAbsolute(relative)
}

export async function* getChildrenBySlug(currentSlug: string): AsyncIterableIterator<string> {
  const fullPath = path.join(env.WIKI_PATH, path.normalize(currentSlug))
  if (fullPath !== env.WIKI_PATH && !isPathInside(fullPath, env.WIKI_PATH)) {
    throw new Error(`path traversal attempt at: ${fullPath}`)
  }
  try {
    const results = scanPagesGlob.scan({
      cwd: fullPath,
      onlyFiles: true,
    })
    for await (const filename of results) {
      yield path.basename(filename, ".md")
    }
  } catch (err) {
    if (!(await stat(`${fullPath}.md`)).isFile) {
      throw err
    }
  }
}
