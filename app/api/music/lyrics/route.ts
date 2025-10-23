import { type NextRequest, NextResponse } from "next/server"
import { createSunoClient } from "@/lib/suno-client"

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { prompt, notifyHook } = body

    if (!prompt) {
      return NextResponse.json({ error: "Prompt is required" }, { status: 400 })
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

    const response = await client.generateLyrics(prompt, notifyHook)

    if (response.code !== "success") {
      throw new Error(response.message || "Failed to generate lyrics")
    }

    return NextResponse.json({
      taskId: response.data,
      message: "Lyrics generation started",
    })
  } catch (error) {
    console.error("Error generating lyrics:", error)
    return NextResponse.json(
      {
        error: "Lyrics generation failed",
        message: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 },
    )
  }
}
