"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { AlertCircle, X, Check } from "lucide-react"
import { Alert, AlertDescription } from "@/components/ui/alert"
import Link from "next/link"

export function ApiKeyBanner() {
  const [isVisible, setIsVisible] = useState(true)
  const [hasApiKey, setHasApiKey] = useState(false)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    // Check if the API key is configured
    const checkApiKey = async () => {
      try {
        const response = await fetch("/api/settings/api-keys")
        const data = await response.json()
        setHasApiKey(data.hasApiKey)
      } catch (error) {
        console.error("Error checking API key:", error)
      } finally {
        setIsLoading(false)
      }
    }

    checkApiKey()
  }, [])

  if (!isVisible || isLoading) return null

  if (hasApiKey) {
    return (
      <Alert className="relative border-green-500/20 bg-green-500/5 text-green-600 dark:text-green-400">
        <Check className="h-4 w-4" />
        <AlertDescription className="flex items-center justify-between w-full">
          <div className="flex-1 text-sm">
            <span className="font-medium">API Key configured: </span>
            <span>Your OpenAI API key is set up and ready to use.</span>
          </div>
          <div className="flex items-center gap-2">
            <Button
              size="sm"
              variant="outline"
              className="border-green-500 text-green-600 dark:text-green-400 hover:bg-green-500/10"
              asChild
            >
              <Link href="/settings">Update Key</Link>
            </Button>
            <Button
              size="icon"
              variant="ghost"
              className="h-6 w-6 text-green-600 dark:text-green-400 hover:bg-green-500/10"
              onClick={() => setIsVisible(false)}
            >
              <X className="h-4 w-4" />
              <span className="sr-only">Dismiss</span>
            </Button>
          </div>
        </AlertDescription>
      </Alert>
    )
  }

  return (
    <Alert className="relative border-yellow-500/20 bg-yellow-500/5 text-yellow-600 dark:text-yellow-400">
      <AlertCircle className="h-4 w-4" />
      <AlertDescription className="flex items-center justify-between w-full">
        <div className="flex-1 text-sm">
          <span className="font-medium">Demo mode: </span>
          <span>Running with simulated responses. Add your OpenAI API key for full functionality.</span>
        </div>
        <div className="flex items-center gap-2">
          <Button
            size="sm"
            variant="outline"
            className="border-yellow-500 text-yellow-600 dark:text-yellow-400 hover:bg-yellow-500/10"
            asChild
          >
            <Link href="/settings">Add API Key</Link>
          </Button>
          <Button
            size="icon"
            variant="ghost"
            className="h-6 w-6 text-yellow-600 dark:text-yellow-400 hover:bg-yellow-500/10"
            onClick={() => setIsVisible(false)}
          >
            <X className="h-4 w-4" />
            <span className="sr-only">Dismiss</span>
          </Button>
        </div>
      </AlertDescription>
    </Alert>
  )
}
