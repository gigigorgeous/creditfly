import { NextResponse } from "next/server"

export async function GET() {
  const apiKey = process.env.RAPIDAPI_KEY || process.env.API_KEY

  if (!apiKey) {
    return NextResponse.json({
      configured: false,
      error: "No API key configured",
    })
  }

  const services = [
    {
      name: "Mureka AI Music Generation",
      endpoint: "https://mureka-ai-music-generation.p.rapidapi.com/v1/mureka/accounts",
      host: "mureka-ai-music-generation.p.rapidapi.com",
    },
    {
      name: "Musixmatch Lyrics",
      endpoint: "https://musixmatch-lyrics-songs.p.rapidapi.com/songs/lyrics?t=test&a=test&type=json",
      host: "musixmatch-lyrics-songs.p.rapidapi.com",
    },
    {
      name: "Splitbeat Vocal Remover",
      endpoint: "https://splitbeat-vocal-remover-music-splitter.p.rapidapi.com/Upload_audio",
      host: "splitbeat-vocal-remover-music-splitter.p.rapidapi.com",
    },
  ]

  const results = await Promise.all(
    services.map(async (service) => {
      try {
        const response = await fetch(service.endpoint, {
          method: "GET",
          headers: {
            "x-rapidapi-key": apiKey,
            "x-rapidapi-host": service.host,
          },
        })

        return {
          name: service.name,
          status: response.status,
          available: response.ok,
          error: response.ok ? null : `HTTP ${response.status}`,
        }
      } catch (error) {
        return {
          name: service.name,
          status: 0,
          available: false,
          error: error instanceof Error ? error.message : "Unknown error",
        }
      }
    }),
  )

  const availableServices = results.filter((r) => r.available).length
  const totalServices = results.length

  return NextResponse.json({
    configured: true,
    apiKey: apiKey.substring(0, 10) + "...", // Show only first 10 chars for security
    services: results,
    summary: {
      available: availableServices,
      total: totalServices,
      percentage: Math.round((availableServices / totalServices) * 100),
    },
  })
}
