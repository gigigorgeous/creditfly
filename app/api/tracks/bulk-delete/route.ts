import { NextResponse } from "next/server"
import { del } from "@vercel/blob"
import { redis } from "@/lib/redis"

export async function POST(request: Request) {
  try {
    const { trackIds } = await request.json()

    if (!Array.isArray(trackIds) || trackIds.length === 0) {
      return NextResponse.json({ message: "Invalid track IDs" }, { status: 400 })
    }

    const results = []

    for (const trackId of trackIds) {
      try {
        // Get track data
        const trackData = await redis.hgetall(`music:${trackId}`)

        if (trackData) {
          // Delete audio file from blob storage
          if (trackData.blobUrl) {
            try {
              await del(trackData.blobUrl)
            } catch (error) {
              console.error(`Failed to delete blob for track ${trackId}:`, error)
            }
          }

          // Remove from Redis
          await redis.del(`music:${trackId}`)

          // Remove from user's collections
          if (trackData.userId) {
            await redis.zrem(`user:${trackData.userId}:music`, trackId)
            await redis.zrem(`user:${trackData.userId}:favorites`, trackId)

            // Update user stats
            await redis.hincrby(`user:${trackData.userId}:stats`, "totalTracks", -1)
            await redis.hincrby(`user:${trackData.userId}:stats`, "totalDuration", -Number(trackData.duration || 0))
          }

          // Remove from global collections
          await redis.zrem("recent:music", trackId)
          if (trackData.genre) {
            await redis.zrem(`genre:${trackData.genre.toLowerCase()}`, trackId)
          }

          results.push({ trackId, success: true })
        } else {
          results.push({ trackId, success: false, error: "Track not found" })
        }
      } catch (error) {
        console.error(`Error deleting track ${trackId}:`, error)
        results.push({ trackId, success: false, error: "Delete failed" })
      }
    }

    const successCount = results.filter((r) => r.success).length
    const failureCount = results.filter((r) => !r.success).length

    return NextResponse.json({
      message: `Deleted ${successCount} tracks successfully${failureCount > 0 ? `, ${failureCount} failed` : ""}`,
      results,
    })
  } catch (error) {
    console.error("Bulk delete error:", error)
    return NextResponse.json({ message: "Bulk delete failed" }, { status: 500 })
  }
}
