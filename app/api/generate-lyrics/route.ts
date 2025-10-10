import { generateText } from "ai"
import { openai } from "@ai-sdk/openai"
import { NextResponse } from "next/server"

export async function POST(req: Request) {
  try {
    const { prompt, genre, mood, theme } = await req.json()

    if (!prompt) {
      return NextResponse.json({ error: "Prompt is required" }, { status: 400 })
    }

    const enhancedPrompt = `Generate creative and engaging song lyrics based on the following:
    Theme/Idea: ${prompt}
    ${genre ? `Genre: ${genre}` : ""}
    ${mood ? `Mood: ${mood}` : ""}
    ${theme ? `Theme: ${theme}` : ""}
    
    Create lyrics with verses, chorus, and bridge. Make them emotionally resonant and suitable for singing.
    Include proper song structure with [Verse 1], [Chorus], [Verse 2], [Chorus], [Bridge], [Chorus] format.`

    const { text } = await generateText({
      model: openai("gpt-4o"),
      prompt: enhancedPrompt,
      temperature: 0.8,
      maxTokens: 800,
    })

    return NextResponse.json({ lyrics: text })
  } catch (error) {
    console.error("Error generating lyrics:", error)
    return NextResponse.json(
      { error: "Failed to generate lyrics. Please ensure your OpenAI API key is set correctly and try again." },
      { status: 500 },
    )
  }
}
