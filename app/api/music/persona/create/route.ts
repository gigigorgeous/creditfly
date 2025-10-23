import { type NextRequest, NextResponse } from "next/server"
import { createSunoClient } from "@/lib/suno-client"

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { rootClipId, name, description, clips, isPublic = true } = body

    if (!rootClipId || !name || !clips) {
      return NextResponse.json({ error: "Root clip ID, name, and clips are required" }, { status: 400 })
    }

    const client = createSunoClient()

    if (!client) {
      return NextResponse.json(
        {
          error: "Suno API not configured",
          message: "Please add SUNO_API_KEY to your environment variables",
        },
        { status: 500 },
      )
    }

    const response = await client.createPersona({
      root_clip_id: rootClipId,
      name,
      description: description || "",
      clips,
      is_public: isPublic,
    })

    if (response.code !== "success") {
      throw new Error(response.message || "Failed to create persona")
    }

    return NextResponse.json({
      personaId: response.data.id,
      message: "Persona created successfully",
    })
  } catch (error) {
    console.error("Error creating persona:", error)
    return NextResponse.json(
      {
        error: "Persona creation failed",
        message: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 },
    )
  }
}
