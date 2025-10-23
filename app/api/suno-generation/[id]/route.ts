import { NextResponse } from "next/server"
import { checkSunoGenerationStatus } from "@/lib/suno"

export async function GET(request: Request, { params }: { params: { id: string } }) {
  try {
    const id = params.id

    if (!id) {
      return NextResponse.json({ error: "Generation ID is required" }, { status: 400 })
    }

    // Check if Suno API key is available
    if (!process.env.SUNO_API_KEY) {
      return NextResponse.json({ error: "Suno API key is required" }, { status: 400 })
    }

    const generationStatus = await checkSunoGenerationStatus(id)

    return NextResponse.json({
      id: generationStatus.id,
      status: generationStatus.status,
      title: generationStatus.title,
      audioUrl: generationStatus.audio_url,
      createdAt: generationStatus.created_at,
      updatedAt: generationStatus.updated_at,
      error: generationStatus.error,
    })
  } catch (error) {
    console.error("Error checking Suno generation status:", error)
    return NextResponse.json({ error: "Failed to check generation status" }, { status: 500 })
  }
}
