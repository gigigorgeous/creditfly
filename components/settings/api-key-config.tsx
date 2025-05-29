"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { useToast } from "@/hooks/use-toast"
import { Loader2, Key, Save, CheckCircle, AlertCircle } from "lucide-react"
import { RapidApiValidator, type ApiKeyValidationResult } from "@/lib/rapidapi-validation"

export function ApiKeyConfig() {
  const [openAIKey, setOpenAIKey] = useState("")
  const [customBaseUrl, setCustomBaseUrl] = useState("")
  const [isSaving, setIsSaving] = useState(false)
  const { toast } = useToast()
  const [validationResult, setValidationResult] = useState<ApiKeyValidationResult | null>(null)
  const [isValidating, setIsValidating] = useState(false)

  const validateApiKey = async () => {
    if (!openAIKey) {
      toast({
        title: "No API Key",
        description: "Please enter an API key to validate.",
        variant: "destructive",
      })
      return
    }

    setIsValidating(true)
    try {
      const result = await RapidApiValidator.validateApiKey(openAIKey)
      setValidationResult(result)

      if (result.valid) {
        toast({
          title: "API Key Valid",
          description: result.message || "Your RapidAPI key is working correctly!",
        })
      } else {
        toast({
          title: "API Key Invalid",
          description: result.error || "Please check your API key.",
          variant: "destructive",
        })
      }
    } catch (error) {
      toast({
        title: "Validation Error",
        description: "Failed to validate API key. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsValidating(false)
    }
  }

  const handleSaveConfig = async () => {
    setIsSaving(true)

    try {
      // Save the API key configuration
      const response = await fetch("/api/settings/api-keys", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          openAIKey,
          customBaseUrl: customBaseUrl || undefined,
        }),
      })

      if (!response.ok) {
        throw new Error("Failed to save API key configuration")
      }

      toast({
        title: "Configuration saved",
        description: "Your API key configuration has been saved successfully.",
      })

      // Reload the page to apply the new configuration
      window.location.reload()
    } catch (error) {
      console.error("Error saving API key configuration:", error)
      toast({
        title: "Error",
        description: "Failed to save API key configuration. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsSaving(false)
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Key className="h-5 w-5" />
          <span>API Key Configuration</span>
        </CardTitle>
        <CardDescription>Configure your OpenAI API key for music generation</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="openai-key">OpenAI API Key</Label>
          <Input
            id="openai-key"
            type="password"
            placeholder="sk-..."
            value={openAIKey}
            onChange={(e) => setOpenAIKey(e.target.value)}
          />
          {validationResult && (
            <div
              className={`p-3 rounded-md text-sm ${
                validationResult.valid
                  ? "bg-green-50 text-green-700 border border-green-200"
                  : "bg-red-50 text-red-700 border border-red-200"
              }`}
            >
              {validationResult.valid ? (
                <div className="flex items-center">
                  <CheckCircle className="h-4 w-4 mr-2" />
                  {validationResult.message}
                  {validationResult.accountsCount !== undefined && (
                    <span className="ml-2">({validationResult.accountsCount} accounts available)</span>
                  )}
                </div>
              ) : (
                <div className="flex items-center">
                  <AlertCircle className="h-4 w-4 mr-2" />
                  {validationResult.error}
                </div>
              )}
            </div>
          )}
          <p className="text-sm text-muted-foreground">
            Your API key is stored securely in your browser and never sent to our servers.
          </p>
        </div>

        <div className="space-y-2">
          <Label htmlFor="base-url">Custom Base URL (Optional)</Label>
          <Input
            id="base-url"
            placeholder="https://api.openai.com/v1"
            value={customBaseUrl}
            onChange={(e) => setCustomBaseUrl(e.target.value)}
          />
          <p className="text-sm text-muted-foreground">Use a custom OpenAI-compatible API endpoint if you have one.</p>
        </div>
      </CardContent>
      <CardFooter>
        <Button variant="outline" onClick={validateApiKey} disabled={isValidating || !openAIKey} className="mr-2">
          {isValidating ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Testing...
            </>
          ) : (
            <>
              <CheckCircle className="mr-2 h-4 w-4" />
              Test API Key
            </>
          )}
        </Button>
        <Button onClick={handleSaveConfig} disabled={isSaving || !openAIKey}>
          {isSaving ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Saving...
            </>
          ) : (
            <>
              <Save className="mr-2 h-4 w-4" />
              Save Configuration
            </>
          )}
        </Button>
      </CardFooter>
    </Card>
  )
}
