import { NextResponse } from "next/server"
import { openai } from "@/lib/openai"
import fs from "fs"
import path from "path"
import { v4 as uuidv4 } from "uuid"

export async function POST(request: Request) {
  try {
    const { text, voice = "alloy" } = await request.json()

    if (!text) {
      return NextResponse.json({ error: "Text is required" }, { status: 400 })
    }

    // Check if OpenAI API key is available
    if (!process.env.OPENAI_API_KEY) {
      return NextResponse.json({ error: "OpenAI API key is required for TTS generation" }, { status: 400 })
    }

    // Generate a unique filename
    const fileName = `tts-${uuidv4()}.mp3`

    // In a production environment, you would likely use a storage service
    // For this example, we'll use the public directory
    const publicDir = path.join(process.cwd(), "public")
    const audioDir = path.join(publicDir, "audio")

    // Ensure the directory exists
    if (!fs.existsSync(audioDir)) {
      fs.mkdirSync(audioDir, { recursive: true })
    }

    const filePath = path.join(audioDir, fileName)

    // Generate TTS using OpenAI
    const mp3 = await openai.audio.speech.create({
      model: "tts-1-hd",
      voice: voice,
      input: text,
    })

    // Convert the response to a buffer
    const buffer = Buffer.from(await mp3.arrayBuffer())

    // Write the buffer to a file
    fs.writeFileSync(filePath, buffer)

    // Return the URL to the generated audio file
    return NextResponse.json({
      url: `/audio/${fileName}`,
      text: text,
      voice: voice,
    })
  } catch (error) {
    console.error("Error generating TTS:", error)
    return NextResponse.json({ error: "Failed to generate text-to-speech audio" }, { status: 500 })
  }
}
