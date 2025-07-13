import { NextResponse } from "next/server"
import { createClient } from "@/supabase/server"
import { Midi, writeMidi } from "@tonejs/midi"
import { generateText } from "ai"
import { openai } from "@ai-sdk/openai"

export const maxDuration = 60 // Allow longer duration for AI generation

export async function POST(req: Request) {
  const supabase = createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const { prompt } = await req.json()

  if (!prompt) {
    return NextResponse.json({ error: "Prompt is required" }, { status: 400 })
  }

  try {
    // 1. Use AI SDK to generate music instructions (notes)
    const { text: aiResponseText } = await generateText({
      model: openai("gpt-4o-mini"), // Using gpt-4o-mini as a cost-effective option
      system: `You are a music composer AI. Based on the user's prompt, generate a JSON array of musical notes. Each note object should have 'midi' (MIDI note number, e.g., 60 for C4), 'time' (start time in seconds from beginning, e.g., 0, 0.5, 1), and 'duration' (duration in seconds, e.g., 0.5). Ensure the output is a valid JSON array only, without any additional text or markdown formatting. Keep the melody simple and short, around 10-20 notes.`,
      prompt: `Generate a melody based on this description: "${prompt}"`,
    })

    let notes: { midi: number; time: number; duration: number }[] = []
    try {
      notes = JSON.parse(aiResponseText)
      // Basic validation to ensure it's an array of objects with required properties
      if (
        !Array.isArray(notes) ||
        !notes.every((n) => typeof n.midi === "number" && typeof n.time === "number" && typeof n.duration === "number")
      ) {
        throw new Error("AI response is not a valid notes array.")
      }
    } catch (parseError) {
      console.error("Failed to parse AI response as JSON:", parseError, "Raw AI response:", aiResponseText)
      return NextResponse.json(
        { error: "AI failed to generate valid music notes. Try a different prompt.", raw: aiResponseText },
        { status: 500 },
      )
    }

    // 2. Create a MIDI file from the generated notes
    const midi = new Midi()
    const track = midi.addTrack()

    notes.forEach((note) => {
      track.addNote({
        midi: note.midi,
        time: note.time,
        duration: note.duration,
      })
    })

    const midiDataBuffer = Buffer.from(writeMidi(midi))

    // 3. Upload the MIDI file to Supabase Storage
    const fileName = `${user.id}/${Date.now()}.mid`
    const { data: uploadData, error: uploadError } = await supabase.storage
      .from("audio") // Assuming 'audio' bucket exists from init-supabase-db.sql
      .upload(fileName, midiDataBuffer, {
        contentType: "audio/midi",
        upsert: false, // Do not overwrite if file exists (unlikely with timestamp)
      })

    if (uploadError) {
      console.error("Error uploading MIDI to storage:", uploadError)
      return NextResponse.json({ error: "Failed to store generated music file." }, { status: 500 })
    }

    // Get the public URL of the uploaded file
    const { data: publicUrlData } = supabase.storage.from("audio").getPublicUrl(fileName)
    const audioUrl = publicUrlData.publicUrl

    // 4. Save the generation record to Supabase database
    const { data, error } = await supabase
      .from("music_generations")
      .insert({ user_id: user.id, prompt, audio_url: audioUrl })
      .select()
      .single()

    if (error) {
      console.error("Error saving music generation record:", error)
      return NextResponse.json({ error: "Failed to save music generation record" }, { status: 500 })
    }

    return NextResponse.json({ audioUrl: audioUrl, id: data.id })
  } catch (error: any) {
    console.error("Error in music generation process:", error)
    return NextResponse.json(
      { error: error.message || "An unexpected error occurred during music generation." },
      { status: 500 },
    )
  }
}
