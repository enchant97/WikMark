"use server"

import { createAsset, createPage, deleteAsset, deletePage, getChildrenBySlug, getPageAssetsBySlug, getPageContentParts, renamePage, writePageContentParts } from "@/lib/data"
import { revalidatePath } from "next/cache"
import { AppError, AppErrorCode } from "./errors"

export async function getRelPageSlugs(parentSlug: string): Promise<string[]> {
  return await getChildrenBySlug(parentSlug)
}

export async function getPageAssets(fullSlug: string): Promise<string[]> {
  return await Array.fromAsync(getPageAssetsBySlug(fullSlug))
}

export async function createPageAction(_prevState: unknown, formData: FormData) {
  let parentSlug = formData.get("parentSlug")?.toString()
  const slug = formData.get("slug")?.toString()
  const title = formData.get("title")?.toString()
  try {
    if (parentSlug === undefined || slug === undefined || title === undefined) {
      throw new AppError("form missing required fields", AppErrorCode.Validation)
    }
    parentSlug = parentSlug.split("/").filter(v => v !== "").join("/")
    const fullSlug = await createPage(parentSlug, slug, { title })
    return {
      success: true,
      fullSlug,
    }
  } catch (err) {
    if (err instanceof AppError) {
      return { error: err.intoDTO() }
    }
    throw err
  }
}

export async function createAssetAction(_prevState: unknown, formData: FormData) {
  const parentSlug = formData.get("parentSlug")?.toString()
  const file = formData.get("file")?.valueOf()
  try {
    if (parentSlug === undefined || (file === undefined || !(file instanceof File))) {
      throw new AppError("form missing required fields", AppErrorCode.Validation)
    }
    await createAsset(parentSlug, file.name, file)
    revalidatePath("/assets")
    return {
      success: true,
      slug: file.name,
    }
  } catch (err) {
    if (err instanceof AppError) {
      return { error: err.intoDTO() }
    }
    throw err
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
  try {
    await writePageContentParts(payload.fullSlug, {
      content: payload.content,
      metadata: payload.metadata,
    })
    return {
      success: true,
    }
  } catch (err) {
    if (err instanceof AppError) {
      return { error: err.intoDTO() }
    }
    throw err
  }
}

export async function updatePageSettingsAction(_prevState: unknown, formData: FormData) {
  const currentFullSlug = formData.get("currentFullSlug")?.toString()
  let newFullSlug = formData.get("newFullSlug")?.toString()
  const title = formData.get("title")?.toString()
  try {
    if (currentFullSlug === undefined || newFullSlug === undefined || title === undefined) {
      throw new AppError("form missing required fields", AppErrorCode.Validation)
    }
    newFullSlug = newFullSlug.split("/").filter(v => v !== "").join("/")
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
  } catch (err) {
    if (err instanceof AppError) {
      return { error: err.intoDTO() }
    }
    throw err
  }
}

export async function deletePageAction(_prevState: unknown, payload: { fullSlug: string }) {
  try {
    await deletePage(payload.fullSlug)
    return { success: true }
  } catch (err) {
    if (err instanceof AppError) {
      return { error: err.intoDTO() }
    }
    throw err
  }
}

export async function deleteAssetAction(_prevState: unknown, payload: { fullSlug: string }) {
  try {
    await deleteAsset(payload.fullSlug)
    revalidatePath("/assets")
    return {
      success: true,
    }
  }
  catch (err) {
    if (err instanceof AppError) {
      return { error: err.intoDTO() }
    }
    throw err
  }
}
