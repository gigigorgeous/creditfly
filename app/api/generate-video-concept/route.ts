import { generateText } from "ai"
import { openai } from "@ai-sdk/openai"
import { NextResponse } from "next/server"

export async function POST(req: Request) {
  try {
    const { prompt, style, duration, budget } = await req.json()

    if (!prompt) {
      return NextResponse.json({ error: "Prompt is required" }, { status: 400 })
    }

    const enhancedPrompt = `Create a detailed music video concept and storyboard for:
    Song/Theme: ${prompt}
    ${style ? `Visual Style: ${style}` : ""}
    ${duration ? `Duration: ${duration}` : ""}
    ${budget ? `Budget Level: ${budget}` : ""}
    
    Include:
    1. Overall concept and narrative
    2. Scene-by-scene breakdown
    3. Visual elements and aesthetics
    4. Camera movements and shots
    5. Lighting and color palette
    6. Props and locations needed
    7. Performance elements
    8. Post-production effects
    
    Make it creative, feasible, and aligned with the song's mood and message.`

    const { text } = await generateText({
      model: openai("gpt-4o"),
      prompt: enhancedPrompt,
      temperature: 0.7,
      maxTokens: 1000,
    })

    return NextResponse.json({ concept: text })
  } catch (error) {
    console.error("Error generating video concept:", error)
    return NextResponse.json(
      { error: "Failed to generate video concept. Please ensure your OpenAI API key is set correctly and try again." },
      { status: 500 },
    )
  }
}
