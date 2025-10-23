// Suno API utility functions

// Base URL for Suno API
const SUNO_API_BASE_URL = "https://api.suno.ai/v1"

// Interface for Suno generation options
export interface SunoGenerationOptions {
  prompt: string
  title?: string
  reference_song_id?: string
  bpm?: number
  key?: string
  mode?: string
  duration?: number
  tags?: string[]
  style_preset?: string
  continuation?: boolean
  continuation_start?: number
  continuation_end?: number
}

// Interface for Suno generation response
export interface SunoGenerationResponse {
  id: string
  status: "queued" | "in_progress" | "complete" | "failed"
  title: string
  audio_url?: string
  created_at: string
  updated_at: string
  error?: string
}

/**
 * Generate a song using Suno API
 */
export async function generateSunoSong(options: SunoGenerationOptions): Promise<SunoGenerationResponse> {
  if (!process.env.SUNO_API_KEY) {
    throw new Error("SUNO_API_KEY is not defined")
  }

  try {
    // Ensure we have a valid prompt
    if (!options.prompt || options.prompt.trim() === "") {
      throw new Error("Prompt is required for Suno generation")
    }

    // Ensure we have a title
    const title = options.title || "Untitled Track"

    console.log("Generating song with Suno:", {
      title,
      promptLength: options.prompt.length,
      hasDuration: !!options.duration,
    })

    const response = await fetch(`${SUNO_API_BASE_URL}/generate`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${process.env.SUNO_API_KEY}`,
      },
      body: JSON.stringify({
        prompt: options.prompt,
        title: title,
        reference_song_id: options.reference_song_id,
        bpm: options.bpm,
        key: options.key,
        mode: options.mode,
        duration: options.duration,
        tags: options.tags,
        style_preset: options.style_preset,
        continuation: options.continuation,
        continuation_start: options.continuation_start,
        continuation_end: options.continuation_end,
      }),
    })

    if (!response.ok) {
      const errorText = await response.text()
      let errorData
      try {
        errorData = JSON.parse(errorText)
      } catch (e) {
        errorData = { message: errorText }
      }

      console.error("Suno API error response:", errorData)
      throw new Error(`Suno API error: ${JSON.stringify(errorData)}`)
    }

    const data = await response.json()
    console.log("Suno generation successful:", { id: data.id, status: data.status })
    return data
  } catch (error) {
    console.error("Error generating song with Suno:", error)
    throw error
  }
}

/**
 * Check the status of a Suno generation
 */
export async function checkSunoGenerationStatus(generationId: string): Promise<SunoGenerationResponse> {
  if (!process.env.SUNO_API_KEY) {
    throw new Error("SUNO_API_KEY is not defined")
  }

  try {
    console.log("Checking Suno generation status:", generationId)

    const response = await fetch(`${SUNO_API_BASE_URL}/generations/${generationId}`, {
      method: "GET",
      headers: {
        Authorization: `Bearer ${process.env.SUNO_API_KEY}`,
      },
    })

    if (!response.ok) {
      const errorText = await response.text()
      let errorData
      try {
        errorData = JSON.parse(errorText)
      } catch (e) {
        errorData = { message: errorText }
      }

      console.error("Suno API error response:", errorData)
      throw new Error(`Suno API error: ${JSON.stringify(errorData)}`)
    }

    const data = await response.json()
    console.log("Suno generation status:", { id: data.id, status: data.status })
    return data
  } catch (error) {
    console.error("Error checking Suno generation status:", error)
    throw error
  }
}

/**
 * Get a list of user's Suno generations
 */
export async function listSunoGenerations(limit = 10, offset = 0): Promise<{ generations: SunoGenerationResponse[] }> {
  if (!process.env.SUNO_API_KEY) {
    throw new Error("SUNO_API_KEY is not defined")
  }

  try {
    const response = await fetch(`${SUNO_API_BASE_URL}/generations?limit=${limit}&offset=${offset}`, {
      method: "GET",
      headers: {
        Authorization: `Bearer ${process.env.SUNO_API_KEY}`,
      },
    })

    if (!response.ok) {
      const errorText = await response.text()
      let errorData
      try {
        errorData = JSON.parse(errorText)
      } catch (e) {
        errorData = { message: errorText }
      }

      console.error("Suno API error response:", errorData)
      throw new Error(`Suno API error: ${JSON.stringify(errorData)}`)
    }

    return await response.json()
  } catch (error) {
    console.error("Error listing Suno generations:", error)
    throw error
  }
}
