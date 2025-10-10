import { NextResponse } from "next/server"

const PYTHON_BACKEND_URL = process.env.PYTHON_BACKEND_URL || "http://localhost:8000"

export async function POST(req: Request) {
  try {
    const { prompt, duration = 30, model_size = "medium", temperature = 1.0 } = await req.json()

    if (!prompt) {
      return NextResponse.json({ error: "Prompt is required" }, { status: 400 })
    }

    // Call custom Python backend
    const response = await fetch(`${PYTHON_BACKEND_URL}/api/generate`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        prompt,
        duration: Math.min(duration, 30),
        model_size,
        temperature,
        top_k: 250,
        top_p: 0.0,
      }),
    })

    if (!response.ok) {
      const errorData = await response.json()
      throw new Error(`Backend error: ${response.status} - ${errorData.detail || "Unknown error"}`)
    }

    const data = await response.json()

    // Poll for completion
    const taskId = data.task_id
    let attempts = 0
    const maxAttempts = 120 // 10 minutes max

    while (attempts < maxAttempts) {
      await new Promise((resolve) => setTimeout(resolve, 5000)) // Wait 5 seconds

      const statusResponse = await fetch(`${PYTHON_BACKEND_URL}/api/status/${taskId}`)

      if (statusResponse.ok) {
        const statusData = await statusResponse.json()

        if (statusData.status === "completed" && statusData.audio_url) {
          return NextResponse.json({
            audioUrl: `${PYTHON_BACKEND_URL}${statusData.audio_url}`,
            title: `Custom Generated: "${prompt.substring(0, 30)}..."`,
            artist: "EmpireMusicAiStudio Custom AI",
            genre: "AI Generated",
            duration: `0:${Math.floor(duration).toString().padStart(2, "0")}`,
            bpm: 120,
            keySignature: "C Maj",
            taskId: taskId,
          })
        } else if (statusData.status === "failed") {
          throw new Error(`Generation failed: ${statusData.error || "Unknown error"}`)
        }
      }

      attempts++
    }

    throw new Error("Generation timed out")
  } catch (error: any) {
    console.error("Error in custom music generation:", error)
    return NextResponse.json(
      { error: `Failed to generate music: ${error.message || "An unknown error occurred."}` },
      { status: 500 },
    )
  }
}
