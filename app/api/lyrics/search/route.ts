import { NextResponse } from "next/server"
import { MusixmatchClient } from "@/lib/rapidapi-client"

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const title = searchParams.get("title")
    const artist = searchParams.get("artist")
    const duration = searchParams.get("duration")

    if (!title || !artist) {
      return NextResponse.json({ success: false, error: "Title and artist are required" }, { status: 400 })
    }

    const client = new MusixmatchClient()
    const lyrics = await client.getLyrics(title, artist, duration || undefined)

    return NextResponse.json({ success: true, data: lyrics })
  } catch (error) {
    console.error("Error searching lyrics:", error)
    return NextResponse.json({ success: false, error: "Failed to search lyrics" }, { status: 500 })
  }
}
