import { NextResponse } from "next/server"

export async function POST(req: Request) {
  try {
    const { prompt, mode, duration = 30 } = await req.json()

    if (!prompt) {
      return NextResponse.json({ error: "Prompt is required" }, { status: 400 })
    }

    // Check for Replicate API key
    const REPLICATE_API_KEY = process.env.REPLICATE_API_KEY
    if (!REPLICATE_API_KEY) {
      return NextResponse.json({ error: "Replicate API key is not configured." }, { status: 500 })
    }

    try {
      // Call Replicate API for music generation
      const replicateResponse = await fetch("https://api.replicate.com/v1/predictions", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Token ${REPLICATE_API_KEY}`,
        },
        body: JSON.stringify({
          version: "7a76a82b4d74296a9af710399257878c525877a1420643b25396067954494065",
          input: {
            model_version: "stereo-melody-large",
            prompt: `${prompt}${mode && mode !== "none" ? ` in ${mode} mode` : ""}`,
            duration: Math.min(duration, 30), // Limit to 30 seconds for demo
            top_k: 250,
            top_p: 0,
            temperature: 1.0,
            classifier_free_guidance: 3,
          },
        }),
      })

      if (!replicateResponse.ok) {
        const errorData = await replicateResponse.json()
        console.error("Replicate API Error Response:", errorData)
        throw new Error(`Replicate API error: ${replicateResponse.status} - ${errorData.detail || "Unknown error"}`)
      }

      const prediction = await replicateResponse.json()

      // Poll for completion
      let result = prediction
      let attempts = 0
      const maxAttempts = 60 // 5 minutes max wait time

      while (result.status !== "succeeded" && result.status !== "failed" && attempts < maxAttempts) {
        await new Promise((resolve) => setTimeout(resolve, 5000)) // Wait 5 seconds

        const pollResponse = await fetch(`https://api.replicate.com/v1/predictions/${result.id}`, {
          headers: {
            Authorization: `Token ${REPLICATE_API_KEY}`,
          },
        })

        if (pollResponse.ok) {
          result = await pollResponse.json()
        }
        attempts++
      }

      if (result.status === "succeeded" && result.output) {
        return NextResponse.json({
          audioUrl: result.output,
          title: `AI Generated: "${prompt.substring(0, 30)}..."`,
          artist: "EmpireMusicAiStudio AI",
          genre: `AI ${mode ? mode + " " : ""}Music`,
          duration: `0:${Math.floor(duration).toString().padStart(2, "0")}`,
          bpm: 120,
          keySignature: mode ? `${mode} Scale` : "C Maj",
        })
      } else if (result.status === "failed") {
        throw new Error(`Music generation failed: ${result.error || "Unknown error"}`)
      } else {
        throw new Error("Music generation timed out")
      }
    } catch (apiError: any) {
      console.error("Error calling Replicate API:", apiError)
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
