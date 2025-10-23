import { type NextRequest, NextResponse } from "next/server"
import { createSunoClient, type SunoGenerateRequest } from "@/lib/suno-client"

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const {
      title,
      prompt,
      lyrics,
      gptDescription,
      genres = [],
      mood,
      tags,
      negativeTags,
      instruments = [],
      tempo,
      duration,
      instrumental = false,
      modelVersion = "v4.5+",
      task,
      continueClipId,
      continueAt,
      coverClipId,
      personaId,
      artistClipId,
      styleWeight,
      audioWeight,
      weirdnessConstraint,
      vocalGender,
    } = body

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

    // Build the request
    const sunoRequest: SunoGenerateRequest = {
      title: title || "Untitled Track",
      mv: modelVersion,
      make_instrumental: instrumental,
      generation_type: instrumental ? "INSTRUMENTAL" : "TEXT",
    }

    // GPT description mode
    if (gptDescription) {
      sunoRequest.gpt_description_prompt = gptDescription
    } else {
      // Custom mode with lyrics/prompt
      sunoRequest.prompt = lyrics || prompt || ""
    }

    // Tags
    if (tags) {
      sunoRequest.tags = tags
    } else {
      const tagParts = [...genres, mood, ...instruments, tempo ? `${tempo}bpm` : null].filter(Boolean)
      if (tagParts.length > 0) {
        sunoRequest.tags = tagParts.join(", ")
      }
    }

    if (negativeTags) {
      sunoRequest.negative_tags = negativeTags
    }

    // Task-specific parameters
    if (task) {
      sunoRequest.task = task
    }

    if (continueClipId) {
      sunoRequest.continue_clip_id = continueClipId
      sunoRequest.continue_at = continueAt
    }

    if (coverClipId) {
      sunoRequest.cover_clip_id = coverClipId
      sunoRequest.task = "cover"
    }

    if (personaId && artistClipId) {
      sunoRequest.persona_id = personaId
      sunoRequest.artist_clip_id = artistClipId
      sunoRequest.task = "artist_consistency"
    }

    // Advanced controls
    if (styleWeight !== undefined || audioWeight !== undefined || weirdnessConstraint !== undefined || vocalGender) {
      sunoRequest.metadata = {
        create_mode: "custom",
        control_sliders: {},
        can_control_sliders: [],
      }

      if (styleWeight !== undefined) {
        sunoRequest.metadata.control_sliders!.style_weight = styleWeight
        sunoRequest.metadata.can_control_sliders!.push("style_weight")
      }

      if (audioWeight !== undefined) {
        sunoRequest.metadata.control_sliders!.audio_weight = audioWeight
        sunoRequest.metadata.can_control_sliders!.push("audio_weight")
      }

      if (weirdnessConstraint !== undefined) {
        sunoRequest.metadata.control_sliders!.weirdness_constraint = weirdnessConstraint
        sunoRequest.metadata.can_control_sliders!.push("weirdness_constraint")
      }

      if (vocalGender) {
        sunoRequest.metadata.vocalgender = vocalGender
      }
    }

    console.log("Generating music with Suno:", sunoRequest)

    const response = await client.generateMusic(sunoRequest)

    if (response.code !== "success") {
      throw new Error(response.message || "Failed to generate music")
    }

    const taskId = response.data

    return NextResponse.json({
      id: taskId,
      status: "queued",
      title: sunoRequest.title,
      createdAt: new Date().toISOString(),
      message: `Music generation started. Task ID: ${taskId}`,
    })
  } catch (error) {
    console.error("Error in music generation:", error)

    return NextResponse.json(
      {
        error: "Music generation failed",
        message: error instanceof Error ? error.message : "Unknown error occurred",
      },
      { status: 500 },
    )
  }
}
