// Music API integrations for multiple providers

export interface MusicTrack {
  id: string
  title: string
  artist?: string
  audioUrl: string
  duration?: number
  genre?: string
  mood?: string
  bpm?: number
  key?: string
  createdAt: string
  provider: "suno" | "udio" | "musicgen" | "basic"
  status: "queued" | "in_progress" | "complete" | "failed"
  thumbnailUrl?: string
  waveformUrl?: string
  lyrics?: string
  tags?: string[]
}

export interface MusicGenerationRequest {
  prompt: string
  title?: string
  genre?: string
  mood?: string
  style?: string
  lyrics?: string
  duration?: number
  bpm?: number
  key?: string
  tags?: string[]
  referenceTrackId?: string
  provider?: "suno" | "udio" | "musicgen" | "auto"
}

// Suno API Integration - Using correct production endpoints
export class SunoAPI {
  private baseUrl = "https://studio-api.prod.suno.com"
  private apiKey: string

  constructor(apiKey: string) {
    this.apiKey = apiKey
  }

  async generateMusic(request: MusicGenerationRequest): Promise<MusicTrack> {
    try {
      const payload = {
        prompt: request.lyrics || request.prompt,
        tags: request.tags?.join(", ") || `${request.genre || ""}, ${request.mood || ""}`.trim(),
        title: request.title || "Untitled Track",
        mv: "chirp-v3-5",
        continue_clip_id: null,
        continue_at: 0,
        generation_type: request.lyrics ? "TEXT" : "DESCRIPTION",
        task: null,
      }

      const response = await fetch(`${this.baseUrl}/api/generate/v2-web/`, {
        method: "POST",
        headers: {
          Accept: "*/*",
          Authorization: `Bearer ${this.apiKey}`,
          "Content-Type": "text/plain;charset=UTF-8",
        },
        body: JSON.stringify(payload),
      })

      if (!response.ok) {
        const errorText = await response.text().catch(() => "Unknown error")
        throw new Error(`Suno API error: ${response.status} - ${errorText}`)
      }

      const data = await response.json()
      const clips = data.clips || []

      if (clips.length === 0) {
        throw new Error("No clips generated")
      }

      // Return the first clip
      const clip = clips[0]

      return {
        id: clip.id,
        title: clip.title || request.title || "Untitled",
        audioUrl: clip.audio_url || "",
        duration: clip.duration,
        genre: request.genre,
        mood: request.mood,
        createdAt: clip.created_at || new Date().toISOString(),
        provider: "suno",
        status: clip.status || "queued",
        lyrics: request.lyrics,
        tags: request.tags,
        thumbnailUrl: clip.image_url,
      }
    } catch (error) {
      console.error("Suno API generation error:", error)
      throw error
    }
  }

  async getTrackStatus(trackId: string): Promise<MusicTrack> {
    try {
      const response = await fetch(`${this.baseUrl}/api/feed/v2?ids=${trackId}`, {
        headers: {
          Accept: "*/*",
          Authorization: `Bearer ${this.apiKey}`,
        },
      })

      if (!response.ok) {
        throw new Error(`Failed to get track status: HTTP ${response.status}`)
      }

      const data = await response.json()
      const clips = data.clips || []

      if (clips.length === 0) {
        throw new Error("Track not found")
      }

      const clip = clips[0]

      return {
        id: clip.id,
        title: clip.title,
        audioUrl: clip.audio_url,
        duration: clip.duration,
        createdAt: clip.created_at,
        provider: "suno",
        status: clip.status,
        thumbnailUrl: clip.image_url,
        lyrics: clip.metadata?.prompt,
        tags: clip.metadata?.tags?.split(", "),
      }
    } catch (error) {
      console.error("Suno API status check error:", error)
      throw error
    }
  }

  async listTracks(limit = 20): Promise<MusicTrack[]> {
    try {
      const controller = new AbortController()
      const timeoutId = setTimeout(() => controller.abort(), 8000)

      // Suno's feed endpoint doesn't support listing all tracks without IDs
      // We'll return an empty array for now and rely on the database/storage
      clearTimeout(timeoutId)

      console.log("Note: Suno API doesn't support listing all tracks without IDs")
      return []
    } catch (error) {
      console.error("Suno API list tracks error:", error)
      throw error
    }
  }
}

