"use client"

import { useState, useEffect } from "react"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { AlertCircle } from "lucide-react"

export function ApiKeyBanner() {
  const [showOpenAIBanner, setShowOpenAIBanner] = useState(false)
  const [showSunoBanner, setShowSunoBanner] = useState(false)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const checkApiKeys = async () => {
      try {
        const response = await fetch("/api/check-api-keys")
        if (response.ok) {
          const data = await response.json()
          setShowOpenAIBanner(!data.hasOpenAIKey)
          setShowSunoBanner(!data.hasSunoKey)
        }
      } catch (error) {
        console.error("Error checking API keys:", error)
      } finally {
        setIsLoading(false)
      }
    }

    checkApiKeys()
  }, [])

  if (isLoading || (!showOpenAIBanner && !showSunoBanner)) return null

  return (
    <>
      {showOpenAIBanner && (
        <Alert variant="destructive" className="mb-2">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>OpenAI API Key Missing</AlertTitle>
          <AlertDescription>
            The OpenAI API key is missing. Some features like prompt enhancement and text-to-speech may not work
            properly.
          </AlertDescription>
        </Alert>
      )}

      {showSunoBanner && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Suno API Key Missing</AlertTitle>
          <AlertDescription>
            The Suno API key is missing. Music generation will use the basic fallback mode.
          </AlertDescription>
        </Alert>
      )}
    </>
  )
}
