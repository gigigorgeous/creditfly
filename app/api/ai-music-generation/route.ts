import { NextResponse } from "next/server"
import { generateMusic } from "@/lib/music-generation-sdk"

export async function POST(request: Request) {
  try {
    console.log("AI music generation API route called")

    // Parse the request body
    let body
    try {
      body = await request.json()
      console.log("Request body:", JSON.stringify(body, null, 2))
    } catch (parseError) {
      console.error("Failed to parse request body:", parseError)
      return NextResponse.json({ error: "Invalid JSON in request body" }, { status: 400 })
    }

    const { title, lyrics, genre, mood, style, voiceType, duration, userId } = body

    // Validate required fields
    if (!lyrics && !title) {
      return NextResponse.json({ error: "Either lyrics or title is required" }, { status: 400 })
    }

    console.log("Calling generateMusic with options...")

    // Generate music using our SDK
    const musicData = await generateMusic({
      title,
      lyrics,
      genre,
      mood,
      style,
      voiceType,
      duration,
      userId,
    })

    console.log("Generated music data:", JSON.stringify(musicData, null, 2))

    // Return the generated music metadata
    console.log("Returning successful response")
    return NextResponse.json(musicData, {
      status: 200,
      headers: {
        "Content-Type": "application/json",
      },
    })
  } catch (error) {
    console.error("Error in AI music generation API route:", error)

    let errorMessage = "Failed to generate music"
    let statusCode = 500

    if (error instanceof Error) {
      console.error("Error details:", {
        name: error.name,
        message: error.message,
        stack: error.stack,
      })
      errorMessage = error.message

      // Handle specific error types
      if (error.message.includes("API key")) {
        statusCode = 401
        errorMessage = "API key is missing or invalid"
      } else if (error.message.includes("rate limit")) {
        statusCode = 429
        errorMessage = "Rate limit exceeded"
      } else if (error.message.includes("timeout")) {
        statusCode = 408
        errorMessage = "Request timeout"
      }
    }

    // Always return JSON, never HTML
    return NextResponse.json(
      {
        error: errorMessage,
        message: error instanceof Error ? error.message : "Unknown error occurred",
        timestamp: new Date().toISOString(),
      },
      {
        status: statusCode,
        headers: {
          "Content-Type": "application/json",
        },
      },
    )
  }
}

// Handle other HTTP methods
export async function GET() {
  return NextResponse.json({ error: "Method not allowed. Use POST to generate music." }, { status: 405 })
}

export async function PUT() {
  return NextResponse.json({ error: "Method not allowed. Use POST to generate music." }, { status: 405 })
}

export async function DELETE() {
  return NextResponse.json({ error: "Method not allowed. Use POST to generate music." }, { status: 405 })
}
