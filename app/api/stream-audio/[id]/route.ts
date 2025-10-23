import { NextResponse } from "next/server"
import { checkSunoGenerationStatus } from "@/lib/suno"

export async function GET(request: Request, { params }: { params: { id: string } }) {
  try {
    const id = params.id

    if (!id) {
      return NextResponse.json({ error: "Track ID is required" }, { status: 400 })
    }

    // Check if this is a Suno generation ID (they have a specific format)
    const isSunoId = id.includes("-") && id.length > 20

    if (isSunoId && process.env.SUNO_API_KEY) {
      try {
        // Check the status of the Suno generation
        const generationStatus = await checkSunoGenerationStatus(id)

        // If the generation is complete and has an audio URL, redirect to it
        if (generationStatus.status === "complete" && generationStatus.audio_url) {
          return NextResponse.redirect(generationStatus.audio_url)
        } else if (generationStatus.status === "failed") {
          return NextResponse.json({ error: "Music generation failed" }, { status: 500 })
        } else {
          // Still processing
          return NextResponse.json(
            {
              status: generationStatus.status,
              message: "Music is still being generated",
            },
            { status: 202 },
          )
        }
      } catch (error) {
        console.error("Error checking Suno generation status:", error)
      }
    }

    // If not a Suno ID or Suno check failed, return a placeholder audio
    // This is a placeholder for demo purposes
    const headers = new Headers()
    headers.set("Content-Type", "audio/mpeg")
    headers.set("Cache-Control", "public, max-age=31536000")

    // Return a simple audio response
    return new NextResponse(
      `ID: ${id} - This is a placeholder for audio streaming. In a real implementation, you would stream actual audio here.`,
      { headers },
    )
  } catch (error) {
    console.error("Error streaming audio:", error)
    return NextResponse.json({ error: "Failed to stream audio" }, { status: 500 })
  }
}
