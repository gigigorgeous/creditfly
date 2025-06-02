export interface AgentConfig {
  name: string
  instructions: string
  model: string
  temperature?: number
  maxTokens?: number
}

export interface AgentResult {
  output: string
  usage?: {
    promptTokens: number
    completionTokens: number
    totalTokens: number
  }
}

export class Agent {
  protected config: AgentConfig
  protected apiKey?: string
  protected baseUrl?: string

  constructor(config: AgentConfig, apiKey?: string, baseUrl?: string) {
    this.config = config
    this.apiKey = apiKey || process.env.OPENAI_API_KEY
    this.baseUrl = baseUrl
  }

  async run(prompt: string): Promise<AgentResult> {
    try {
      // For demo purposes, return mock data
      // In production, this would call OpenAI API

      console.log(`Agent ${this.config.name} running with prompt:`, prompt)

      // Simulate API delay
      await new Promise((resolve) => setTimeout(resolve, 1000))

      // Return mock structured response for music generation
      const mockResponse = {
        title: "AI Generated Track",
        genre: "Pop",
        mood: "Happy",
        structure: ["intro", "verse", "chorus", "verse", "chorus", "bridge", "chorus", "outro"],
        tempo: 120,
        key: "C major",
        instrumentation: ["piano", "guitar", "drums", "bass", "synth"],
        musicDescription: "An upbeat pop song with catchy melodies and modern production",
        theme: "Positive energy and summer vibes",
        melody: "Catchy and memorable with hook-driven sections",
        harmony: "Contemporary pop chord progressions",
        rhythm: "Steady 4/4 beat with syncopated elements",
      }

      return {
        output: JSON.stringify(mockResponse, null, 2),
        usage: {
          promptTokens: 100,
          completionTokens: 200,
          totalTokens: 300,
        },
      }
    } catch (error) {
      console.error(`Agent ${this.config.name} error:`, error)
      throw new Error(`Agent execution failed: ${error instanceof Error ? error.message : "Unknown error"}`)
    }
  }
}
