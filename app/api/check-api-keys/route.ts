import { NextResponse } from "next/server"

export async function GET() {
  return NextResponse.json({
    hasOpenAIKey: !!process.env.OPENAI_API_KEY,
    hasSunoKey: !!process.env.SUNO_API_KEY,
    hasReplicateKey: !!process.env.REPLICATE_API_KEY,
  })
}
