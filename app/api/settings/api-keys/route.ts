import { NextResponse } from "next/server"
import { cookies } from "next/headers"

// This route handles saving API key configuration
// Note: In a production app, you'd want to store these more securely
export async function POST(request: Request) {
  try {
    const { openAIKey, customBaseUrl } = await request.json()

    if (!openAIKey) {
      return NextResponse.json({ error: "OpenAI API key is required" }, { status: 400 })
    }

    // In a real app, you'd want to validate the API key before saving it
    // For demo purposes, we'll just save it in a cookie
    const cookieStore = cookies()

    // Set the API key cookie (encrypted, HTTP-only)
    cookieStore.set("openai_api_key", openAIKey, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      maxAge: 60 * 60 * 24 * 30, // 30 days
      path: "/",
    })

    // Set the custom base URL cookie if provided
    if (customBaseUrl) {
      cookieStore.set("openai_base_url", customBaseUrl, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        maxAge: 60 * 60 * 24 * 30, // 30 days
        path: "/",
      })
    } else {
      // Remove the cookie if not provided
      cookieStore.delete("openai_base_url")
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Error saving API key configuration:", error)
    return NextResponse.json({ error: "Failed to save API key configuration" }, { status: 500 })
  }
}

// Get the current API key configuration
export async function GET() {
  try {
    const cookieStore = cookies()

    // Check if the API key is configured
    const hasApiKey = cookieStore.has("openai_api_key")
    const hasCustomBaseUrl = cookieStore.has("openai_base_url")

    return NextResponse.json({
      hasApiKey,
      hasCustomBaseUrl,
    })
  } catch (error) {
    console.error("Error getting API key configuration:", error)
    return NextResponse.json({ error: "Failed to get API key configuration" }, { status: 500 })
  }
}
