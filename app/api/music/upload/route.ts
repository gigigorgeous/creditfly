import { type NextRequest, NextResponse } from "next/server"
import { createSunoClient } from "@/lib/suno-client"

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { url } = body

    if (!url) {
      return NextResponse.json({ error: "Audio URL is required" }, { status: 400 })
    }

    const client = createSunoClient()

    if (!client) {
      return NextResponse.json(
        {
          error: "Suno API not configured",
          message: "Please add SUNO_API_KEY to your environment variables",
        },
        { status: 500 },
      )
    }

    const response = await client.uploadAudio(url)

    if (response.code !== "success") {
      throw new Error(response.message || "Failed to upload audio")
    }

    return NextResponse.json({
      taskId: response.data,
      message: "Audio upload started",
    })
  } catch (error) {
    console.error("Error uploading audio:", error)
    return NextResponse.json(
      {
        error: "Audio upload failed",
        message: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 },
    )
  }
}
