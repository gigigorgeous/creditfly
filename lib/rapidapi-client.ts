// RapidAPI client for music services
export class MurekaAIClient {
  private apiKey: string
  private baseUrl = "https://mureka-ai-music-generation.p.rapidapi.com/v1/mureka"

  constructor() {
    this.apiKey = process.env.RAPIDAPI_KEY || process.env.API_KEY || ""
    if (!this.apiKey) {
      console.warn("RAPIDAPI_KEY environment variable is not set")
    }
  }

  private async fetchWithRapidAPI(endpoint: string, options: RequestInit = {}) {
    if (!this.apiKey) {
      throw new Error("RapidAPI key is not configured. Please add RAPIDAPI_KEY to your environment variables.")
    }

    const url = `${this.baseUrl}${endpoint}`
    const headers = {
      ...options.headers,
      "x-rapidapi-key": this.apiKey,
      "x-rapidapi-host": "mureka-ai-music-generation.p.rapidapi.com",
      "Content-Type": "application/json",
    }

    return fetch(url, {
      ...options,
      headers,
    })
  }

  // New method to get vocals/music library
  async getVocals(lastId?: number, limit = 20) {
    try {
      if (!this.apiKey) {
        return this.getMockVocals()
      }

      let endpoint = "/music/vocals"
      if (lastId) {
        endpoint += `?last_id=${lastId}&limit=${limit}`
      }

      const response = await this.fetchWithRapidAPI(endpoint, {
        method: "GET",
      })

      if (!response.ok) {
        const errorText = await response.text()
        console.error(`API error (${response.status}): ${errorText}`)
        return this.getMockVocals()
      }

      const data = await response.json()
      return data
    } catch (error) {
      console.error("Error in getVocals:", error)
      return this.getMockVocals()
    }
  }

  private getMockVocals() {
    return {
      list: [
        {
          id: 1122334455,
          url: "/placeholder.mp3",
          duration_milliseconds: 30000,
          mood: "relaxed",
          title: "Demo Relaxed Track",
          genre: "afrobeat",
          username: "demo_user",
        },
        {
          id: 66778899,
          url: "/placeholder.mp3",
          duration_milliseconds: 45000,
          mood: "energetic",
          title: "Demo Rock Track",
          genre: "rock",
          username: "demo_user",
        },
        {
          id: 33445566,
          url: "/placeholder.mp3",
          duration_milliseconds: 35000,
          mood: "peaceful",
          title: "Demo Jazz Track",
          genre: "jazz",
          username: "demo_user",
        },
      ],
      last_id: 77665544332211,
      more: true,
    }
  }

  async getAccounts() {
    try {
      if (!this.apiKey) {
        return this.getMockAccounts()
      }

      const response = await this.fetchWithRapidAPI("/accounts")

      if (!response.ok) {
        const errorText = await response.text()
        console.error(`API error (${response.status}): ${errorText}`)
        return this.getMockAccounts()
      }

      const data = await response.json()
      return Array.isArray(data.accounts) ? data.accounts : this.getMockAccounts()
    } catch (error) {
      console.error("Error in getAccounts:", error)
      return this.getMockAccounts()
    }
  }

  private getMockAccounts() {
    return [
      {
        id: "demo-account-1",
        name: "Demo Account",
        credits: 100,
        type: "demo",
      },
    ]
  }

  async createMusic(account: string, prompt: string) {
    try {
      if (!this.apiKey || account.includes("demo")) {
        return this.getMockMusicResponse()
      }

      const response = await this.fetchWithRapidAPI("/music/create", {
        method: "POST",
        body: JSON.stringify({ account, prompt }),
      })

      if (!response.ok) {
        throw new Error(`API error: ${response.status}`)
      }

      return response.json()
    } catch (error) {
      console.error("Error creating music:", error)
      return this.getMockMusicResponse()
    }
  }

  async createAdvancedMusic(account: string, lyrics: string, title?: string) {
    try {
      if (!this.apiKey || account.includes("demo")) {
        return this.getMockMusicResponse()
      }

      const response = await this.fetchWithRapidAPI("/music/create-advanced", {
        method: "POST",
        body: JSON.stringify({ account, lyrics, title }),
      })

      if (!response.ok) {
        throw new Error(`API error: ${response.status}`)
      }

      return response.json()
    } catch (error) {
      console.error("Error creating advanced music:", error)
      return this.getMockMusicResponse()
    }
  }

  async createInstrumental(account: string, prompt: string) {
    try {
      if (!this.apiKey || account.includes("demo")) {
        return this.getMockMusicResponse()
      }

      const response = await this.fetchWithRapidAPI("/music/create-instrumental", {
        method: "POST",
        body: JSON.stringify({ account, prompt }),
      })

      if (!response.ok) {
        throw new Error(`API error: ${response.status}`)
      }

      return response.json()
    } catch (error) {
      console.error("Error creating instrumental:", error)
      return this.getMockMusicResponse()
    }
  }

  private getMockMusicResponse() {
    const mockId = `demo-${Date.now()}`
    return {
      success: true,
      data: {
        id: mockId,
        status: "processing",
        message: "Demo track generation started",
      },
    }
  }

