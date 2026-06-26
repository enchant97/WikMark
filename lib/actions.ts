"use server"

import { createAsset, createPage, deleteAsset, deletePage, getChildrenBySlug, getPageAssetsBySlug, getPageContentParts, renamePage, writePageContentParts } from "@/lib/data"
import { revalidatePath } from "next/cache"

export async function getRelPageSlugs(parentSlug: string): Promise<string[]> {
  return await getChildrenBySlug(parentSlug)
}

export async function getPageAssets(fullSlug: string): Promise<string[]> {
  return await Array.fromAsync(getPageAssetsBySlug(fullSlug))
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

export async function createAssetAction(_prevState: unknown, formData: FormData) {
  const parentSlug = formData.get("parentSlug")?.toString()
  const file = formData.get("file")?.valueOf() as File
  await createAsset(parentSlug, file.name, file)
  revalidatePath("/assets")
  return {
    success: true,
    slug: file.name,
  }
}

export async function updatePageContentsAction(
  _prevState: unknown,
  payload: {
    fullSlug: string,
    content: string,
    metadata: object,
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

export async function deletePageAction(_prevState: unknown, payload: { fullSlug: string }) {
  if (payload.fullSlug === "") {
    return { success: false }
  }
  await deletePage(payload.fullSlug)
  return { success: true }
}

export async function deleteAssetAction(_prevState: unknown, payload: { fullSlug: string }) {
  await deleteAsset(payload.fullSlug)
  revalidatePath("/assets")
  return { success: true }
}
