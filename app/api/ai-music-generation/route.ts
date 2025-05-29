import { NextResponse } from "next/server"
import { generateMusic } from "@/lib/music-generation-sdk"

export async function POST(request: Request) {
  try {
    console.log("AI music generation API route called")

    // Parse the request body
    const body = await request.json()
    console.log("Request body:", JSON.stringify(body))

    const { title, lyrics, genre, mood, style, voiceType, duration } = body

    // Generate music using our SDK
    const musicData = await generateMusic({
      title,
      lyrics,
      genre,
      mood,
      style,
      voiceType,
      duration,
    })

    console.log("Generated music data:", JSON.stringify(musicData, null, 2))

    // Return the generated music metadata
    console.log("Returning successful response")
    return NextResponse.json(musicData)
  } catch (error) {
    console.error("Error in AI music generation API route:", error)
    if (error instanceof Error) {
      console.error("Error name:", error.name)
      console.error("Error message:", error.message)
      console.error("Error stack:", error.stack)
    } else {
      console.error("Unknown error type:", typeof error)
      console.error("Error stringified:", JSON.stringify(error))
    }

    // Return a fallback response
    return NextResponse.json(
      {
        error: "Failed to generate music",
        message: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 },
    )
  }
}
