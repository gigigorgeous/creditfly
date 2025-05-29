import { NextResponse } from "next/server"
import { exec } from "child_process"
import { writeFile, mkdir } from "fs/promises"
import { existsSync } from "fs"
import { join } from "path"
import { v4 as uuidv4 } from "uuid"

// Ensure the audio directory exists
async function ensureAudioDir() {
  const audioDir = join(process.cwd(), "public", "audio")
  if (!existsSync(audioDir)) {
    await mkdir(audioDir, { recursive: true })
  }
  return audioDir
}

// Ensure the scripts directory exists
async function ensureScriptsDir() {
  const scriptsDir = join(process.cwd(), "scripts")
  if (!existsSync(scriptsDir)) {
    await mkdir(scriptsDir, { recursive: true })
  }
  return scriptsDir
}

export async function POST(request: Request) {
  try {
    const {
      text,
      frequencies = [440, 660, 880],
      durations = [1000, 1000, 1000],
      amplitudes = [-20, -20, -20],
    } = await request.json()

    if (!text) {
      return NextResponse.json({ error: "Text is required" }, { status: 400 })
    }

    // Generate unique IDs for the audio files
    const musicId = uuidv4()
    const voiceId = uuidv4()

    // Ensure directories exist
    const audioDir = await ensureAudioDir()
    const scriptsDir = await ensureScriptsDir()

    // Create paths for the output files
    const musicFilename = `music-${musicId}.wav`
    const voiceFilename = `voice-${voiceId}.mp3`
    const musicPath = join(audioDir, musicFilename)
    const voicePath = join(audioDir, voiceFilename)

    // Create a Python script file with the provided code and parameters
    const scriptPath = join(scriptsDir, `generate_audio_${musicId}.py`)

    // Prepare the Python script content with the provided parameters
    const scriptContent = `
import numpy as np
from pydub.generators import Sine
from pydub import AudioSegment
from gtts import gTTS
import io
import os

# Function to generate simple sine wave instrument sounds
def generate_tone(frequency=440, duration=1000, amplitude=-20):
    tone = Sine(frequency).to_audio_segment(duration=duration).apply_gain(amplitude)
    return tone

# Function to generate voice with gTTS
def generate_voice(text="Hello, this is AI-generated music."):
    tts = gTTS(text=text, lang="en")
    voice_io = io.BytesIO()
    tts.write_to_fp(voice_io)
    voice_io.seek(0)
    return voice_io

# Create generative music with instruments
frequencies = ${JSON.stringify(frequencies)}
durations = ${JSON.stringify(durations)}
amplitudes = ${JSON.stringify(amplitudes)}

# Start with an empty segment
music = AudioSegment.silent(duration=0)

# Add each tone
for i in range(len(frequencies)):
    freq = frequencies[i]
    dur = durations[i] if i < len(durations) else 1000
    amp = amplitudes[i] if i < len(amplitudes) else -20
    music += generate_tone(freq, dur, amp)

# Generate voice
voice_io = generate_voice(${JSON.stringify(text)})

# Save generated music
music.export("${musicPath.replace(/\\/g, "/")}", format="wav")

# Save generated voice
with open("${voicePath.replace(/\\/g, "/")}", "wb") as f:
    f.write(voice_io.read())

print("Audio generation complete")
`

    // Write the Python script to a file
    await writeFile(scriptPath, scriptContent)

    // Execute the Python script
    const executePython = () => {
      return new Promise<void>((resolve, reject) => {
        exec(`python "${scriptPath}"`, (error, stdout, stderr) => {
          if (error) {
            console.error(`Python execution error: ${error.message}`)
            console.error(`stderr: ${stderr}`)
            reject(error)
            return
          }
          console.log(`Python script output: ${stdout}`)
          resolve()
        })
      })
    }

    await executePython()

    // Return the URLs to the generated audio files
    return NextResponse.json({
      success: true,
      musicUrl: `/audio/${musicFilename}`,
      voiceUrl: `/audio/${voiceFilename}`,
    })
  } catch (error) {
    console.error("Error generating audio:", error)
    return NextResponse.json(
      { error: "Failed to generate audio", message: error instanceof Error ? error.message : "Unknown error" },
      { status: 500 },
    )
  }
}