// Udio API Integration (hypothetical - adjust based on actual API)
export class UdioAPI {
  private baseUrl = "https://api.udio.com/v1"
  private apiKey: string

  constructor(apiKey: string) {
    this.apiKey = apiKey
  }

  async generateMusic(request: MusicGenerationRequest): Promise<MusicTrack> {
    try {
      const response = await fetch(`${this.baseUrl}/generate`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${this.apiKey}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          prompt: request.prompt,
          title: request.title,
          genre: request.genre,
          mood: request.mood,
          duration: request.duration,
          lyrics: request.lyrics,
        }),
      })

      if (!response.ok) {
        const error = await response.json().catch(() => ({ message: `HTTP ${response.status}` }))
        throw new Error(`Udio API error: ${error.message || "Unknown error"}`)
      }

      const data = await response.json()

      return {
        id: data.id,
        title: data.title || request.title || "Untitled",
        audioUrl: data.audio_url || "",
        duration: data.duration,
        genre: request.genre,
        mood: request.mood,
        createdAt: new Date().toISOString(),
        provider: "udio",
        status: "queued",
        lyrics: request.lyrics,
        tags: request.tags,
      }
    } catch (error) {
      console.error("Udio API generation error:", error)
      throw error
    }
  }

  async getTrackStatus(trackId: string): Promise<MusicTrack> {
    try {
      const response = await fetch(`${this.baseUrl}/tracks/${trackId}`, {
        headers: {
          Authorization: `Bearer ${this.apiKey}`,
        },
      })

      if (!response.ok) {
        throw new Error(`Failed to get track status: HTTP ${response.status}`)
      }

      const data = await response.json()

      return {
        id: data.id,
        title: data.title,
        audioUrl: data.audio_url,
        duration: data.duration,
        createdAt: data.created_at,
        provider: "udio",
        status: data.status,
        lyrics: data.lyrics,
        tags: data.tags,
      }
    } catch (error) {
      console.error("Udio API status check error:", error)
      throw error
    }
  }
}

// MusicGen API Integration (Meta's MusicGen)
export class MusicGenAPI {
  private baseUrl = "https://api.replicate.com/v1"
  private apiKey: string

  constructor(apiKey: string) {
    this.apiKey = apiKey
  }

