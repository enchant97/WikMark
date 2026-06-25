import rehypeSanitize from "rehype-sanitize"
import rehypeStringify from "rehype-stringify"
import remarkFrontmatter from "remark-frontmatter"
import remarkGfm from "remark-gfm"
import remarkParse from "remark-parse"
import remarkRehype from "remark-rehype"
import { unified } from "unified"
import env from "@/env"
import remarkUrlTransformer from "./remarkUrlTransformer"

export function joinSlugParts(parts?: string[]): string {
  return (parts ?? []).join("/")
}

/**
 * Return last element of given slug parts
 */
export function slugPartsBase(parts?: string[]): string {
  return ((parts ?? []).at(-1) ?? "")
}

export function makeFullAssetSlug(parentSlug: string, assetSlug: string): string {
  let parts = parentSlug.split("/")
  if (parts[0] == "") { parts.pop() }
  return joinSlugParts([...parts, assetSlug])
}

/**
 * Transform relative raw content oaths into correct api path
 */
export function pageContentUrlTransformer(url: string): string {
  const rawContentUrlBase = new URL("/api/raw/", env.NEXT_PUBLIC_PUBLIC_URL)
  const isRawPathRegex = /^.+\..+$/
  if (isRawPathRegex.test(url)) {
    return new URL(url.replace(/^\//, ""), rawContentUrlBase).href
  }
  return url
}

export async function renderMarkdown(md: string | Buffer<ArrayBuffer>) {
  return String(await unified()
    .use(remarkParse)
    .use(remarkFrontmatter)
    .use(remarkGfm)
    .use(remarkUrlTransformer, { transformer: pageContentUrlTransformer })
    .use(remarkRehype)
    .use(rehypeSanitize)
    .use(rehypeStringify)
    .process(md))
}
