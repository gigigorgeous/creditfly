import { OpenAI } from "openai"
import { cookies } from "next/headers"

// Get the OpenAI client with the configured API key
export function getOpenAIClient(): OpenAI | null {
  try {
    const cookieStore = cookies()
    const apiKey = cookieStore.get("openai_api_key")?.value
    const baseUrl = cookieStore.get("openai_base_url")?.value

    if (!apiKey) {
      // If no API key is configured, use the environment variable
      if (!process.env.OPENAI_API_KEY) {
        return null
      }

      return new OpenAI({
        apiKey: process.env.OPENAI_API_KEY,
      })
    }

    // Create the client with the configured API key and optional base URL
    return new OpenAI({
      apiKey,
      baseURL: baseUrl,
    })
  } catch (error) {
    console.error("Error creating OpenAI client:", error)
    return null
  }
}
