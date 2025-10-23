import { type NextRequest, NextResponse } from "next/server"
import { createSunoClient } from "@/lib/suno-client"

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { clipId, isInfill = true } = body

    if (!clipId) {
      return NextResponse.json({ error: "Clip ID is required" }, { status: 400 })
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

    const response = await client.concatClips(clipId, isInfill)

    if (response.code !== "success") {
      throw new Error(response.message || "Failed to concatenate clips")
    }

    return NextResponse.json({
      taskId: response.data,
      message: "Clip concatenation started",
    })
  } catch (error) {
    console.error("Error concatenating clips:", error)
    return NextResponse.json(
      {
        error: "Clip concatenation failed",
        message: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 },
    )
  }
}
