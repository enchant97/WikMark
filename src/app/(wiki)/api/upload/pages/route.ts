import { auth } from '@/lib/auth'
import { writePageContentParts } from '@/lib/data/page'
import { AppError, AppErrorCode } from '@/lib/errors'
import { parsePageMetadata } from '@/lib/types'
import { headers } from 'next/headers'
import type { NextRequest } from 'next/server'
import { after } from 'node:test'
import * as indexer from "@/lib/search/indexer"
import * as searchDb from "@/lib/search/db"

export async function POST(req: NextRequest) {
  const formData = await req.formData()
  const fullSlug = formData.get("fullSlug")?.toString()
  const content = formData.get("content")?.toString()
  const rawMetadata = formData.get("metadata")?.toString()

  if ((await auth.api.getSession({ headers: await headers() })) === null) {
    return Response.json({
      error: {
        code: AppErrorCode.Unauthorized,
        message: "this action requires authentication",
      }
    }, {
      status: 401,
      headers: { "Content-Type": "application/x.wikmark.error+json" },
    })
  }

  try {
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
      return Response.json({ error: err.intoDTO() }, {
        status: 400,
        headers: { "Content-Type": "application/x.wikmark.error+json" },
      })
    }
    throw err
  }
}
