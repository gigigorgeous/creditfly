import { NextResponse } from "next/server"
import { trackMusicPlay } from "@/lib/redis"

export async function POST(request: Request) {
  try {
    const { musicId, userId } = await request.json()

    if (!musicId) {
      return NextResponse.json({ error: "Music ID is required" }, { status: 400 })
    }

    // Track the play in Redis
    await trackMusicPlay(musicId, userId || undefined)

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Error tracking play:", error)
    return NextResponse.json({ error: "Failed to track play" }, { status: 500 })
  }
}
