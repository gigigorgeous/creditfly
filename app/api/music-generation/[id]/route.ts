import { NextResponse } from "next/server"
import { checkSunoGenerationStatus } from "@/lib/suno"

export async function GET(request: Request, { params }: { params: { id: string } }) {
  try {
    const id = params.id

    if (!id) {
      return NextResponse.json({ error: "Generation ID is required" }, { status: 400 })
    }

    // Check if this is a Suno generation (IDs from Suno have a specific format)
    const isSunoId = id.includes("-") && id.length > 20

    if (isSunoId && process.env.SUNO_API_KEY) {
      // This is a Suno generation
      try {
        const generationStatus = await checkSunoGenerationStatus(id)

        return NextResponse.json({
          id: generationStatus.id,
          status: generationStatus.status,
          title: generationStatus.title,
          audioUrl: generationStatus.audio_url,
          createdAt: generationStatus.created_at,
          updatedAt: generationStatus.updated_at,
          error: generationStatus.error,
          engine: "suno",
        })
      } catch (error) {
        console.error("Error checking Suno generation status:", error)
        return NextResponse.json({ error: "Failed to check Suno generation status" }, { status: 500 })
      }
    } else {
      // This is a basic generation or Suno API key is missing
      // For basic generation, we can return a mock status since it's immediate
      return NextResponse.json({
        id: id,
        status: "complete",
        title: "Generated Track",
        audioUrl: `/api/stream-audio/${id}`,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        engine: "basic",
      })
    }
  } catch (error) {
    console.error("Error checking generation status:", error)
    return NextResponse.json({ error: "Failed to check generation status" }, { status: 500 })
  }
}
