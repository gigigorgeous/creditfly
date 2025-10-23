import { NextResponse } from "next/server"
import { openai } from "@/lib/openai"
import fs from "fs"
import path from "path"
import { v4 as uuidv4 } from "uuid"

export async function POST(request: Request) {
  try {
    const { text, voice = "alloy", systemPrompt = "" } = await request.json()

    if (!text) {
      return NextResponse.json({ error: "Text is required" }, { status: 400 })
    }

    // Check if OpenAI API key is available
    if (!process.env.OPENAI_API_KEY) {
      return NextResponse.json({ error: "OpenAI API key is required for TTS generation" }, { status: 400 })
    }

    // Generate a unique filename
    const fileName = `enhanced-tts-${uuidv4()}.mp3`

    // In a production environment, you would likely use a storage service
    // For this example, we'll use the public directory
    const publicDir = path.join(process.cwd(), "public")
    const audioDir = path.join(publicDir, "audio")

    // Ensure the directory exists
    if (!fs.existsSync(audioDir)) {
      fs.mkdirSync(audioDir, { recursive: true })
    }

    const filePath = path.join(audioDir, fileName)

    // Generate enhanced TTS using OpenAI's GPT-4o-audio-preview
    const completion = await openai.chat.completions.create({
      model: "gpt-4o-audio-preview",
      modalities: ["text", "audio"],
      audio: { voice: voice, format: "mp3" },
      messages: [
        {
          role: "system",
          content: systemPrompt || "You are a helpful assistant that can generate audio from text.",
        },
        {
          role: "user",
          content: text,
        },
      ],
    })

    // Get the base64 audio data and decode it
    const audioData = completion.choices[0].message.audio?.data

    if (!audioData) {
      throw new Error("No audio data received from OpenAI")
    }

    // Convert base64 to buffer
    const buffer = Buffer.from(audioData, "base64")

    // Write the buffer to a file
    fs.writeFileSync(filePath, buffer)

    // Return the URL to the generated audio file and the text response
    return NextResponse.json({
      url: `/audio/${fileName}`,
      text: text,
      voice: voice,
      textResponse: completion.choices[0].message.content,
    })
  } catch (error) {
    console.error("Error generating enhanced TTS:", error)
    return NextResponse.json({ error: "Failed to generate enhanced text-to-speech audio" }, { status: 500 })
  }
}
