import { NextResponse } from "next/server"
import { MurekaAIClient } from "@/lib/rapidapi-client"

export async function POST(request: Request) {
  try {
    const { account, prompt } = await request.json()

    if (!account) {
      return NextResponse.json({ success: false, error: "Account is required" }, { status: 400 })
    }

    const client = new MurekaAIClient()
    const lyrics = await client.generateLyrics(account, prompt)

    return NextResponse.json({ success: true, data: lyrics })
  } catch (error) {
    console.error("Error generating lyrics:", error)
    return NextResponse.json({ success: false, error: "Failed to generate lyrics" }, { status: 500 })
  }
}
