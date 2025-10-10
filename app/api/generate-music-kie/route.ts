import { NextResponse } from "next/server"

export async function POST(req: Request) {
  try {
    const { prompt, instrumental = false, customMode = false, model = "V3_5" } = await req.json()

    if (!prompt) {
      return NextResponse.json({ error: "Prompt is required" }, { status: 400 })
    }

    const KIE_API_KEY = process.env.KIE_API_KEY
    if (!KIE_API_KEY) {
      return NextResponse.json({ error: "Kie.ai API key is not configured." }, { status: 500 })
    }

    try {
      // Call Kie.ai API for music generation
      const kieResponse = await fetch("https://api.kie.ai/api/v1/generate", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${KIE_API_KEY}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          prompt,
          customMode,
          instrumental,
          model,
        }),
      })

      if (!kieResponse.ok) {
        const errorData = await kieResponse.json()
        console.error("Kie.ai API Error Response:", errorData)
        throw new Error(`Kie.ai API error: ${kieResponse.status} - ${errorData.message || "Unknown error"}`)
      }

      const kieData = await kieResponse.json()

      // The response should contain task ID or direct URLs
      // Poll for completion if needed
      if (kieData.taskId) {
        // Poll for completion
        let attempts = 0
        const maxAttempts = 60
        let result = kieData

        while (!result.audioUrl && attempts < maxAttempts) {
          await new Promise((resolve) => setTimeout(resolve, 5000))

          const statusResponse = await fetch(`https://api.kie.ai/api/v1/task/${kieData.taskId}`, {
            headers: {
              Authorization: `Bearer ${KIE_API_KEY}`,
            },
          })

          if (statusResponse.ok) {
            result = await statusResponse.json()
            if (result.status === "completed" && result.audioUrl) {
              break
            } else if (result.status === "failed") {
              throw new Error(`Music generation failed: ${result.error || "Unknown error"}`)
            }
          }
          attempts++
        }

        if (!result.audioUrl) {
          throw new Error("Music generation timed out")
        }

        return NextResponse.json({
          audioUrl: result.audioUrl,
          title: result.title || `AI Generated: "${prompt.substring(0, 30)}..."`,
          artist: "EmpireMusicAiStudio AI",
          genre: instrumental ? "Instrumental" : "Vocal Track",
          duration: result.duration || "0:30",
          bpm: result.bpm || 120,
          keySignature: result.key || "C Maj",
          taskId: kieData.taskId,
        })
      }

      // Direct response with audio URL
      return NextResponse.json({
        audioUrl: kieData.audioUrl || kieData.audio_url,
        title: kieData.title || `AI Generated: "${prompt.substring(0, 30)}..."`,
        artist: "EmpireMusicAiStudio AI",
        genre: instrumental ? "Instrumental" : "Vocal Track",
        duration: kieData.duration || "0:30",
        bpm: kieData.bpm || 120,
        keySignature: kieData.key || "C Maj",
      })
    } catch (apiError: any) {
      console.error("Error calling Kie.ai API:", apiError)
      return NextResponse.json(
        { error: `Music generation failed: ${apiError.message || "An unknown API error occurred."}` },
        { status: 500 },
      )
    }
  } catch (error: any) {
    console.error("General error in music generation API route:", error)
    return NextResponse.json(
      { error: `Failed to process music generation request: ${error.message || "An unknown error occurred."}` },
      { status: 500 },
    )
  }
}
