import { NextResponse } from "next/server"
import { del } from "@vercel/blob"
import { redis } from "@/lib/redis"

export async function DELETE(request: Request, { params }: { params: { id: string } }) {
  try {
    const { id } = params

    // Get track data
    const trackData = await redis.hgetall(`music:${id}`)

    if (!trackData) {
      return NextResponse.json({ message: "Track not found" }, { status: 404 })
    }

    // Delete audio file from blob storage
    if (trackData.blobUrl) {
      try {
        await del(trackData.blobUrl)
      } catch (error) {
        console.error("Failed to delete blob:", error)
      }
    }

    // Remove from Redis
    await redis.del(`music:${id}`)

    // Remove from user's music collection
    if (trackData.userId) {
      await redis.zrem(`user:${trackData.userId}:music`, id)
      await redis.zrem(`user:${trackData.userId}:favorites`, id)
    }

    // Remove from global collections
    await redis.zrem("recent:music", id)
    if (trackData.genre) {
      await redis.zrem(`genre:${trackData.genre.toLowerCase()}`, id)
    }

    // Update user stats
    if (trackData.userId) {
      await redis.hincrby(`user:${trackData.userId}:stats`, "totalTracks", -1)
      await redis.hincrby(`user:${trackData.userId}:stats`, "totalDuration", -Number(trackData.duration || 0))
    }

    return NextResponse.json({ message: "Track deleted successfully" })
  } catch (error) {
    console.error("Error deleting track:", error)
    return NextResponse.json({ message: "Failed to delete track" }, { status: 500 })
  }
}
