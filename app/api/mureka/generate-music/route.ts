import { type NextRequest, NextResponse } from "next/server"
import { MurekaAIClient } from "@/lib/rapidapi-client"

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { account, prompt, lyrics, title, type } = body

    if (!account) {
      return NextResponse.json({ success: false, error: "Account is required" }, { status: 400 })
    }

    const client = new MurekaAIClient()
    let result

    switch (type) {
      case "advanced":
        if (!lyrics) {
          return NextResponse.json(
            { success: false, error: "Lyrics are required for advanced generation" },
            { status: 400 },
          )
        }
        result = await client.createAdvancedMusic(account, lyrics, title)
        break
      case "instrumental":
        if (!prompt) {
          return NextResponse.json(
            { success: false, error: "Prompt is required for instrumental generation" },
            { status: 400 },
          )
        }
        result = await client.createInstrumental(account, prompt)
        break
      default: // simple
        if (!prompt) {
          return NextResponse.json(
            { success: false, error: "Prompt is required for simple generation" },
            { status: 400 },
          )
        }
        result = await client.createMusic(account, prompt)
        break
    }

    return NextResponse.json({ success: true, data: result.data || result })
  } catch (error) {
    console.error("Error generating music:", error)
    return NextResponse.json({ success: false, error: "Failed to generate music" }, { status: 500 })
  }
}
