export interface ApiKeyValidationResult {
  valid: boolean
  error?: string
  message?: string
  accountsCount?: number
  status?: number
  configured?: boolean
  data?: any
}

export class RapidApiValidator {
  static async validateApiKey(apiKey: string): Promise<ApiKeyValidationResult> {
    try {
      const response = await fetch("/api/rapidapi/validate", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ apiKey }),
      })

      const result = await response.json()
      return result
    } catch (error) {
      console.error("Error validating API key:", error)
      return {
        valid: false,
        error: "Failed to validate API key. Please check your internet connection.",
      }
    }
  }

  static async validateServerApiKey(): Promise<ApiKeyValidationResult> {
    try {
      const response = await fetch("/api/rapidapi/validate", {
        method: "GET",
      })

      const result = await response.json()
      return result
    } catch (error) {
      console.error("Error validating server API key:", error)
      return {
        valid: false,
        error: "Failed to validate server API key.",
      }
    }
  }

  static getApiKeyInstructions(): string {
    return `
To get a RapidAPI key:

1. Go to https://rapidapi.com/
2. Sign up for a free account
3. Subscribe to the Mureka AI Music Generation API
4. Copy your API key from the dashboard
5. Add it to your environment variables as RAPIDAPI_KEY

The API key should start with your RapidAPI username followed by a long string of characters.
    `.trim()
  }
}
