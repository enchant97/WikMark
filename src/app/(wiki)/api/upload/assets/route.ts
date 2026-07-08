import { throwIfUnauthorized } from '@/lib/auth'
import { createAsset } from '@/lib/data/asset'
import { AppError, AppErrorCode } from '@/lib/errors'
import { revalidatePath } from 'next/cache'
import type { NextRequest } from 'next/server'

export async function POST(req: NextRequest) {
  const formData = await req.formData()
  const parentSlug = formData.get("parentSlug")?.toString()
  const file = formData.get("file")?.valueOf()

  try {
    await throwIfUnauthorized()
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
      return err.intoResponse()
    }
    throw err
  }
}
