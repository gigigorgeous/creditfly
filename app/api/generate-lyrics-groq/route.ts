import { NextResponse } from "next/server"

export async function POST(req: Request) {
  try {
    const { prompt, genre, mood, theme } = await req.json()

    if (!prompt) {
      return NextResponse.json({ error: "Prompt is required" }, { status: 400 })
    }

    const GROQ_API_KEY = process.env.GROQ_API_KEY
    if (!GROQ_API_KEY) {
      return NextResponse.json({ error: "Groq API key is not configured." }, { status: 500 })
    }

    const enhancedPrompt = `Generate creative and engaging song lyrics based on the following:
    Theme/Idea: ${prompt}
    ${genre ? `Genre: ${genre}` : ""}
    ${mood ? `Mood: ${mood}` : ""}
    ${theme ? `Theme: ${theme}` : ""}
    
    Create lyrics with verses, chorus, and bridge. Make them emotionally resonant and suitable for singing.
    Include proper song structure with [Verse 1], [Chorus], [Verse 2], [Chorus], [Bridge], [Chorus] format.`

    try {
      const response = await fetch("https://api.groq.com/openai/v1/chat/completions", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${GROQ_API_KEY}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          model: "qwen-qwq-32b",
          messages: [
            {
              role: "user",
              content: enhancedPrompt,
            },
          ],
          temperature: 0.7,
          max_tokens: 2000,
          top_p: 0.95,
          stream: false,
        }),
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(`Groq API error: ${response.status} - ${errorData.error?.message || "Unknown error"}`)
      }

      const data = await response.json()
      const lyrics = data.choices[0]?.message?.content || ""

      return NextResponse.json({ lyrics })
    } catch (apiError: any) {
      console.error("Error calling Groq API:", apiError)
      return NextResponse.json(
        { error: `Lyrics generation failed: ${apiError.message || "An unknown API error occurred."}` },
        { status: 500 },
      )
    }
  } catch (error: any) {
    console.error("General error in lyrics generation API route:", error)
    return NextResponse.json(
      { error: `Failed to process lyrics generation request: ${error.message || "An unknown error occurred."}` },
      { status: 500 },
    )
  }
}