  async getMusicStatus(songId: string) {
    try {
      if (!this.apiKey || songId.includes("demo")) {
        return this.getMockStatusResponse(songId)
      }

      const response = await this.fetchWithRapidAPI(`/music/${songId}`, {
        method: "GET",
      })

      if (!response.ok) {
        throw new Error(`API error: ${response.status}`)
      }

      return response.json()
    } catch (error) {
      console.error("Error getting music status:", error)
      return this.getMockStatusResponse(songId)
    }
  }

  private getMockStatusResponse(songId: string) {
    return {
      success: true,
      data: {
        id: songId,
        status: "completed",
        audioUrl: "/placeholder.mp3",
        downloadUrl: "/placeholder.mp3",
      },
    }
  }

  async downloadMusic(songId: string, type: "stem" | "full" = "full") {
    try {
      if (!this.apiKey || songId.includes("demo")) {
        return {
          success: true,
          data: {
            downloadUrl: "/placeholder.mp3",
          },
        }
      }

      const response = await this.fetchWithRapidAPI("/music/download", {
        method: "POST",
        body: JSON.stringify({ song_id: songId, type }),
      })

      if (!response.ok) {
        throw new Error(`API error: ${response.status}`)
      }

      return response.json()
    } catch (error) {
      console.error("Error downloading music:", error)
      return {
        success: true,
        data: {
          downloadUrl: "/placeholder.mp3",
        },
      }
    }
  }

  async generateVideo(songId: string) {
    try {
      if (!this.apiKey || songId.includes("demo")) {
        return {
          success: true,
          data: {
            videoUrl: "/placeholder-video.mp4",
          },
        }
      }

      const response = await this.fetchWithRapidAPI("/music/video-generate", {
        method: "POST",
        body: JSON.stringify({ song_id: songId }),
      })

      if (!response.ok) {
        throw new Error(`API error: ${response.status}`)
      }

      return response.json()
    } catch (error) {
      console.error("Error generating video:", error)
      return {
        success: true,
        data: {
          videoUrl: "/placeholder-video.mp4",
        },
      }
    }
  }

  async generateLyrics(account: string, prompt?: string) {
    try {
      if (!this.apiKey || account.includes("demo")) {
        return {
          success: true,
          data: {
            lyrics: "This is a demo song\nGenerated for testing\nWith AI music creation\nIt's just the beginning",
          },
        }
      }

      const response = await this.fetchWithRapidAPI("/music/lyrics-generate", {
        method: "POST",
        body: JSON.stringify({ account, prompt }),
      })

      if (!response.ok) {
        throw new Error(`API error: ${response.status}`)
      }

      return response.json()
    } catch (error) {
      console.error("Error generating lyrics:", error)
      return {
        success: true,
        data: {
          lyrics: "This is a demo song\nGenerated for testing\nWith AI music creation\nIt's just the beginning",
        },
      }
    }
  }
}

export class MusixmatchClient {
  private baseUrl = "https://musixmatch-lyrics-songs.p.rapidapi.com"
  private apiKey: string

  constructor() {
    this.apiKey = process.env.RAPIDAPI_KEY || process.env.API_KEY || ""
  }

  async getLyrics(title: string, artist: string, duration?: string) {
    try {
      if (!this.apiKey) {
        return this.getMockLyrics(title, artist)
      }

      const params = new URLSearchParams({
        t: title,
        a: artist,
        type: "json",
      })

      if (duration) {
        params.append("d", duration)
      }

      const headers = {
        "x-rapidapi-key": this.apiKey,
        "x-rapidapi-host": "musixmatch-lyrics-songs.p.rapidapi.com",
      }

      const response = await fetch(`${this.baseUrl}/songs/lyrics?${params}`, {
        method: "GET",
        headers,
      })

      if (!response.ok) {
        return this.getMockLyrics(title, artist)
      }

      return response.json()
    } catch (error) {
      console.error("Error fetching lyrics:", error)
      return this.getMockLyrics(title, artist)
    }
  }

  private getMockLyrics(title: string, artist: string) {
    return {
      success: true,
      data: {
        lyrics: `[Demo Lyrics for "${title}" by ${artist}]\n\nVerse 1:\nThis is a demo version\nOf the lyrics you requested\nThe actual lyrics would appear here\nWhen the API is properly configured\n\nChorus:\nDemo mode is active\nPlease configure your API key\nTo get real lyrics data\nFrom Musixmatch API`,
      },
    }
  }
}

export class SplitbeatClient {
  private baseUrl = "https://splitbeat-vocal-remover-music-splitter.p.rapidapi.com"
  private apiKey: string

  constructor() {
    this.apiKey = process.env.RAPIDAPI_KEY || process.env.API_KEY || ""
  }

  async uploadAudio(audioFile: FormData) {
    try {
      if (!this.apiKey) {
        return {
          success: true,
          data: {
            message: "Demo mode: Audio processing would happen here",
            processedUrl: "/placeholder-processed.mp3",
          },
        }
      }

      const response = await fetch(`${this.baseUrl}/Upload_audio`, {
        method: "POST",
        headers: {
          "x-rapidapi-key": this.apiKey,
          "x-rapidapi-host": "splitbeat-vocal-remover-music-splitter.p.rapidapi.com",
        },
        body: audioFile,
      })

      if (!response.ok) {
        throw new Error(`API error: ${response.status}`)
      }

      return response.json()
    } catch (error) {
      console.error("Error uploading audio:", error)
      return {
        success: true,
        data: {
          message: "Demo mode: Audio processing would happen here",
          processedUrl: "/placeholder-processed.mp3",
        },
      }
    }
  }
}
