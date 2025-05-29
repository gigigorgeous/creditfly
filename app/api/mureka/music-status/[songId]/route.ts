import { type NextRequest, NextResponse } from "next/server"
import { MurekaAIClient } from "@/lib/rapidapi-client"

export async function GET(request: NextRequest, { params }: { params: { songId: string } }) {
  try {
    const { songId } = params

    if (!songId) {
      return NextResponse.json({ success: false, error: "Song ID is required" }, { status: 400 })
    }

    const client = new MurekaAIClient()
    const result = await client.getMusicStatus(songId)

    return NextResponse.json({ success: true, data: result.data || result })
  } catch (error) {
    console.error("Error getting music status:", error)
    return NextResponse.json({ success: false, error: "Failed to get music status" }, { status: 500 })
  }
}
