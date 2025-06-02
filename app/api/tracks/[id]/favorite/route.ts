import { NextResponse } from "next/server"
import { redis } from "@/lib/redis"

export async function POST(request: Request, { params }: { params: { id: string } }) {
  try {
    const { id } = params
    const { favorite } = await request.json()

    // Update the track's favorite status
    await redis.hset(`music:${id}`, { isFavorite: favorite ? "true" : "false" })

    // Add/remove from user's favorites list if we have user context
    const musicData = await redis.hgetall(`music:${id}`)
    if (musicData.userId) {
      if (favorite) {
        await redis.zadd(`user:${musicData.userId}:favorites`, {
          score: Date.now(),
          member: id,
        })
      } else {
        await redis.zrem(`user:${musicData.userId}:favorites`, id)
      }
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Error updating favorite status:", error)
    return NextResponse.json({ message: "Failed to update favorite status" }, { status: 500 })
  }
}
