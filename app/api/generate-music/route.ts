import { NextResponse } from "next/server"
import { v4 as uuidv4 } from "uuid"
import { getGenreBasedAudioUrl } from "@/lib/music-generation-sdk"

// Create a fallback music data function
function createFallbackMusicData(options: {
  title?: string
  genre?: string
  mood?: string
  style?: string
  duration?: number
}) {
  const { title, genre, mood, style, duration } = options

  return {
    id: uuidv4(),
    title: title || "Untitled Track",
    audioUrl: getGenreBasedAudioUrl(genre || "Pop", mood || "Happy"),
    genre: genre || "Pop",
    mood: mood || "Happy",
    duration: duration || 180,
    createdAt: new Date().toISOString(),
    musicDescription: {
      musicDescription: `A ${genre || "Pop"} song with a ${mood || "Happy"} mood in ${style || "Vocal"} style.`,
      structure: ["intro", "verse", "chorus", "verse", "chorus", "bridge", "chorus", "outro"],
      tempo: 120,
      key: "C major",
      instrumentation: ["piano", "guitar", "drums", "bass", "synth"],
      theme: "Summer vibes and positive energy",
      melody: "Catchy and uplifting melody with memorable hooks",
      harmony: "Rich chord progressions with occasional tension and resolution",
      rhythm: "Steady beat with syncopated elements to add interest",
    },
    aiGenerated: true,
  }
}

export async function POST(request: Request) {
  try {
    console.log("Generate music API route called")

    // Parse the request body with error handling
    let body
    try {
      body = await request.json()
      console.log("Request body:", JSON.stringify(body))
    } catch (parseError) {
      console.error("Error parsing request body:", parseError)
      return NextResponse.json(
        { error: "Invalid request body", message: "Request body must be valid JSON" },
        { status: 400 },
      )
    }

    const { title, lyrics, genre, mood, style, voiceType, duration, userId } = body

    // Validate required fields
    if (!genre && !mood && !title) {
      return NextResponse.json(
        { error: "Missing required fields", message: "At least one of genre, mood, or title is required" },
        { status: 400 },
      )
    }

    // Generate music data using the fallback function
    const musicData = createFallbackMusicData({
      title,
      genre,
      mood,
      style,
      duration,
    })

    console.log("Generated music data:", JSON.stringify(musicData, null, 2))

    // Ensure we return a valid response
    console.log("Returning successful response")
    return NextResponse.json(musicData, {
      status: 200,
      headers: {
        "Content-Type": "application/json",
      },
    })
  } catch (error) {
    console.error("Error in generate-music API route:", error)

    // Log detailed error information
    if (error instanceof Error) {
      console.error("Error name:", error.name)
      console.error("Error message:", error.message)
      console.error("Error stack:", error.stack)
    } else {
      console.error("Unknown error type:", typeof error)
      console.error("Error stringified:", JSON.stringify(error))
    }

    // Always return valid JSON error response
    const errorResponse = {
      error: "Failed to generate music",
      message: error instanceof Error ? error.message : "Unknown error occurred",
      timestamp: new Date().toISOString(),
    }

    return NextResponse.json(errorResponse, {
      status: 500,
      headers: {
        "Content-Type": "application/json",
      },
    })
  }
}
