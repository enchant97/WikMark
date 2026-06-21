"use server"

import { writePageContentParts } from "./data"

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
