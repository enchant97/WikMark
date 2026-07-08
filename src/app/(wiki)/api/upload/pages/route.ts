import { throwIfUnauthorized } from '@/lib/auth'
import { writePageContentParts } from '@/lib/data/page'
import { AppError, AppErrorCode } from '@/lib/errors'
import { parsePageMetadata } from '@/lib/types'
import type { NextRequest } from 'next/server'
import { after } from 'node:test'
import * as indexer from "@/lib/search/indexer"
import * as searchDb from "@/lib/search/db"

export async function POST(req: NextRequest) {
  const formData = await req.formData()
  const fullSlug = formData.get("fullSlug")?.toString()
  const content = formData.get("content")?.toString()
  const rawMetadata = formData.get("metadata")?.toString()

  try {
    await throwIfUnauthorized()
    if (fullSlug === undefined || content === undefined || rawMetadata === undefined) {
      throw new AppError("form missing required fields", AppErrorCode.Validation)
    }
    const pageContentParts = {
      content,
      metadata: {
        ...parsePageMetadata(JSON.parse(rawMetadata)),
        updatedAt: (new Date()).toISOString(),
      },
    }
    await writePageContentParts(fullSlug, pageContentParts)
    after(async () => {
      const indexedPage = await indexer.indexPageFromParts(fullSlug, pageContentParts)
      searchDb.updateIndexedPage(indexedPage)
    })
    return Response.json({
      success: true,
    }, { status: 200 })
  } catch (err) {
    if (err instanceof AppError) {
      return err.intoResponse()
    }
    throw err
  }
}
