import { type NextRequest, NextResponse } from "next/server"

export async function POST(request: NextRequest) {
  try {
    const { apiKey } = await request.json()

    if (!apiKey) {
      return NextResponse.json(
        {
          valid: false,
          error: "API key is required",
        },
        { status: 400 },
      )
    }

    // Test the API key with a simple request to Mureka accounts endpoint
    const testResponse = await fetch("https://mureka-ai-music-generation.p.rapidapi.com/v1/mureka/accounts", {
      method: "GET",
      headers: {
        "x-rapidapi-key": apiKey,
        "x-rapidapi-host": "mureka-ai-music-generation.p.rapidapi.com",
      },
    })

    if (testResponse.ok) {
      const data = await testResponse.json()
      return NextResponse.json({
        valid: true,
        message: "API key is valid",
        accountsCount: Array.isArray(data.accounts) ? data.accounts.length : 0,
        data: data,
      })
    } else {
      const errorText = await testResponse.text()
      let errorMessage = "Invalid API key"

      if (testResponse.status === 401) {
        errorMessage = "Invalid API key. Please check your RapidAPI key."
      } else if (testResponse.status === 403) {
        errorMessage = "API key doesn't have access to this service."
      } else if (testResponse.status === 429) {
        errorMessage = "API rate limit exceeded. Please try again later."
      } else {
        errorMessage = `API error (${testResponse.status}): ${errorText}`
      }

      return NextResponse.json({
        valid: false,
        error: errorMessage,
        status: testResponse.status,
      })
    }
  } catch (error) {
    console.error("Error validating API key:", error)
    return NextResponse.json(
      {
        valid: false,
        error: "Failed to validate API key. Please check your internet connection.",
      },
      { status: 500 },
    )
  }
}

export async function GET() {
  try {
    // Test with the server-side API key
    const serverApiKey = process.env.RAPIDAPI_KEY || process.env.API_KEY

    if (!serverApiKey) {
      return NextResponse.json({
        valid: false,
        error: "No server-side API key configured",
        configured: false,
      })
    }

    const testResponse = await fetch("https://mureka-ai-music-generation.p.rapidapi.com/v1/mureka/accounts", {
      method: "GET",
      headers: {
        "x-rapidapi-key": serverApiKey,
        "x-rapidapi-host": "mureka-ai-music-generation.p.rapidapi.com",
      },
    })

    if (testResponse.ok) {
      const data = await testResponse.json()
      return NextResponse.json({
        valid: true,
        configured: true,
        message: "Server API key is valid",
        accountsCount: Array.isArray(data.accounts) ? data.accounts.length : 0,
      })
    } else {
      return NextResponse.json({
        valid: false,
        configured: true,
        error: `Server API key validation failed (${testResponse.status})`,
        status: testResponse.status,
      })
    }
  } catch (error) {
    console.error("Error validating server API key:", error)
    return NextResponse.json({
      valid: false,
      configured: true,
      error: "Failed to validate server API key",
    })
  }
}
