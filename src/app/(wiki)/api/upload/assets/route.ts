import { auth } from '@/lib/auth'
import { createAsset } from '@/lib/data/asset'
import { AppError, AppErrorCode } from '@/lib/errors'
import { revalidatePath } from 'next/cache'
import { headers } from 'next/headers'
import type { NextRequest } from 'next/server'

export async function POST(req: NextRequest) {
  const formData = await req.formData()
  const parentSlug = formData.get("parentSlug")?.toString()
  const file = formData.get("file")?.valueOf()

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
    if (parentSlug === undefined || (file === undefined || !(file instanceof File))) {
      throw new AppError("form missing required fields", AppErrorCode.Validation)
    }
    await createAsset(parentSlug, file.name, file)
    revalidatePath(`/assets/${parentSlug}`)
    return Response.json({
      success: true,
      slug: file.name,
    }, { status: 201 })
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
