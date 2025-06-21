import { NextResponse } from "next/server"
import { createClient } from "@vercel/kv" // Corrected import
import { v4 as uuidv4 } from "uuid"

// Initialize KV store
const kv =
  process.env.KV_REST_API_URL && process.env.KV_REST_API_TOKEN
    ? createClient({
        // Corrected instantiation
        url: process.env.KV_REST_API_URL,
        token: process.env.KV_REST_API_TOKEN,
      })
    : null

export async function POST(request: Request) {
  try {
    // Check if KV is initialized
    if (!kv) {
      return NextResponse.json({ message: "KV store not configured" }, { status: 500 })
    }

    // Parse request body
    const body = await request.json()
    const { prompt, genre } = body

    if (!prompt) {
      return NextResponse.json({ message: "Prompt is required" }, { status: 400 })
    }

    // Generate a unique ID for the song
    const songId = uuidv4()

    // In a real implementation, you would call an AI music generation service here
    // For now, we'll simulate a delay and return a mock audio URL
    await new Promise((resolve) => setTimeout(resolve, 2000))

    // Mock audio URL (in production, this would be the URL returned by the AI service)
    const audioUrl = `https://example.com/audio/${songId}.mp3`

    // Store song data in KV store
    await kv.set(`song:${songId}`, {
      id: songId,
      prompt,
      genre: genre || "unspecified",
      audioUrl,
      createdAt: new Date().toISOString(),
      plays: 0,
    })

    return NextResponse.json({
      success: true,
      songId,
      audioUrl,
    })
  } catch (error) {
    console.error("Error generating music:", error)
    return NextResponse.json({ message: "Failed to generate music" }, { status: 500 })
  }
}

// Added empty handlers for other HTTP methods to prevent "Method not allowed" errors during deployment checks
export async function GET() {
  return NextResponse.json({ error: "Method not allowed. Use POST to generate music." }, { status: 405 })
}

export async function PUT() {
  return NextResponse.json({ error: "Method not allowed. Use POST to generate music." }, { status: 405 })
}

export async function DELETE() {
  return NextResponse.json({ error: "Method not allowed. Use POST to generate music." }, { status: 405 })
}
