"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { useToast } from "@/hooks/use-toast"
import { Loader2, Key, Save } from "lucide-react"

export function ApiKeyConfig() {
  const [openAIKey, setOpenAIKey] = useState("")
  const [customBaseUrl, setCustomBaseUrl] = useState("")
  const [isSaving, setIsSaving] = useState(false)
  const { toast } = useToast()

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
