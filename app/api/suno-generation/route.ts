import { NextResponse } from "next/server"
import { generateSunoSong, type SunoGenerationOptions } from "@/lib/suno"
import { generateMusicDescription } from "@/lib/openai"

export async function POST(request: Request) {
  try {
    const {
      title,
      prompt,
      genre,
      mood,
      style,
      lyrics,
      duration,
      bpm,
      key,
      mode,
      tags,
      stylePreset,
      referenceTrackId,
      useAIPromptEnhancement = true,
    } = await request.json()

    // Check if Suno API key is available
    if (!process.env.SUNO_API_KEY) {
      return NextResponse.json({ error: "Suno API key is required for AI music generation" }, { status: 400 })
    }

    let enhancedPrompt = prompt

    // Use OpenAI to enhance the prompt if requested
    if (useAIPromptEnhancement && process.env.OPENAI_API_KEY) {
      try {
        const musicDescription = await generateMusicDescription(title, genre, mood, style, lyrics, duration)

        // Create an enhanced prompt using the OpenAI-generated description
        enhancedPrompt = `
          ${prompt || ""}
          
          ${musicDescription.musicDescription || ""}
          
          ${lyrics ? `Lyrics: ${lyrics}` : ""}
          
          ${musicDescription.instrumentation ? `Instruments: ${musicDescription.instrumentation.join(", ")}` : ""}
          
          ${musicDescription.mixingNotes ? `Mixing notes: ${musicDescription.mixingNotes}` : ""}
        `.trim()
      } catch (error) {
        console.error("Error enhancing prompt with OpenAI:", error)
        // Continue with original prompt if enhancement fails
      }
    }

    // Prepare options for Suno API
    const sunoOptions: SunoGenerationOptions = {
      prompt: enhancedPrompt,
      title: title || "Untitled Track",
      bpm: bpm || undefined,
      key: key || undefined,
      mode: mode || undefined,
      duration: duration || undefined,
      tags: tags || undefined,
      style_preset: stylePreset || undefined,
      reference_song_id: referenceTrackId || undefined,
    }

    // Generate song with Suno
    const generationResponse = await generateSunoSong(sunoOptions)

    return NextResponse.json({
      id: generationResponse.id,
      title: generationResponse.title,
      status: generationResponse.status,
      createdAt: generationResponse.created_at,
      enhancedPrompt: enhancedPrompt,
      originalPrompt: prompt,
    })
  } catch (error) {
    console.error("Error in Suno music generation:", error)
    return NextResponse.json({ error: "Failed to generate music with Suno" }, { status: 500 })
  }
}
