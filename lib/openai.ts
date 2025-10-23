import OpenAI from "openai"

// Initialize the OpenAI client
export const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
})

// Helper function for text generation
export async function generateText(prompt: string) {
  try {
    const completion = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: [{ role: "user", content: prompt }],
    })

    return completion.choices[0].message.content
  } catch (error) {
    console.error("Error generating text with OpenAI:", error)
    throw error
  }
}

// Helper function for music description generation
export async function generateMusicDescription(
  title: string,
  genre: string,
  mood: string,
  style: string,
  lyrics?: string,
  duration?: number,
) {
  const prompt = `
  Create a detailed music generation prompt for a ${genre} song with a ${mood} mood in ${style} style.
  ${lyrics ? `The lyrics are: ${lyrics}` : "This should be an instrumental piece."}
  ${duration ? `The song should be approximately ${Math.floor(duration / 60)}:${(duration % 60).toString().padStart(2, "0")} minutes long.` : ""}
  Title: ${title || "Untitled Track"}
  
  Format the response as a JSON object with the following structure:
  {
    "musicDescription": "detailed description of the music",
    "structure": ["intro", "verse1", "chorus", ...],
    "tempo": number (BPM),
    "key": "musical key",
    "instrumentation": ["instrument1", "instrument2", ...],
    "mixingNotes": "notes on how the track should be mixed and mastered"
  }
`

  const response = await generateText(prompt)

  try {
    return JSON.parse(response || "{}")
  } catch (error) {
    console.error("Error parsing OpenAI response:", error)
    throw new Error("Failed to parse AI response")
  }
}

// Helper function for text-to-speech generation
export async function generateSpeech(text: string, voice = "alloy") {
  try {
    const mp3 = await openai.audio.speech.create({
      model: "tts-1-hd",
      voice: voice as any, // Type assertion needed due to OpenAI types
      input: text,
    })

    return mp3
  } catch (error) {
    console.error("Error generating speech with OpenAI:", error)
    throw error
  }
}

// Helper function for enhanced TTS with GPT-4o-audio-preview
export async function generateEnhancedSpeech(text: string, voice = "alloy", systemPrompt = "") {
  try {
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

    return {
      audioData: completion.choices[0].message.audio?.data,
      textResponse: completion.choices[0].message.content,
    }
  } catch (error) {
    console.error("Error generating enhanced speech with OpenAI:", error)
    throw error
  }
}
