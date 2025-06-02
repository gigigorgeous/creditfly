export interface MusicGenerationOptions {
  title?: string
  lyrics?: string
  genre?: string
  mood?: string
  style?: string
  voiceType?: string
  duration?: number
  userId?: string
}

export interface GeneratedMusicData {
  id: string
  title: string
  audioUrl: string
  genre: string
  mood: string
  duration: number
  createdAt: string
  musicDescription: {
    musicDescription: string
    structure: string[]
    tempo: number
    key: string
    instrumentation: string[]
    theme?: string
    melody?: string
    harmony?: string
    rhythm?: string
  }
  aiGenerated: boolean
  userId?: string
}

// In-memory storage for generated music (temporary solution)
const musicStorage = new Map<string, GeneratedMusicData>()

// Genre-based audio URL mapping for demo purposes
const GENRE_AUDIO_URLS: Record<string, Record<string, string>> = {
  Pop: {
    Happy: "https://www.soundjay.com/misc/sounds/bell-ringing-05.wav",
    Sad: "https://www.soundjay.com/misc/sounds/bell-ringing-05.wav",
    Energetic: "https://www.soundjay.com/misc/sounds/bell-ringing-05.wav",
    default: "https://www.soundjay.com/misc/sounds/bell-ringing-05.wav",
  },
  Rock: {
    Happy: "https://www.soundjay.com/misc/sounds/bell-ringing-05.wav",
    Energetic: "https://www.soundjay.com/misc/sounds/bell-ringing-05.wav",
    default: "https://www.soundjay.com/misc/sounds/bell-ringing-05.wav",
  },
  Electronic: {
    Energetic: "https://www.soundjay.com/misc/sounds/bell-ringing-05.wav",
    default: "https://www.soundjay.com/misc/sounds/bell-ringing-05.wav",
  },
  default: {
    default: "https://www.soundjay.com/misc/sounds/bell-ringing-05.wav",
  },
}

export function getGenreBasedAudioUrl(genre: string, mood: string): string {
  const genreUrls = GENRE_AUDIO_URLS[genre] || GENRE_AUDIO_URLS.default
  return genreUrls[mood] || genreUrls.default || GENRE_AUDIO_URLS.default.default
}

// Simple in-memory storage functions
export function saveToMemoryStorage(musicData: GeneratedMusicData): void {
  musicStorage.set(musicData.id, musicData)
  console.log(`Music saved to memory storage: ${musicData.id}`)
}

export function getFromMemoryStorage(id: string): GeneratedMusicData | undefined {
  return musicStorage.get(id)
}

export function getAllFromMemoryStorage(): GeneratedMusicData[] {
  return Array.from(musicStorage.values())
}

export async function generateMusic(options: MusicGenerationOptions): Promise<GeneratedMusicData> {
  try {
    console.log("generateMusic called with options:", options)

    const { title, lyrics, genre, mood, style, duration, userId } = options

    // Simulate API delay
    await new Promise((resolve) => setTimeout(resolve, 2000))

    // Create mock music data
    const musicData: GeneratedMusicData = {
      id: `music_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      title: title || "AI Generated Track",
      audioUrl: getGenreBasedAudioUrl(genre || "Pop", mood || "Happy"),
      genre: genre || "Pop",
      mood: mood || "Happy",
      duration: duration || 180,
      createdAt: new Date().toISOString(),
      musicDescription: {
        musicDescription: `A ${genre || "Pop"} song with a ${mood || "Happy"} mood in ${style || "Vocal"} style. ${lyrics ? `Based on the theme: ${lyrics.substring(0, 100)}...` : ""}`,
        structure: ["intro", "verse", "chorus", "verse", "chorus", "bridge", "chorus", "outro"],
        tempo: getTempoForGenre(genre || "Pop"),
        key: getKeyForMood(mood || "Happy"),
        instrumentation: getInstrumentationForGenre(genre || "Pop"),
        theme: lyrics ? lyrics.substring(0, 50) + "..." : "AI-generated musical composition",
        melody: "Catchy and memorable melody with modern production",
        harmony: "Rich harmonic progressions with contemporary chord voicings",
        rhythm: "Engaging rhythmic patterns that complement the genre",
      },
      aiGenerated: true,
      userId,
    }

    // Save to in-memory storage instead of Redis
    saveToMemoryStorage(musicData)

    console.log("Generated and saved music data:", musicData)
    return musicData
  } catch (error) {
    console.error("Error in generateMusic:", error)
    throw new Error(`Music generation failed: ${error instanceof Error ? error.message : "Unknown error"}`)
  }
}

function getTempoForGenre(genre: string): number {
  const tempoMap: Record<string, number> = {
    Pop: 120,
    Rock: 130,
    Electronic: 128,
    Jazz: 100,
    Classical: 90,
    "Hip-Hop": 85,
    Ambient: 70,
    Techno: 130,
    House: 125,
    "Drum & Bass": 175,
    default: 120,
  }
  return tempoMap[genre] || tempoMap.default
}

function getKeyForMood(mood: string): string {
  const keyMap: Record<string, string> = {
    Happy: "C major",
    Sad: "A minor",
    Energetic: "E major",
    Calm: "F major",
    Romantic: "D major",
    Mysterious: "F# minor",
    Epic: "Bb major",
    default: "C major",
  }
  return keyMap[mood] || keyMap.default
}

function getInstrumentationForGenre(genre: string): string[] {
  const instrumentationMap: Record<string, string[]> = {
    Pop: ["piano", "guitar", "drums", "bass", "synth", "vocals"],
    Rock: ["electric guitar", "bass guitar", "drums", "vocals"],
    Electronic: ["synthesizer", "drum machine", "bass synth", "lead synth"],
    Jazz: ["piano", "upright bass", "drums", "saxophone", "trumpet"],
    Classical: ["violin", "cello", "piano", "flute", "clarinet"],
    "Hip-Hop": ["drums", "bass", "synth", "vocals", "samples"],
    Ambient: ["synth pad", "reverb", "atmospheric sounds"],
    default: ["piano", "guitar", "drums", "bass"],
  }
  return instrumentationMap[genre] || instrumentationMap.default
}
