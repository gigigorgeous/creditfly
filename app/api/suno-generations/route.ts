import { NextResponse } from "next/server"
import { listSunoGenerations } from "@/lib/suno"

export async function GET(request: Request) {
  try {
    // Get query parameters
    const { searchParams } = new URL(request.url)
    const limit = Number.parseInt(searchParams.get("limit") || "10")
    const offset = Number.parseInt(searchParams.get("offset") || "0")

    // Check if Suno API key is available
    if (!process.env.SUNO_API_KEY) {
      return NextResponse.json({ error: "Suno API key is required" }, { status: 400 })
    }

    const generationsResponse = await listSunoGenerations(limit, offset)

    // Map the response to our expected format
    const generations = generationsResponse.generations.map((gen) => ({
      id: gen.id,
      status: gen.status,
      title: gen.title,
      audioUrl: gen.audio_url,
      createdAt: gen.created_at,
      updatedAt: gen.updated_at,
      error: gen.error,
    }))

    return NextResponse.json({ generations })
  } catch (error) {
    console.error("Error listing Suno generations:", error)
    return NextResponse.json({ error: "Failed to list generations" }, { status: 500 })
  }
}
