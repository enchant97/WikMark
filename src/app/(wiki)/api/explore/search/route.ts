import { getSearchResults } from "@/lib/search/db";
import { NextRequest, NextResponse } from "next/server";

const DEFAULT_LIMIT = 12

export async function GET(req: NextRequest, _ctx: RouteContext<"/api/explore/search">) {
  const q = req.nextUrl.searchParams.get("q") || ""
  const parsedLimit = Number.parseInt(req.nextUrl.searchParams.get("limit") ?? "", 10)
  const limit = Number.isFinite(parsedLimit) && parsedLimit > 0
    ? Math.min(parsedLimit, DEFAULT_LIMIT)
    : DEFAULT_LIMIT
  const results = getSearchResults(q, limit)
  return NextResponse.json(results)
}
