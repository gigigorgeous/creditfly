import { Agent, type AgentConfig } from "./agent-system"
import { v4 as uuidv4 } from "uuid"
import { getGenreBasedAudioUrl } from "../music-generation-sdk"

// Music generation specific agent
export class MusicGenerationAgent extends Agent {
  constructor(apiKey?: string, baseUrl?: string) {
    const config: AgentConfig = {
      name: "MusicGenerator",
      instructions: `You are an expert music composer and producer. 
      Your task is to create detailed music compositions based on user requests.
      For each request, provide a structured response with:
      - Title: A catchy title for the composition
      - Genre: The musical genre
      - Mood: The emotional mood of the piece
      - Structure: The song structure (intro, verse, chorus, etc.)
      - Tempo: The beats per minute
      - Key: The musical key
      - Instrumentation: List of instruments used
      - Description: A detailed description of how the music sounds
      - Mixing notes: Technical notes about the mix
      
      Format your response as a valid JSON object.`,
      model: "gpt-4o",
    }

    super(config, apiKey, baseUrl)
  }

  async generateMusic(options: {
    title?: string
    lyrics?: string
    genre?: string
    mood?: string
    style?: string
    duration?: number
  }): Promise<any> {
    const { title, lyrics, genre, mood, style, duration } = options

    const prompt = `
      Create a detailed music composition with the following parameters:
      ${title ? `Title: ${title}` : "Create a catchy title"}
      ${genre ? `Genre: ${genre}` : ""}
      ${mood ? `Mood: ${mood}` : ""}
      ${style ? `Style: ${style}` : ""}
      ${duration ? `Duration: Approximately ${Math.floor(duration / 60)}:${(duration % 60).toString().padStart(2, "0")} minutes` : ""}
      ${lyrics ? `Lyrics or theme: ${lyrics}` : ""}
      
      Provide a complete musical composition description in JSON format.
    `

    try {
      const result = await this.run(prompt)
      let musicData

      try {
        musicData = JSON.parse(result.output)
      } catch (e) {
        console.error("Failed to parse agent output as JSON:", e)
        // Create fallback music data
        musicData = this.createFallbackMusicData(options)
      }

      // Add audio URL based on genre/mood
      const audioUrl = getGenreBasedAudioUrl(musicData.genre || genre || "Pop", musicData.mood || mood || "Happy")

      return {
        id: uuidv4(),
        title: musicData.title || title || "Untitled Track",
        audioUrl,
        genre: musicData.genre || genre || "Pop",
        mood: musicData.mood || mood || "Happy",
        duration: duration || 180,
        createdAt: new Date().toISOString(),
        musicDescription: {
          ...musicData,
          structure: musicData.structure || [
            "intro",
            "verse",
            "chorus",
            "verse",
            "chorus",
            "bridge",
            "chorus",
            "outro",
          ],
          tempo: musicData.tempo || 120,
          key: musicData.key || "C major",
          instrumentation: musicData.instrumentation || ["piano", "guitar", "drums", "bass"],
        },
        aiGenerated: true,
      }
    } catch (error) {
      console.error("Music generation agent error:", error)
      return this.createFallbackMusicData(options)
    }
  }

  private createFallbackMusicData(options: {
    title?: string
    genre?: string
    mood?: string
    style?: string
    duration?: number
  }) {
    const { title, genre, mood, style, duration } = options

    return {
      id: uuidv4(),
      title: title || "Untitled Track",
      audioUrl: getGenreBasedAudioUrl(genre || "Pop", mood || "Happy"),
      genre: genre || "Pop",
      mood: mood || "Happy",
      duration: duration || 180,
      createdAt: new Date().toISOString(),
      musicDescription: {
        musicDescription: `A ${genre || "Pop"} song with a ${mood || "Happy"} mood in ${style || "Vocal"} style.`,
        structure: ["intro", "verse", "chorus", "verse", "chorus", "bridge", "chorus", "outro"],
        tempo: 120,
        key: "C major",
        instrumentation: ["piano", "guitar", "drums", "bass", "synth"],
        theme: "Summer vibes and positive energy",
        melody: "Catchy and uplifting melody with memorable hooks",
        harmony: "Rich chord progressions with occasional tension and resolution",
        rhythm: "Steady beat with syncopated elements to add interest",
      },
      aiGenerated: true,
    }
  }
}
