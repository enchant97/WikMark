import rehypeSanitize from "rehype-sanitize"
import rehypeStringify from "rehype-stringify"
import remarkFrontmatter from "remark-frontmatter"
import remarkGfm from "remark-gfm"
import remarkParse from "remark-parse"
import remarkRehype from "remark-rehype"
import { unified } from "unified"
import remarkUrlTransformer from "./remarkUrlTransformer"
import remarkIndexable from "./remarkIndexable"
import { PageMetadata } from "./types"

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
  const parts = parentSlug.split("/")
  if (parts[0] == "") { parts.pop() }
  return joinSlugParts([...parts, assetSlug])
}

export function isValidPageSlugPart(slug: string, options?: { allowIndex?: boolean }): boolean {
  if (slug === "" && options?.allowIndex) { return true }
  const pageSlugRegex = /^[a-zA-Z0-9-_]+$/
  return pageSlugRegex.test(slug)
}

export function isValidAssetSlugPart(slug: string): boolean {
  const assetSlugRegex = /^[a-zA-Z0-9-_]*(?:\.[a-zA-Z0-9]+)+$/
  return assetSlugRegex.test(slug)
}

export function isValidPageSlugFull(slug: string, options?: { allowIndex?: boolean }): boolean {
  if (slug === "" && options?.allowIndex) { return true }
  const parts = slug.split("/")
  for (const part of parts) {
    if (!isValidPageSlugPart(part)) { return false }
  }
  return true
}

export function isValidAssetSlugFull(slug: string): boolean {
  const parts = slug.split("/")
  const end = parts.pop()
  for (const part of parts) {
    if (!isValidPageSlugPart(part)) { return false }
  }
  return isValidAssetSlugPart(end ?? "")
}

export function intoPageSlugPart(v: string): string {
  return v.replaceAll(" ", "-").replaceAll(/[^a-zA-Z0-9-_]/g, "")
}

export function intoPageSlug(v: string): string {
  return v.replaceAll(" ", "-").replaceAll(/[^a-zA-Z0-9-_/]/g, "")
}

/**
 * Transform relative paths into correct format
 */
export function pageContentUrlTransformer(url: string, ctx: { baseUrl: string, pageSlug: string }): string {
  if (url.startsWith("http://") || url.startsWith("https://")) {
    return url
  }
  const isRawPathRegex = /^.+\..+$/
  // transform asset link
  if (isRawPathRegex.test(url)) {
    const pageSlug = ctx.pageSlug.endsWith("/") ? ctx.pageSlug : `${ctx.pageSlug}/`
    const rawContentUrlBase = new URL(`/api/raw/${pageSlug}`, ctx.baseUrl)
    return new URL(url, rawContentUrlBase).href
  }
  // transform page link
  return `/-${url.startsWith("/") ? "" : "/"}${url}`
}

export async function renderMarkdown(md: string | Buffer<ArrayBuffer>, ctx: { baseUrl: string, pageSlug: string }) {
  return String(await unified()
    .use(remarkParse)
    .use(remarkFrontmatter)
    .use(remarkGfm)
    .use(remarkUrlTransformer, { transformer: (url) => pageContentUrlTransformer(url, ctx) })
    .use(remarkRehype)
    .use(rehypeSanitize)
    .use(rehypeStringify)
    .process(md))
}

export async function renderToIndexable(md: string | Buffer<ArrayBuffer>) {
  return String(await unified()
    .use(remarkParse)
    .use(remarkFrontmatter)
    .use(remarkGfm)
    .use(remarkIndexable)
    .process(md))
}

export function makePageTitle(slugParts?: string[], metadata?: PageMetadata): string {
  return metadata?.title ?? (slugParts?.at(-1) ?? "Home")
}
