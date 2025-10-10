import { NextResponse } from "next/server"

const PYTHON_BACKEND_URL = process.env.PYTHON_BACKEND_URL || "http://localhost:8000"

export async function GET() {
  try {
    const response = await fetch(`${PYTHON_BACKEND_URL}/health`)

    if (!response.ok) {
      throw new Error("Backend unhealthy")
    }

    const data = await response.json()

    return NextResponse.json({
      status: "healthy",
      backend: data,
      connected: true,
    })
  } catch (error: any) {
    return NextResponse.json(
      {
        status: "unhealthy",
        error: error.message,
        connected: false,
      },
      { status: 503 },
    )
  }
}
