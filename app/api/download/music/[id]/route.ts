import { NextResponse } from "next/server"
import { redis } from "@/lib/redis"

export async function GET(request: Request, { params }: { params: { id: string } }) {
  try {
    const { id } = params

    // Get music metadata from Redis
    const musicData = await redis.hgetall(`music:${id}`)

    if (!musicData) {
      return NextResponse.json({ message: "Music not found" }, { status: 404 })
    }

    // Get the audio URL (this would be the stored file URL)
    const audioUrl = musicData.audioUrl

    if (!audioUrl) {
      return NextResponse.json({ message: "Audio file not found" }, { status: 404 })
    }

    // Fetch the audio file
    const response = await fetch(audioUrl)

    if (!response.ok) {
      return NextResponse.json({ message: "Failed to fetch audio file" }, { status: 500 })
    }

    const audioBuffer = await response.arrayBuffer()

    // Return the file with appropriate headers
    return new NextResponse(audioBuffer, {
      headers: {
        "Content-Type": "audio/mpeg",
        "Content-Disposition": `attachment; filename="${musicData.title || "music"}.mp3"`,
        "Content-Length": audioBuffer.byteLength.toString(),
      },
    })
  } catch (error) {
    console.error("Download error:", error)
    return NextResponse.json({ message: "Download failed" }, { status: 500 })
  }
}
