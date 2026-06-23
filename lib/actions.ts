"use server"

import { createPage, getChildrenBySlug, getPageContentParts, renamePage, writePageContentParts } from "@/lib/data"

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

export async function updatePageSettingsAction(_prevState: unknown, formData: FormData) {
  const currentFullSlug = formData.get("currentFullSlug")
  const newFullSlug = formData.get("newFullSlug")
  const title = formData.get("title")
  // guard against moving home path
  if (
    (currentFullSlug === "" && newFullSlug !== "") ||
    (currentFullSlug !== "" && newFullSlug === "")) {
    return {
      success: false,
    }
  }
  // update metadata
  const pageParts = await getPageContentParts(currentFullSlug)
  Object.assign(pageParts.metadata, { ...pageParts.metadata, title })
  await writePageContentParts(currentFullSlug, pageParts)
  // perform rename if required
  if (currentFullSlug !== newFullSlug) {
    await renamePage(currentFullSlug, newFullSlug)
  }
  return {
    success: true,
    newFullSlug,
  }
}
