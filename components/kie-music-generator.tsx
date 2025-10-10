"use client"

import * as React from "react"
import { Textarea } from "@/components/ui/textarea"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Music, Loader2, Mic, MicOff } from "lucide-react"
import { MusicPlayerCard } from "@/components/music-player-card"
import { useToast } from "@/hooks/use-toast"
import { Switch } from "@/components/ui/switch"
import { Label } from "@/components/ui/label"

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

export function KieMusicGenerator() {
  const [prompt, setPrompt] = React.useState("")
  const [instrumental, setInstrumental] = React.useState(false)
  const [customMode, setCustomMode] = React.useState(false)
  const [model, setModel] = React.useState("V3_5")
  const [generatedMusic, setGeneratedMusic] = React.useState<GeneratedMusic | null>(null)
  const [isLoading, setIsLoading] = React.useState(false)
  const [error, setError] = React.useState<string | null>(null)
  const { toast } = useToast()

  const models = [
    { value: "V3_5", label: "V3.5 (Latest)" },
    { value: "V3", label: "V3 (Stable)" },
    { value: "V2", label: "V2 (Classic)" },
  ]

  const handleGenerateMusic = async () => {
    setIsLoading(true)
    setError(null)
    setGeneratedMusic(null)

    try {
      const response = await fetch("/api/generate-music-kie", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          prompt,
          instrumental,
          customMode,
          model,
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
        description: "Your Kie.ai powered track is ready to play.",
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
          <CardTitle className="text-2xl font-bold flex items-center gap-2">
            <Music className="w-6 h-6 text-purple-400" />
            Kie.ai Music Generator
          </CardTitle>
          <p className="text-sm text-gray-400 mt-2">
            Create professional music with vocals or instrumental tracks using Kie.ai's powerful models
          </p>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Main Prompt */}
          <div>
            <label htmlFor="music-prompt" className="block text-sm font-medium text-gray-300 mb-2">
              Describe your music:
            </label>
            <Textarea
              id="music-prompt"
              placeholder="e.g., A soulful pop ballad with expressive female vocals and uplifting lyrics, An energetic EDM track with heavy bass drops, A calm acoustic guitar instrumental"
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              className="bg-gray-900 border-gray-700 text-gray-50 placeholder:text-gray-500 focus-visible:ring-purple-500"
              rows={4}
              disabled={isLoading}
            />
          </div>

          {/* Settings Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Instrumental Toggle */}
            <div className="flex items-center justify-between space-x-2 p-4 bg-gray-900 rounded-lg border border-gray-700">
              <div className="flex items-center gap-2">
                {instrumental ? (
                  <MicOff className="w-5 h-5 text-gray-400" />
                ) : (
                  <Mic className="w-5 h-5 text-purple-400" />
                )}
                <Label htmlFor="instrumental" className="text-sm font-medium cursor-pointer">
                  {instrumental ? "Instrumental Only" : "With Vocals"}
                </Label>
              </div>
              <Switch id="instrumental" checked={instrumental} onCheckedChange={setInstrumental} disabled={isLoading} />
            </div>

            {/* Custom Mode Toggle */}
            <div className="flex items-center justify-between space-x-2 p-4 bg-gray-900 rounded-lg border border-gray-700">
              <Label htmlFor="custom-mode" className="text-sm font-medium cursor-pointer">
                Custom Mode (Advanced)
              </Label>
              <Switch id="custom-mode" checked={customMode} onCheckedChange={setCustomMode} disabled={isLoading} />
            </div>
          </div>

          {/* Model Selection */}
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">Model Version:</label>
            <Select value={model} onValueChange={setModel} disabled={isLoading}>
              <SelectTrigger className="bg-gray-900 border-gray-700 text-gray-50">
                <SelectValue />
              </SelectTrigger>
              <SelectContent className="bg-gray-800 border-gray-700 text-gray-50">
                {models.map((m) => (
                  <SelectItem key={m.value} value={m.value}>
                    {m.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Generate Button */}
          <Button
            onClick={handleGenerateMusic}
            disabled={isLoading || !prompt.trim()}
            className="w-full bg-gradient-to-r from-purple-600 to-blue-500 hover:from-purple-700 hover:to-blue-600 text-white py-3"
          >
            {isLoading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Generating with Kie.ai... (This may take 1-2 minutes)
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
              <strong>Tip:</strong> Kie.ai excels at creating music with vocals. Be specific about the vocal style,
              mood, and lyrics theme for best results.
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
