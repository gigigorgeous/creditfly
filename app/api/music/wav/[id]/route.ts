import { type NextRequest, NextResponse } from "next/server"
import { createSunoClient } from "@/lib/suno-client"

export async function GET(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const { id } = params

    const client = createSunoClient()

    if (!client) {
      return NextResponse.json(
        {
          error: "Suno API not configured",
        },
        { status: 500 },
      )
    }

    const response = await client.getWav(id)

    if (response.code !== "success") {
      throw new Error(response.message || "Failed to get WAV file")
    }

    return NextResponse.json({
      wavUrl: response.data.wav_file_url,
    })
  } catch (error) {
    console.error("Error getting WAV:", error)
    return NextResponse.json(
      {
        error: "Failed to get WAV file",
        message: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 },
    )
  }
}
