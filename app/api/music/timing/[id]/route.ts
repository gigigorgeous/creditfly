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

    const timing = await client.getTiming(id)

    return NextResponse.json(timing)
  } catch (error) {
    console.error("Error getting timing:", error)
    return NextResponse.json(
      {
        error: "Failed to get timing",
        message: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 },
    )
  }
}
