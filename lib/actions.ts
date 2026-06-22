"use server"

import { getChildrenBySlug, writePageContentParts } from "@/lib/data"

export async function getRelPageSlugs(parentSlug: string): Promise<string[]> {
  return await Array.fromAsync(getChildrenBySlug(parentSlug))
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
