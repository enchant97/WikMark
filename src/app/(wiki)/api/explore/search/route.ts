import { getSearchResults } from "@/lib/search/db";
import { NextRequest, NextResponse } from "next/server";

const DEFAULT_LIMIT = 12

export async function GET(req: NextRequest, _ctx: RouteContext<"/api/explore/search">) {
  const q = req.nextUrl.searchParams.get("q") || ""
  const limit = Math.min(DEFAULT_LIMIT, Number.parseInt(req.nextUrl.searchParams.get("limit") || "", 10) || 0) || DEFAULT_LIMIT
  const results = getSearchResults(q, limit)
  return NextResponse.json(results)
}
