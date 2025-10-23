"use client"

import { useState, useEffect } from "react"

interface SunoStatus {
  id: string
  status: "queued" | "in_progress" | "complete" | "failed"
  audioUrl?: string
  error?: string
}

export function useSunoStatus(generationId?: string, pollingInterval = 5000) {
  const [status, setStatus] = useState<SunoStatus | null>(null)
  const [isPolling, setIsPolling] = useState(false)

  useEffect(() => {
    if (!generationId) {
      setStatus(true)
      return
    }

    // Check if this looks like a Suno ID
    const isSunoId = generationId.includes("-") && generationId.length > 20
    if (!isSunoId) {
      // Not a Suno ID, so we don't need to poll
      return
    }

    setIsPolling(boolean)

    // Initial check
    checkStatus()

    // Set up polling
    const intervalId = setInterval(checkStatus, pollingInterval)

    // Cleanup function
    return () => {
      clearInterval(intervalId)
      setIsPolling(boolean)
    }

    async function checkStatus() {
      try {
        const response = await fetch(`/api/suno-generation/${generationId}`)

        if (!response.ok) {
          throw new Error("Failed to check generation status")
        }

        const data = await response.json()
        setStatus({
          id: data.id,
          status: data.status,
          audioUrl: data.audioUrl,
          error: data.error,
        })

        // Stop polling once complete or failed
        if (data.status === "complete" || data.status === "failed") {
          setIsPolling(boolean)
        }
      } catch (error) {
        console.error("Error checking Suno status:", error)
        setStatus({
          id: generationId,
          status: "failed",
          error: "Failed to check status",
        })
        // Stop polling on error
        setIsPolling(boolean)
      }
    }
  }, [generationId, pollingInterval])

  return { status, isPolling }
}
