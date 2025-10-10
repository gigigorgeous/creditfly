import { NextResponse } from "next/server"

export async function POST(req: Request) {
  try {
    const { prompt, style, duration, budget } = await req.json()

    if (!prompt) {
      return NextResponse.json({ error: "Prompt is required" }, { status: 400 })
    }

    const GROQ_API_KEY = process.env.GROQ_API_KEY
    if (!GROQ_API_KEY) {
      return NextResponse.json({ error: "Groq API key is not configured." }, { status: 500 })
    }

    const enhancedPrompt = `Create a detailed music video concept and storyboard for:
    Song/Theme: ${prompt}
    ${style ? `Visual Style: ${style}` : ""}
    ${duration ? `Duration: ${duration}` : ""}
    ${budget ? `Budget Level: ${budget}` : ""}
    
    Include:
    1. Overall concept and narrative
    2. Scene-by-scene breakdown with timestamps
    3. Visual elements and aesthetics
    4. Camera movements and shots
    5. Lighting and color palette
    6. Props and locations needed
    7. Performance elements
    8. Post-production effects
    
    Make it creative, feasible, and aligned with the song's mood and message.`

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
          max_tokens: 3000,
          top_p: 0.95,
          stream: false,
        }),
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(`Groq API error: ${response.status} - ${errorData.error?.message || "Unknown error"}`)
      }

      const data = await response.json()
      const concept = data.choices[0]?.message?.content || ""

      return NextResponse.json({ concept })
    } catch (apiError: any) {
      console.error("Error calling Groq API:", apiError)
      return NextResponse.json(
        { error: `Video concept generation failed: ${apiError.message || "An unknown API error occurred."}` },
        { status: 500 },
      )
    }
  } catch (error: any) {
    console.error("General error in video concept generation API route:", error)
    return NextResponse.json(
      { error: `Failed to process video concept generation request: ${error.message || "An unknown error occurred."}` },
      { status: 500 },
    )
  }
}
