"use server"

import { revalidatePath } from "next/cache"
import { createPage, deletePage, getChildrenBySlug, getPageContentParts, renamePage, writePageContentParts } from "@/lib/data/page"
import { createAsset, deleteAsset, getPageAssetsBySlug } from "@/lib/data/asset"
import { AppError, AppErrorCode } from "./errors"
import { auth } from "./auth"
import { headers } from "next/headers"
import { after } from "next/server"
import * as indexer from "@/lib/search/indexer"
import * as searchDb from "@/lib/search/db"

async function isAuthenticated(): Promise<boolean> {
  return (await auth.api.getSession({ headers: await headers() })) !== null
}

function throwUnauthorized(): never {
  throw new AppError("this action requires an account", AppErrorCode.Unauthorized)
}

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
    if (!await isAuthenticated()) { throwUnauthorized() }
    if (parentSlug === undefined || slug === undefined || title === undefined) {
      throw new AppError("form missing required fields", AppErrorCode.Validation)
    }
    parentSlug = parentSlug.split("/").filter(v => v !== "").join("/")
    const fullSlug = await createPage(parentSlug, slug, { title })
    after(() => {
      const indexedPage = indexer.indexPageFromNew(fullSlug, { title })
      searchDb.updateIndexedPage(indexedPage)
    })
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
    if (!await isAuthenticated()) { throwUnauthorized() }
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
    if (!await isAuthenticated()) { throwUnauthorized() }
    const pageContentParts = {
      content: payload.content,
      metadata: payload.metadata,
    }
    await writePageContentParts(payload.fullSlug, pageContentParts)
    after(async () => {
      const indexedPage = await indexer.indexPageFromParts(payload.fullSlug, pageContentParts)
      searchDb.updateIndexedPage(indexedPage)
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
    if (!await isAuthenticated()) { throwUnauthorized() }
    if (currentFullSlug === undefined || newFullSlug === undefined || title === undefined) {
      throw new AppError("form missing required fields", AppErrorCode.Validation)
    }
    newFullSlug = newFullSlug.split("/").filter(v => v !== "").join("/")
    // update metadata
    const pageParts = await getPageContentParts(currentFullSlug)
    Object.assign(pageParts.metadata, { ...pageParts.metadata, title })
    await writePageContentParts(currentFullSlug, pageParts)
    const isRenaming = currentFullSlug !== newFullSlug
    // perform rename if required
    if (isRenaming) {
      await renamePage(currentFullSlug, newFullSlug)
    }
    after(() => {
      if (isRenaming) {
        searchDb.renameIndexedPage(currentFullSlug, newFullSlug)
      }
      searchDb.updateIndexedPageMetadata(newFullSlug, pageParts.metadata)
    })
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
    if (!await isAuthenticated()) { throwUnauthorized() }
    await deletePage(payload.fullSlug)
    after(() => {
      searchDb.deleteIndexedPage(payload.fullSlug)
    })
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
    if (!await isAuthenticated()) { throwUnauthorized() }
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

export async function getSearchResults(query: string) {
  return searchDb.getSearchResults(query, 12)
}
