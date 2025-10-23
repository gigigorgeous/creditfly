import { NextResponse } from "next/server"
import { v4 as uuidv4 } from "uuid"
import { generateMusicDescription } from "@/lib/openai"
import { generateSunoSong } from "@/lib/suno"

export async function POST(request: Request) {
  try {
    const { title, lyrics, genre, mood, style, voiceType, duration } = await request.json()

    // Check if OpenAI API key is available
    if (!process.env.OPENAI_API_KEY) {
      return NextResponse.json({ error: "OpenAI API key is required for AI music generation" }, { status: 400 })
    }

    // Generate music description using OpenAI
    const musicDescription = await generateMusicDescription(title, genre, mood, style, lyrics, duration)

    // Check if Suno API key is available for high-quality generation
    if (process.env.SUNO_API_KEY) {
      try {
        // Create an enhanced prompt using the OpenAI-generated description
        const enhancedPrompt = `
          ${title ? `Title: ${title}` : ""}
          
          ${musicDescription.musicDescription || ""}
          
          ${lyrics ? `Lyrics: ${lyrics}` : ""}
          
          Genre: ${genre || "Pop"}
          Mood: ${mood || "Happy"}
          Style: ${style || "Modern"}
          
          ${musicDescription.instrumentation ? `Instruments: ${musicDescription.instrumentation.join(", ")}` : ""}
          
          ${musicDescription.mixingNotes ? `Mixing notes: ${musicDescription.mixingNotes}` : ""}
        `.trim()

        // Generate song with Suno
        const generationResponse = await generateSunoSong({
          prompt: enhancedPrompt,
          title: title || "Untitled Track",
          duration: duration || undefined,
        })

        return NextResponse.json({
          id: generationResponse.id,
          title: title || "Untitled Track",
          status: generationResponse.status,
          createdAt: generationResponse.created_at,
          genre: genre || "Pop",
          mood: mood || "Happy",
          duration: duration,
          musicDescription: musicDescription,
          aiGenerated: true,
          engine: "suno",
        })
      } catch (error) {
        console.error("Error in Suno music generation:", error)
        // Fall back to basic generation if Suno fails
      }
    }

    // Fall back to basic generation if Suno is not available or fails
    const trackId = uuidv4()

    return NextResponse.json({
      id: trackId,
      title: title || "Untitled Track",
      audioUrl: `/api/stream-audio/${trackId}`,
      genre: genre || "Pop",
      mood: mood || "Happy",
      duration: duration,
      createdAt: new Date().toISOString(),
      musicDescription: musicDescription,
      aiGenerated: true,
      engine: "basic",
    })
  } catch (error) {
    console.error("Error in AI music generation:", error)
    return NextResponse.json({ error: "Failed to generate music with AI" }, { status: 500 })
  }
}
