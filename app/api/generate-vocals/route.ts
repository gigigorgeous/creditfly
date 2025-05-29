import { NextResponse } from "next/server"
import { writeFile } from "fs/promises"
import { v4 as uuidv4 } from "uuid"
import path from "path"
import fs from "fs"

// Ensure the vocals directory exists
const ensureVocalsDir = () => {
  const publicDir = path.join(process.cwd(), "public")
  const vocalsDir = path.join(publicDir, "vocals")

  if (!fs.existsSync(vocalsDir)) {
    fs.mkdirSync(vocalsDir, { recursive: true })
  }

  return vocalsDir
}

// Check if OpenAI API key is available
if (!process.env.OPENAI_API_KEY) {
  console.warn("Warning: OPENAI_API_KEY is not set. Vocal generation will use fallback mode.")
}

export async function POST(request: Request) {
  try {
    const { lyrics, voice = "alloy", emotion = "passionate" } = await request.json()

    // Validate input
    if (!lyrics) {
      return NextResponse.json({ error: "Lyrics are required" }, { status: 400 })
    }

    // If no API key, return a mock response
    if (!process.env.OPENAI_API_KEY) {
      return NextResponse.json({
        success: true,
        audioUrl: "/api/stream-audio/vocal-demo",
        message: "Running in demo mode. Add your OpenAI API key for real vocal generation.",
      })
    }

    // Fix any potential Unicode escape sequence issues in the prompt string
    // Change the template string to use standard quotes and line breaks

    // Create a prompt that instructs the model how to sing
    const prompt =
      "Sing these lyrics with " +
      emotion +
      " emotion, in a " +
      voice +
      " voice style:\n\n" +
      lyrics +
      "\n\nMake it sound musical and match the rhythm of the lyrics."

    // Make a direct fetch to OpenAI API instead of using the client library
    // This avoids the browser environment detection issue
    const response = await fetch("https://api.openai.com/v1/audio/speech", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${process.env.OPENAI_API_KEY || ""}`,
      },
      body: JSON.stringify({
        model: "tts-1",
        voice: voice,
        input: prompt,
        response_format: "mp3",
      }),
    })

    if (!response.ok) {
      const errorData = await response.json().catch(() => null)
      throw new Error(
        `OpenAI API error: ${response.status} ${errorData ? JSON.stringify(errorData) : response.statusText}`,
      )
    }

    // Get the audio data as a buffer
    const audioBuffer = await response.arrayBuffer()

    if (!audioBuffer || audioBuffer.byteLength === 0) {
      throw new Error("No audio data received from OpenAI")
    }

    // Generate a unique filename
    const filename = `vocal-${uuidv4()}.mp3`

    // Ensure the vocals directory exists
    const vocalsDir = ensureVocalsDir()
    const filePath = path.join(vocalsDir, filename)

    // Save the file
    await writeFile(filePath, Buffer.from(audioBuffer))

    // Return the URL to the saved file
    return NextResponse.json({
      success: true,
      audioUrl: `/vocals/${filename}`,
      message: "Vocal track generated successfully",
    })
  } catch (error) {
    console.error("Error generating vocals:", error)
    return NextResponse.json(
      {
        error: "Failed to generate vocals",
        message: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 },
    )
  }
}
