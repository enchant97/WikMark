import type { NextRequest } from 'next/server'
import { joinSlugParts } from "@/lib/helpers"
import { AppError } from '@/lib/errors'
import { getAssetTree } from '@/lib/data/explore'

export async function GET(_req: NextRequest, ctx: RouteContext<"/api/explore/asset-tree/-/[[...slug]]">) {
  const { slug } = await ctx.params
  const fullSlug = joinSlugParts(slug)
  try {
    const names = await Array.fromAsync(getAssetTree(fullSlug))
    return Response.json(names)
  } catch (err) {
    if (err instanceof AppError) {
      return err.intoResponse()
    }
    throw err
  }
}
