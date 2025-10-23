"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import { useToast } from "@/hooks/use-toast"
import { Key, Save, Eye, EyeOff, CheckCircle, XCircle, AlertTriangle, Music, Video } from "lucide-react"

export default function SettingsPage() {
  const [sunoApiKey, setSunoApiKey] = useState("")
  const [replicateApiKey, setReplicateApiKey] = useState("")
  const [showSunoKey, setShowSunoKey] = useState(false)
  const [showReplicateKey, setShowReplicateKey] = useState(false)
  const [isSaving, setIsSaving] = useState(false)
  const [apiStatus, setApiStatus] = useState<{
    suno: "connected" | "disconnected" | "checking"
    replicate: "connected" | "disconnected" | "checking"
  }>({
    suno: "checking",
    replicate: "checking",
  })

  const { toast } = useToast()

  useEffect(() => {
    checkApiKeys()
  }, [])

  const checkApiKeys = async () => {
    try {
      const response = await fetch("/api/check-api-keys")
      if (response.ok) {
        const data = await response.json()
        setApiStatus({
          suno: data.suno ? "connected" : "disconnected",
          replicate: data.replicate ? "connected" : "disconnected",
        })
      }
    } catch (error) {
      console.error("Error checking API keys:", error)
    }
  }

  const handleSave = async () => {
    setIsSaving(true)

    try {
      // In a real implementation, this would save to a database or secure storage
      // For now, we'll show instructions for environment variables

      toast({
        title: "API Keys Configuration",
        description: "Please add your API keys to the environment variables as shown below.",
      })

      setIsSaving(false)
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to save settings.",
        variant: "destructive",
      })
      setIsSaving(false)
    }
  }

  const getStatusBadge = (status: "connected" | "disconnected" | "checking") => {
    if (status === "connected") {
      return (
        <Badge className="bg-green-600 hover:bg-green-700">
          <CheckCircle className="h-3 w-3 mr-1" />
          Connected
        </Badge>
      )
    } else if (status === "disconnected") {
      return (
        <Badge variant="destructive">
          <XCircle className="h-3 w-3 mr-1" />
          Not Configured
        </Badge>
      )
    } else {
      return (
        <Badge variant="outline" className="border-yellow-600 text-yellow-600">
          <AlertTriangle className="h-3 w-3 mr-1" />
          Checking...
        </Badge>
      )
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-950 via-black to-blue-950">
      <div className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-white mb-2">Settings</h1>
          <p className="text-gray-400">Configure your API keys and preferences</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Suno API Configuration */}
          <Card className="border-purple-500/30 bg-black/40 backdrop-blur-md">
            <CardHeader>
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <Music className="h-6 w-6 text-purple-400" />
                  <div>
                    <CardTitle className="text-white">Suno AI API</CardTitle>
                    <CardDescription className="text-gray-400">Music generation service</CardDescription>
                  </div>
                </div>
                {getStatusBadge(apiStatus.suno)}
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label className="text-gray-300">API Key (Bearer Token)</Label>
                <div className="flex space-x-2 mt-2">
                  <Input
                    type={showSunoKey ? "text" : "password"}
                    value={sunoApiKey}
                    onChange={(e) => setSunoApiKey(e.target.value)}
                    placeholder="Bearer eyJhbGciOiJSUzI1NiIsIm..."
                    className="bg-purple-950/50 border-purple-500/30 text-white"
                  />
                  <Button
                    variant="outline"
                    size="icon"
                    onClick={() => setShowSunoKey(!showSunoKey)}
                    className="border-purple-500/50 bg-transparent"
                  >
                    {showSunoKey ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </Button>
                </div>
              </div>

              <div className="bg-purple-950/30 border border-purple-500/30 p-4 rounded-lg space-y-2">
                <p className="text-sm font-semibold text-purple-400">How to get your Suno API token:</p>
                <ol className="text-xs text-gray-400 space-y-1 list-decimal list-inside">
                  <li>Log into suno.com in your browser</li>
                  <li>Open Developer Tools (F12)</li>
                  <li>Go to the Network tab</li>
                  <li>Generate any music on Suno</li>
                  <li>Find a request to studio-api.prod.suno.com</li>
                  <li>Look for the Authorization header</li>
                  <li>Copy the entire value (including "Bearer ")</li>
                </ol>
              </div>

              <div className="bg-yellow-950/30 border border-yellow-600/30 p-3 rounded-lg">
                <p className="text-xs text-yellow-400">
                  <strong>Important:</strong> Token must start with "Bearer " (with space)
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Replicate API Configuration */}
          <Card className="border-purple-500/30 bg-black/40 backdrop-blur-md">
            <CardHeader>
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <Video className="h-6 w-6 text-purple-400" />
                  <div>
                    <CardTitle className="text-white">Replicate API</CardTitle>
                    <CardDescription className="text-gray-400">Video generation & AI models</CardDescription>
                  </div>
                </div>
                {getStatusBadge(apiStatus.replicate)}
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label className="text-gray-300">API Token</Label>
                <div className="flex space-x-2 mt-2">
                  <Input
                    type={showReplicateKey ? "text" : "password"}
                    value={replicateApiKey}
                    onChange={(e) => setReplicateApiKey(e.target.value)}
                    placeholder="r8_xxxxxxxxxxxxxxxxxxxxxxxxxxxx"
                    className="bg-purple-950/50 border-purple-500/30 text-white"
                  />
                  <Button
                    variant="outline"
                    size="icon"
                    onClick={() => setShowReplicateKey(!showReplicateKey)}
                    className="border-purple-500/50 bg-transparent"
                  >
                    {showReplicateKey ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </Button>
                </div>
              </div>

              <div className="bg-purple-950/30 border border-purple-500/30 p-4 rounded-lg space-y-2">
                <p className="text-sm font-semibold text-purple-400">How to get your Replicate API token:</p>
                <ol className="text-xs text-gray-400 space-y-1 list-decimal list-inside">
                  <li>Go to replicate.com/account</li>
                  <li>Sign up or log in</li>
                  <li>Navigate to API tokens section</li>
                  <li>Create a new token or copy existing one</li>
                </ol>
              </div>

              <div className="bg-blue-950/30 border border-blue-600/30 p-3 rounded-lg">
                <p className="text-xs text-blue-400">
                  <strong>Used for:</strong> MusicGen, video generation, face swapping, and other AI models
                </p>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Environment Variables Instructions */}
        <Card className="border-purple-500/30 bg-black/40 backdrop-blur-md mt-6">
          <CardHeader>
            <div className="flex items-center space-x-3">
              <Key className="h-6 w-6 text-purple-400" />
              <div>
                <CardTitle className="text-white">Environment Variables Setup</CardTitle>
                <CardDescription className="text-gray-400">Add these to your .env.local file</CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <Textarea
              value={`# Suno AI - Music Generation
SUNO_API_KEY="${sunoApiKey || "Bearer YOUR_SUNO_TOKEN_HERE"}"

# Replicate - Video & AI Models
REPLICATE_API_KEY="${replicateApiKey || "YOUR_REPLICATE_TOKEN_HERE"}"

# Optional: Other APIs
UDIO_API_KEY="YOUR_UDIO_TOKEN_HERE"
OPENAI_API_KEY="YOUR_OPENAI_KEY_HERE"`}
              className="bg-gray-900 border-purple-500/30 text-green-400 font-mono text-sm min-h-[200px]"
              readOnly
            />

            <div className="bg-red-950/30 border border-red-600/30 p-4 rounded-lg">
              <p className="text-sm font-semibold text-red-400 mb-2">⚠️ Security Warning</p>
              <ul className="text-xs text-red-300 space-y-1 list-disc list-inside">
                <li>Never commit .env.local to version control</li>
                <li>Never share your API keys publicly</li>
                <li>Add .env.local to your .gitignore file</li>
                <li>Restart your development server after changing environment variables</li>
              </ul>
            </div>

            <Button
              onClick={handleSave}
              disabled={isSaving}
              className="w-full bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700"
            >
              <Save className="h-4 w-4 mr-2" />
              {isSaving ? "Saving..." : "Save Configuration"}
            </Button>
          </CardContent>
        </Card>

        {/* Features Guide */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-6">
          <Card className="border-purple-500/30 bg-black/40 backdrop-blur-md">
            <CardHeader>
              <CardTitle className="text-white text-sm">Music Generation</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-xs text-gray-400">
                Generate original music with Suno AI. Choose from 50+ genres, custom lyrics, and advanced controls.
              </p>
            </CardContent>
          </Card>

          <Card className="border-purple-500/30 bg-black/40 backdrop-blur-md">
            <CardHeader>
              <CardTitle className="text-white text-sm">Video Creation</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-xs text-gray-400">
                Create music videos with AI-generated visuals. Multiple styles including cinematic, anime, and 3D.
              </p>
            </CardContent>
          </Card>

          <Card className="border-purple-500/30 bg-black/40 backdrop-blur-md">
            <CardHeader>
              <CardTitle className="text-white text-sm">Face Swapping</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-xs text-gray-400">
                Add deepfake effects to videos. Upload face images for realistic face swapping (requires consent).
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
