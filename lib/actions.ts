"use server"

import { createPage, getChildrenBySlug, writePageContentParts } from "@/lib/data"

export async function getRelPageSlugs(parentSlug: string): Promise<string[]> {
  return await Array.fromAsync(getChildrenBySlug(parentSlug))
}

export async function createPageAction(_prevState: unknown, formData: FormData) {
  const parentSlug = formData.get("parentSlug")
  const slug = formData.get("slug")
  const title = formData.get("title")
  const fullSlug = await createPage(parentSlug, slug, { title })
  return {
    success: true,
    fullSlug,
  }
}

export async function updatePageContentsAction(
  _prevState: unknown,
  payload: {
    fullSlug: string,
    content: string,
    metadata: Object,
  },
) {
  await writePageContentParts(payload.fullSlug, {
    content: payload.content,
    metadata: payload.metadata,
  })
  return payload.content
}
