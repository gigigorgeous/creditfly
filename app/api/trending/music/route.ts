import { NextResponse } from "next/server"
import { getTrendingMusic } from "@/lib/redis"

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const limit = Number.parseInt(searchParams.get("limit") || "10")

    // Get trending music from Redis
    const trendingMusic = await getTrendingMusic(limit)

    return NextResponse.json(trendingMusic)
  } catch (error) {
    console.error("Error getting trending music:", error)
    return NextResponse.json({ error: "Failed to get trending music" }, { status: 500 })
  }
}
