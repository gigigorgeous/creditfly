import { NextResponse } from "next/server"
import { trackMusicPlay } from "@/lib/redis"

export async function POST(request: Request) {
  try {
    const { musicId, userId } = await request.json()

    if (!musicId) {
      return NextResponse.json({ error: "Music ID is required" }, { status: 400 })
    }

    // Track the play in Redis
    const success = await trackMusicPlay(musicId, userId)

    if (!success) {
      return NextResponse.json({ error: "Failed to track play" }, { status: 500 })
    }

    // Get updated play count
    const { redis } = await import("@/lib/redis")
    const playCount = await redis.hget(`music:${musicId}`, "plays")

    return NextResponse.json({
      success: true,
      playCount: Number(playCount) || 1,
    })
  } catch (error) {
    console.error("Error tracking play:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
