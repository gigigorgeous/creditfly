// Complete Suno API Client with ALL Features
export interface SunoTrack {
  id: string
  title: string
  audio_url: string
  video_url?: string
  image_url?: string
  image_large_url?: string
  major_model_version: string
  model_name: string
  metadata: {
    prompt?: string
    gpt_description_prompt?: string
    audio_prompt_id?: string
    history?: any
    concat_history?: any[]
    type?: string
    duration?: number
    refund_credits?: true
    stream?: boolean
    tags?: string
    error_type?: string
    error_message?: string
  }
  is_video_pending: boolean
  major_model_version_v2: string
  is_liked: boolean
  user_id: string
  display_name: string
  handle: string
  is_handle_updated: boolean
  avatar_image_url?: string
  is_trashed: boolean
  reaction?: any
  created_at: string
  status: "queued" | "streaming" | "complete" | "error"
  play_count: number
  upvote_count: number
  is_public: boolean
}

export interface SunoGenerateRequest {
  // Basic fields
  prompt: string
  tags?: string
  negative_tags?: string
  title?: string
  mv?: string
  make_instrumental?: boolean

  // GPT description mode
  gpt_description_prompt?: string

  // Continue/Extend
  continue_clip_id?: string | null
  continue_at?: number | null
  continued_aligned_prompt?: string | null

  // Infill/Replace section
  infill_start_s?: number | null
  infill_end_s?: number | null
  infill_dur_s?: number | null
  infill_context_start_s?: number | null
  infill_context_end_s?: number | null

  // Task types
  task?:
    | "extend"
    | "cover"
    | "infill"
    | "gen_stem"
    | "artist_consistency"
    | "underpainting"
    | "overpainting"
    | "upload_extend"
  generation_type?: "TEXT" | "INSTRUMENTAL"

  // Cover
  cover_clip_id?: string

  // Stems
  stem_type_id?: number
  stem_type_group_name?: "Two" | "Twelve"
  stem_task?: "two" | "twelve"

  // Persona
  persona_id?: string
  artist_clip_id?: string

  // Underpainting/Overpainting
  underpainting_clip_id?: string
  underpainting_start_s?: number
  underpainting_end_s?: number
  overpainting_clip_id?: string
  overpainting_start_s?: number
  overpainting_end_s?: number
  override_fields?: string[]

  // Advanced controls
  metadata?: {
    create_mode?: string
    control_sliders?: {
      style_weight?: number
      audio_weight?: number
      weirdness_constraint?: number
    }
    can_control_sliders?: string[]
    vocalgender?: "f" | "m"
    infill_lyrics?: string
  }
}

export interface PersonaCreateRequest {
  root_clip_id: string
  name: string
  description: string
  clips: string[]
  is_public: boolean
}

export class SunoClient {
  private baseUrl = "https://api.cometapi.com"
  private apiKey: string

  constructor(apiKey: string) {
    this.apiKey = apiKey
  }

  private async request(method: string, endpoint: string, data?: any): Promise<any> {
    const url = `${this.baseUrl}${endpoint}`

    try {
      const options: RequestInit = {
        method,
        headers: {
          Accept: "*/*",
          Authorization: `Bearer ${this.apiKey}`,
          "Content-Type": "application/json",
        },
      }

      if (data) {
        options.body = JSON.stringify(data)
      }

      const response = await fetch(url, options)

      if (!response.ok) {
        const errorText = await response.text().catch(() => "Unknown error")
        throw new Error(`Suno API error: ${response.status} - ${errorText}`)
      }

      return response.json()
    } catch (error) {
      console.error("Suno API request failed:", error)
      throw error
    }
  }

  // Scenario 1-4: Generate music
  async generateMusic(request: SunoGenerateRequest): Promise<{ code: string; data: string; message: string }> {
    return this.request("POST", "/suno/submit/music", request)
  }

  // Get track status
  async getTrack(taskId: string): Promise<{ code: string; data: SunoTrack[]; message: string }> {
    return this.request("GET", `/suno/fetch/${taskId}`)
  }

  // Generate lyrics
  async generateLyrics(prompt: string, notifyHook?: string): Promise<{ code: string; data: string; message: string }> {
    return this.request("POST", "/suno/submit/lyrics", {
      prompt,
      notify_hook: notifyHook,
    })
  }

  // Upload audio from URL
  async uploadAudio(url: string): Promise<{ code: string; data: string; message: string }> {
    return this.request("POST", "/suno/uploads/audio-url", { url })
  }

  // Concat clips
  async concatClips(clipId: string, isInfill: boolean): Promise<{ code: string; data: string; message: string }> {
    return this.request("POST", "/suno/submit/music/concat", {
      clip_id: clipId,
      is_infill: isInfill,
    })
  }

  // Create persona
  async createPersona(request: PersonaCreateRequest): Promise<{ code: string; data: { id: string }; message: string }> {
    return this.request("POST", "/suno/persona/create", request)
  }

  // Get timing/lyrics timeline
  async getTiming(clipId: string): Promise<any> {
    return this.request("GET", `/suno/act/timing/${clipId}`)
  }

  // Get WAV file
  async getWav(clipId: string): Promise<{ code: string; data: { wav_file_url: string }; message: string }> {
    return this.request("GET", `/suno/act/wav/${clipId}`)
  }

  // Get MP4 video
  async getMp4(clipId: string): Promise<{ code: string; data: { mp4_file_url: string }; message: string }> {
    return this.request("GET", `/suno/act/mp4/${clipId}`)
  }

  // Get MIDI
  async getMidi(clipId: string): Promise<{
    state: "running" | "complete"
    instruments?: Array<{
      name: string
      notes: Array<{
        pitch: number
        start: number
        end: number
        velocity: number
      }>
    }>
  }> {
    return this.request("GET", `/suno/act/midi/${clipId}`)
  }
}

// Helper to create client
export function createSunoClient(): SunoClient | null {
  const apiKey = process.env.SUNO_API_KEY

  if (!apiKey) {
    console.warn("SUNO_API_KEY not configured")
    return null
  }

  return new SunoClient(apiKey)
}

// Model version mapping
export const SUNO_MODELS = {
  "v3.0": "chirp-v3.0",
  "v3.5": "chirp-v3.5",
  "v4.0": "chirp-v4",
  "v4.5": "chirp-auk",
  "v4.5+": "chirp-bluejay",
  v5: "chirp-crow",
} as const

export type SunoModelVersion = keyof typeof SUNO_MODELS
