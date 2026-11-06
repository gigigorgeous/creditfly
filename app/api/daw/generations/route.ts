import { NextResponse } from "next/server"

export const runtime = "nodejs"
export const dynamic = "force-dynamic"

const ENGINE_URL = process.env.MUSIC_ENGINE_URL || "http://127.0.0.1:8000"

export async function POST(request: Request) {
  let body: unknown
  try {
    body = await request.json()
  } catch {
    return NextResponse.json({ error: "Request body must be valid JSON" }, { status: 400 })
  }

  try {
    const upstream = await fetch(`${ENGINE_URL}/api/v1/generations`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
      cache: "no-store",
      signal: AbortSignal.timeout(30_000),
    })
    const payload = await upstream.json()
    return NextResponse.json(payload, { status: upstream.status })
  } catch (error) {
    console.error("Music engine is unavailable", error)
    return NextResponse.json(
      { error: "The MIDI engine is unavailable. Start the Python service and try again." },
      { status: 503 },
    )
  }
}
