import type { NextRequest } from 'next/server'
import { joinSlugParts } from "@/lib/helpers"
import { getRawContent } from '@/lib/data'

export async function GET(_req: NextRequest, ctx: RouteContext<"/api/raw/[...slug]">) {
  const { slug } = await ctx.params
  const fullSlug = joinSlugParts(slug)
  const rawContent = await getRawContent(fullSlug)
  return new Response(rawContent, {
    headers: {
      "Content-Disposition": `inline; filename=${slug.at(-1)}`,
      "Content-Security-Policy": "default-src 'none'; style-src 'unsafe-inline'; sandbox",
      "X-Frame-Options": "SAMEORIGIN",
      // TODO add mimetype detection, also don't forget:
      //      "X-Content-Type-Options": "nosniff",
    }
  })
}
