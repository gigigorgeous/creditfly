import { NextResponse } from "next/server"
import { redis } from "@/lib/redis"

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const userId = searchParams.get("userId")
    const limit = Number.parseInt(searchParams.get("limit") || "50")
    const offset = Number.parseInt(searchParams.get("offset") || "0")

    let tracks = []

    if (userId) {
      // Get user's specific tracks
      const userMusicIds = await redis.zrange(`user:${userId}:music`, offset, offset + limit - 1, { rev: true })

      if (userMusicIds.length > 0) {
        tracks = await Promise.all(
          userMusicIds.map(async (id) => {
            const musicData = await redis.hgetall(`music:${id}`)
            return musicData ? { id, ...musicData } : null
          }),
        )
        tracks = tracks.filter(Boolean)
      }
    } else {
      // Get all recent tracks
      const recentMusicIds = await redis.zrange("recent:music", offset, offset + limit - 1, { rev: true })

      if (recentMusicIds.length > 0) {
        tracks = await Promise.all(
          recentMusicIds.map(async (id) => {
            const musicData = await redis.hgetall(`music:${id}`)
            return musicData ? { id, ...musicData } : null
          }),
        )
        tracks = tracks.filter(Boolean)
      }
    }

    // Get total count
    const totalCount = userId ? await redis.zcard(`user:${userId}:music`) : await redis.zcard("recent:music")

    return NextResponse.json({
      tracks,
      totalCount,
      hasMore: offset + limit < totalCount,
    })
  } catch (error) {
    console.error("Error fetching music library:", error)
    return NextResponse.json({ message: "Failed to fetch library" }, { status: 500 })
  }
}
