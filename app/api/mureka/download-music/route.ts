import { type NextRequest, NextResponse } from "next/server"
import { MurekaAIClient } from "@/lib/rapidapi-client"

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { songId, type = "full" } = body

    if (!songId) {
      return NextResponse.json({ success: false, error: "Song ID is required" }, { status: 400 })
    }

    const client = new MurekaAIClient()
    const result = await client.downloadMusic(songId, type)

    return NextResponse.json({ success: true, data: result.data || result })
  } catch (error) {
    console.error("Error downloading music:", error)
    return NextResponse.json({ success: false, error: "Failed to download music" }, { status: 500 })
  }
}
