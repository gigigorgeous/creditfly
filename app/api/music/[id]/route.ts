import { type NextRequest, NextResponse } from "next/server"
import { createSunoClient } from "@/lib/suno-client"

export async function GET(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const { id } = params

    if (!id) {
      return NextResponse.json({ error: "Task ID is required" }, { status: 400 })
    }

    const client = createSunoClient()

    if (!client) {
      return NextResponse.json(
        {
          error: "Suno API not configured",
          message: "Please add SUNO_API_KEY to your environment variables",
        },
        { status: 503 },
      )
    }

    const response = await client.getTrack(id)

    if (response.code !== "success" || !response.data || response.data.length === 0) {
      return NextResponse.json(
        {
          error: "Track not found",
          message: response.message || "No tracks found for this task ID",
        },
        { status: 404 },
      )
    }

    // Return the first track (or all tracks if multiple)
    const tracks = response.data.map((track) => ({
      id: track.id,
      title: track.title,
      audioUrl: track.audio_url,
      videoUrl: track.video_url,
      thumbnailUrl: track.image_url,
      status: track.status,
      duration: track.metadata?.duration,
      createdAt: track.created_at,
      prompt: track.metadata?.prompt,
      gptDescription: track.metadata?.gpt_description_prompt,
      tags: track.metadata?.tags,
      modelVersion: track.model_name,
      playCount: track.play_count,
      upvoteCount: track.upvote_count,
      isPublic: track.is_public,
    }))

    // If single track, return just that track
    if (tracks.length === 1) {
      return NextResponse.json(tracks[0])
    }

    // Multiple tracks
    return NextResponse.json({ tracks })
  } catch (error) {
    console.error("API error:", error)
    return NextResponse.json(
      {
        error: "Internal server error",
        message: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 },
    )
  }
}
