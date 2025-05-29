import { NextResponse } from "next/server"
import { SplitbeatClient } from "@/lib/rapidapi-client"

export async function POST(request: Request) {
  try {
    const formData = await request.formData()
    const audioFile = formData.get("audio") as File

    if (!audioFile) {
      return NextResponse.json({ success: false, error: "Audio file is required" }, { status: 400 })
    }

    const client = new SplitbeatClient()
    const result = await client.uploadAudio(formData)

    return NextResponse.json({ success: true, data: result })
  } catch (error) {
    console.error("Error uploading audio for vocal removal:", error)
    return NextResponse.json({ success: false, error: "Failed to upload audio" }, { status: 500 })
  }
}
