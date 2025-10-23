import { NextResponse } from "next/server"
import { v4 as uuidv4 } from "uuid"
import { generateMusicDescription } from "@/lib/openai"
import { generateSunoSong } from "@/lib/suno"

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
      engine = "suno", // Default to Suno if not specified
    } = await request.json()

    // Generate a unique ID for this generation
    const generationId = uuidv4()

    // Check if we're using Suno and have the API key
    if (engine === "suno") {
      if (!process.env.SUNO_API_KEY) {
        console.warn("Suno API key is missing, falling back to basic generation")
        return handleBasicGeneration(generationId, title, prompt, genre, mood, style, lyrics, duration)
      }

      try {
        return await handleSunoGeneration(generationId, title, prompt, genre, mood, style, lyrics, duration)
      } catch (error) {
        console.error("Error in Suno generation:", error)
        // If Suno generation fails, fall back to basic generation
        return handleBasicGeneration(generationId, title, prompt, genre, mood, style, lyrics, duration)
      }
    } else {
      // Use basic generation
      return handleBasicGeneration(generationId, title, prompt, genre, mood, style, lyrics, duration)
    }
  } catch (error) {
    console.error("Error in music generation:", error)
    return NextResponse.json(
      {
        error: "Failed to generate music",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 },
    )
  }
}

async function handleSunoGeneration(
  generationId: string,
  title: string,
  prompt: string,
  genre: string,
  mood: string,
  style: string,
  lyrics?: string,
  duration?: number,
) {
  try {
    // Use OpenAI to enhance the prompt if available
    let enhancedPrompt = prompt || ""

    if (process.env.OPENAI_API_KEY) {
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

    // Make sure we have a prompt
    if (!enhancedPrompt.trim()) {
      enhancedPrompt = `Generate a ${genre || "pop"} song with a ${mood || "happy"} mood in ${style || "modern"} style.`
    }

    // Generate song with Suno
    const generationResponse = await generateSunoSong({
      prompt: enhancedPrompt,
      title: title || "Untitled Track",
      duration: duration || undefined,
    })

    return NextResponse.json({
      id: generationResponse.id,
      title: generationResponse.title,
      status: generationResponse.status,
      createdAt: generationResponse.created_at,
      enhancedPrompt: enhancedPrompt,
      originalPrompt: prompt,
      engine: "suno",
    })
  } catch (error) {
    console.error("Error in Suno music generation:", error)
    throw error
  }
}

async function handleBasicGeneration(
  generationId: string,
  title: string,
  prompt: string,
  genre: string,
  mood: string,
  style: string,
  lyrics?: string,
  duration?: number,
) {
  try {
    // Generate music description using OpenAI if available
    let musicDescription = null
    if (process.env.OPENAI_API_KEY) {
      try {
        musicDescription = await generateMusicDescription(title, genre, mood, style, lyrics, duration)
      } catch (error) {
        console.error("Error generating music description with OpenAI:", error)
      }
    }

    // In a real implementation, you would use the music description to generate actual audio
    // For now, we'll return a sample audio URL
    return NextResponse.json({
      id: generationId,
      title: title || "Untitled Track",
      audioUrl: `/api/stream-audio/${generationId}`,
      genre: genre || "Pop",
      mood: mood || "Happy",
      duration: duration,
      createdAt: new Date().toISOString(),
      musicDescription: musicDescription,
      status: "complete", // Basic generation completes immediately
      engine: "basic",
    })
  } catch (error) {
    console.error("Error in basic music generation:", error)
    throw error
  }
}