  async generateMusic(request: MusicGenerationRequest): Promise<MusicTrack> {
    try {
      const response = await fetch(`${this.baseUrl}/predictions`, {
        method: "POST",
        headers: {
          Authorization: `Token ${this.apiKey}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          version: "671ac645ce5e552cc63a54a2bbff63fcf798043055d2dac5fc9e36a837eedcfb",
          input: {
            prompt: request.prompt,
            duration: request.duration || 30,
            temperature: 1,
            top_k: 250,
            top_p: 0,
            seed: Math.floor(Math.random() * 1000000),
          },
        }),
      })

      if (!response.ok) {
        const error = await response.json().catch(() => ({ detail: `HTTP ${response.status}` }))
        throw new Error(`MusicGen API error: ${error.detail || "Unknown error"}`)
      }

      const data = await response.json()

      return {
        id: data.id,
        title: request.title || "Generated Track",
        audioUrl: "",
        duration: request.duration,
        genre: request.genre,
        mood: request.mood,
        createdAt: new Date().toISOString(),
        provider: "musicgen",
        status: "queued",
        lyrics: request.lyrics,
        tags: request.tags,
      }
    } catch (error) {
      console.error("MusicGen API generation error:", error)
      throw error
    }
  }

  async getTrackStatus(trackId: string): Promise<MusicTrack> {
    try {
      const response = await fetch(`${this.baseUrl}/predictions/${trackId}`, {
        headers: {
          Authorization: `Token ${this.apiKey}`,
        },
      })

      if (!response.ok) {
        throw new Error(`Failed to get track status: HTTP ${response.status}`)
      }

      const data = await response.json()

      return {
        id: data.id,
        title: "Generated Track",
        audioUrl: data.output?.[0] || "",
        duration: 30,
        createdAt: data.created_at,
        provider: "musicgen",
        status: data.status === "succeeded" ? "complete" : data.status === "failed" ? "failed" : "in_progress",
      }
    } catch (error) {
      console.error("MusicGen API status check error:", error)
      throw error
    }
  }
}

// Main Music Service that orchestrates all providers
export class MusicService {
  private sunoAPI?: SunoAPI
  private udionAPI?: UdioAPI
  private musicGenAPI?: MusicGenAPI

  constructor() {
    if (process.env.SUNO_API_KEY) {
      this.sunoAPI = new SunoAPI(process.env.SUNO_API_KEY)
    }
    if (process.env.UDIO_API_KEY) {
      this.udionAPI = new UdioAPI(process.env.UDIO_API_KEY)
    }
    if (process.env.REPLICATE_API_KEY) {
      this.musicGenAPI = new MusicGenAPI(process.env.REPLICATE_API_KEY)
    }
  }

  async generateMusic(request: MusicGenerationRequest): Promise<MusicTrack> {
    const provider = request.provider || this.selectBestProvider(request)

    switch (provider) {
      case "suno":
        if (!this.sunoAPI) throw new Error("Suno API not configured")
        return await this.sunoAPI.generateMusic(request)

      case "udio":
        if (!this.udionAPI) throw new Error("Udio API not configured")
        return await this.udionAPI.generateMusic(request)

      case "musicgen":
        if (!this.musicGenAPI) throw new Error("MusicGen API not configured")
        return await this.musicGenAPI.generateMusic(request)

      default:
        return this.generateBasicMusic(request)
    }
  }

  async getTrackStatus(trackId: string, provider: string): Promise<MusicTrack> {
    switch (provider) {
      case "suno":
        if (!this.sunoAPI) throw new Error("Suno API not configured")
        return await this.sunoAPI.getTrackStatus(trackId)

      case "udio":
        if (!this.udionAPI) throw new Error("Udio API not configured")
        return await this.udionAPI.getTrackStatus(trackId)

      case "musicgen":
        if (!this.musicGenAPI) throw new Error("MusicGen API not configured")
        return await this.musicGenAPI.getTrackStatus(trackId)

      default:
        throw new Error("Unknown provider")
    }
  }

  async listTracks(provider?: string): Promise<MusicTrack[]> {
    const tracks: MusicTrack[] = []

    // Note: Suno's API doesn't support listing all tracks without specific IDs
    // We'll need to store track IDs in a database to retrieve them later
    console.log("Suno API requires specific track IDs to retrieve tracks")

    return tracks
  }

  private selectBestProvider(request: MusicGenerationRequest): "suno" | "udio" | "musicgen" | "basic" {
    // Logic to select the best provider based on request characteristics
    if (request.lyrics && this.sunoAPI) return "suno"
    if (request.genre === "electronic" && this.musicGenAPI) return "musicgen"
    if (this.sunoAPI) return "suno"
    if (this.udionAPI) return "udio"
    if (this.musicGenAPI) return "musicgen"
    return "basic"
  }

  private async generateBasicMusic(request: MusicGenerationRequest): Promise<MusicTrack> {
    // Fallback basic generation
    const trackId = `basic_${Date.now()}`

    return {
      id: trackId,
      title: request.title || "Basic Generated Track",
      audioUrl: `/api/stream-audio/${trackId}`,
      duration: request.duration || 120,
      genre: request.genre,
      mood: request.mood,
      createdAt: new Date().toISOString(),
      provider: "basic",
      status: "complete",
      lyrics: request.lyrics,
      tags: request.tags,
    }
  }

  getAvailableProviders(): string[] {
    const providers: string[] = []
    if (this.sunoAPI) providers.push("suno")
    if (this.udionAPI) providers.push("udio")
    if (this.musicGenAPI) providers.push("musicgen")
    providers.push("basic")
    return providers
  }
}
