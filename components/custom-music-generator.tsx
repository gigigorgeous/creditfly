"use client"

import * as React from "react"
import { Textarea } from "@/components/ui/textarea"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Slider } from "@/components/ui/slider"
import { Music, Loader2, Server, AlertCircle } from "lucide-react"
import { MusicPlayerCard } from "@/components/music-player-card"
import { useToast } from "@/hooks/use-toast"
import { Badge } from "@/components/ui/badge"

interface GeneratedMusic {
  audioUrl: string
  title: string
  artist: string
  genre: string
  duration: string
  bpm: number
  keySignature: string
  taskId?: string
}

export function CustomMusicGenerator() {
  const [prompt, setPrompt] = React.useState("")
  const [modelSize, setModelSize] = React.useState("medium")
  const [duration, setDuration] = React.useState([30])
  const [temperature, setTemperature] = React.useState([1.0])
  const [generatedMusic, setGeneratedMusic] = React.useState<GeneratedMusic | null>(null)
  const [isLoading, setIsLoading] = React.useState(false)
  const [error, setError] = React.useState<string | null>(null)
  const [backendStatus, setBackendStatus] = React.useState<any>(null)
  const { toast } = useToast()

  const modelSizes = [
    { value: "small", label: "Small (Faster)" },
    { value: "medium", label: "Medium (Balanced)" },
    { value: "large", label: "Large (Best Quality)" },
  ]

  React.useEffect(() => {
    checkBackendHealth()
  }, [])

  const checkBackendHealth = async () => {
    try {
      const response = await fetch("/api/backend-health")
      const data = await response.json()
      setBackendStatus(data)
    } catch (error) {
      setBackendStatus({ status: "unhealthy", connected: false })
    }
  }

  const handleGenerateMusic = async () => {
    setIsLoading(true)
    setError(null)
    setGeneratedMusic(null)

    try {
      const response = await fetch("/api/generate-music-custom", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          prompt,
          duration: duration[0],
          model_size: modelSize,
          temperature: temperature[0],
        }),
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || "Failed to generate music")
      }

      const data: GeneratedMusic = await response.json()
      setGeneratedMusic(data)

      toast({
        title: "Music Generated!",
        description: "Your custom AI-powered track is ready to play.",
      })
    } catch (err: any) {
      setError(err.message)
      toast({
        title: "Error generating music",
        description: err.message,
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="space-y-6">
      <Card className="w-full max-w-4xl mx-auto bg-gray-800 text-gray-50 border-gray-700">
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="text-2xl font-bold flex items-center gap-2">
              <Server className="w-6 h-6 text-purple-400" />
              Custom AI Music Generator
            </CardTitle>
            <Badge
              variant={backendStatus?.connected ? "default" : "destructive"}
              className={backendStatus?.connected ? "bg-green-600" : "bg-red-600"}
            >
              {backendStatus?.connected ? "Backend Online" : "Backend Offline"}
            </Badge>
          </div>
          <p className="text-sm text-gray-400 mt-2">
            Your own MusicGen-powered music generation - no external APIs required
          </p>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Backend Status Warning */}
          {backendStatus && !backendStatus.connected && (
            <div className="p-4 bg-yellow-900/20 border border-yellow-700 rounded-lg flex items-start gap-3">
              <AlertCircle className="w-5 h-5 text-yellow-400 flex-shrink-0 mt-0.5" />
              <div>
                <p className="text-yellow-300 text-sm font-semibold">Backend Not Connected</p>
                <p className="text-yellow-400 text-xs mt-1">
                  Make sure your Python backend is running. Run:{" "}
                  <code className="bg-gray-900 px-2 py-0.5 rounded">
                    cd python-backend && uvicorn musicgen_server:app --reload
                  </code>
                </p>
              </div>
            </div>
          )}

          {/* Main Prompt */}
          <div>
            <label htmlFor="music-prompt" className="block text-sm font-medium text-gray-300 mb-2">
              Describe your music:
            </label>
            <Textarea
              id="music-prompt"
              placeholder="e.g., An upbeat electronic track with synth melodies, A peaceful piano piece with gentle strings, An energetic rock anthem with driving guitars"
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              className="bg-gray-900 border-gray-700 text-gray-50 placeholder:text-gray-500 focus-visible:ring-purple-500"
              rows={4}
              disabled={isLoading}
            />
          </div>

          {/* Model Size Selection */}
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">Model Size:</label>
            <Select value={modelSize} onValueChange={setModelSize} disabled={isLoading}>
              <SelectTrigger className="bg-gray-900 border-gray-700 text-gray-50">
                <SelectValue />
              </SelectTrigger>
              <SelectContent className="bg-gray-800 border-gray-700 text-gray-50">
                {modelSizes.map((m) => (
                  <SelectItem key={m.value} value={m.value}>
                    {m.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Advanced Settings */}
          <div className="space-y-4 p-4 bg-gray-900 rounded-lg border border-gray-700">
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">Duration: {duration[0]} seconds</label>
              <Slider
                value={duration}
                onValueChange={setDuration}
                max={30}
                min={5}
                step={5}
                className="w-full"
                disabled={isLoading}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Temperature: {temperature[0].toFixed(1)}
              </label>
              <Slider
                value={temperature}
                onValueChange={setTemperature}
                max={1.5}
                min={0.5}
                step={0.1}
                className="w-full"
                disabled={isLoading}
              />
              <p className="text-xs text-gray-400 mt-1">Higher temperature = more creative/random output</p>
            </div>
          </div>

          {/* Generate Button */}
          <Button
            onClick={handleGenerateMusic}
            disabled={isLoading || !prompt.trim() || !backendStatus?.connected}
            className="w-full bg-gradient-to-r from-purple-600 to-blue-500 hover:from-purple-700 hover:to-blue-600 text-white py-3"
          >
            {isLoading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Generating Music... (This may take 1-2 minutes)
              </>
            ) : (
              <>
                <Music className="mr-2 h-4 w-4" />
                Generate Music
              </>
            )}
          </Button>

          {/* Error Display */}
          {error && (
            <div className="p-4 bg-red-900/20 border border-red-700 rounded-lg">
              <p className="text-red-400 text-sm">{error}</p>
            </div>
          )}

          {/* Info Box */}
          <div className="p-4 bg-blue-900/20 border border-blue-700 rounded-lg">
            <p className="text-blue-300 text-sm">
              <strong>✨ Your Own Technology:</strong> This uses Facebook's MusicGen running on your own server. No
              external APIs, full control, unlimited generations!
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Generated Music Player */}
      {generatedMusic && (
        <div className="w-full max-w-4xl mx-auto">
          <MusicPlayerCard {...generatedMusic} />
        </div>
      )}
    </div>
  )
}
