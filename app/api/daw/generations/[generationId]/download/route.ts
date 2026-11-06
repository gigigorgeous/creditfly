import { NextResponse } from "next/server"

export const runtime = "nodejs"
export const dynamic = "force-dynamic"

const ENGINE_URL = process.env.MUSIC_ENGINE_URL || "http://127.0.0.1:8000"
const UUID_PATTERN = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i

export async function GET(_request: Request, { params }: { params: { generationId: string } }) {
  const { generationId } = params
  if (!UUID_PATTERN.test(generationId)) {
    return NextResponse.json({ error: "Invalid generation ID" }, { status: 400 })
  }

  try {
    const upstream = await fetch(
      `${ENGINE_URL}/api/v1/generations/${generationId}/download`,
      { cache: "no-store", signal: AbortSignal.timeout(30_000) },
    )
    if (!upstream.ok || !upstream.body) {
      return NextResponse.json({ error: "MIDI file is not available" }, { status: upstream.status || 502 })
    }
    return new Response(upstream.body, {
      status: 200,
      headers: {
        "Content-Type": "audio/midi",
        "Content-Disposition": `attachment; filename="${generationId}.mid"`,
        "Cache-Control": "no-store",
      },
    })
  } catch (error) {
    console.error("Music engine download failed", error)
    return NextResponse.json({ error: "The MIDI engine is unavailable" }, { status: 503 })
  }
}
