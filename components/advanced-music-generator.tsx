"use client"

import * as React from "react"
import { Textarea } from "@/components/ui/textarea"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Slider } from "@/components/ui/slider"
import { Music, Loader2, Settings } from "lucide-react"
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
}

export function AdvancedMusicGenerator() {
  const [prompt, setPrompt] = React.useState("")
  const [selectedMode, setSelectedMode] = React.useState<string>("none")
  const [selectedGenre, setSelectedGenre] = React.useState<string>("electronic")
  const [duration, setDuration] = React.useState([30])
  const [creativity, setCreativity] = React.useState([0.7])
  const [generatedMusic, setGeneratedMusic] = React.useState<GeneratedMusic | null>(null)
  const [isLoading, setIsLoading] = React.useState(false)
  const [error, setError] = React.useState<string | null>(null)
  const [showAdvanced, setShowAdvanced] = React.useState(false)
  const { toast } = useToast()

  const genres = [
    "electronic",
    "pop",
    "rock",
    "jazz",
    "classical",
    "hip-hop",
    "ambient",
    "techno",
    "house",
    "trance",
    "dubstep",
    "drum-and-bass",
  ]

  const modes = [
    { value: "none", label: "No specific mode" },
    { value: "ionian", label: "Ionian (Major)" },
    { value: "dorian", label: "Dorian" },
    { value: "phrygian", label: "Phrygian" },
    { value: "lydian", label: "Lydian" },
    { value: "mixolydian", label: "Mixolydian" },
    { value: "aeolian", label: "Aeolian (Natural Minor)" },
    { value: "locrian", label: "Locrian" },
  ]

  const handleGenerateMusic = async () => {
    setIsLoading(true)
    setError(null)
    setGeneratedMusic(null)

    try {
      const enhancedPrompt = `${selectedGenre} music, ${prompt}`

      const response = await fetch("/api/generate-music", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          prompt: enhancedPrompt,
          mode: selectedMode,
          duration: duration[0],
          creativity: creativity[0],
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
        description: "Your AI-powered track is ready to play.",
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
            Advanced AI Music Generator
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Main Prompt */}
          <div>
            <label htmlFor="music-prompt" className="block text-sm font-medium text-gray-300 mb-2">
              Describe the music you want to create:
            </label>
            <Textarea
              id="music-prompt"
              placeholder="e.g., An upbeat track with driving bassline and ethereal pads, melancholic piano piece with strings, energetic rock anthem about freedom"
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              className="bg-gray-900 border-gray-700 text-gray-50 placeholder:text-gray-500 focus-visible:ring-purple-500"
              rows={3}
              disabled={isLoading}
            />
          </div>

          {/* Quick Genre Selection */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
            {genres.slice(0, 8).map((genre) => (
              <Badge
                key={genre}
                variant={selectedGenre === genre ? "default" : "outline"}
                className={`cursor-pointer text-center py-2 ${
                  selectedGenre === genre ? "bg-purple-600 text-white" : "bg-gray-700 text-gray-300 hover:bg-gray-600"
                }`}
                onClick={() => setSelectedGenre(genre)}
              >
                {genre.charAt(0).toUpperCase() + genre.slice(1)}
              </Badge>
            ))}
          </div>

          {/* Advanced Settings Toggle */}
          <Button
            variant="ghost"
            onClick={() => setShowAdvanced(!showAdvanced)}
            className="text-purple-400 hover:text-purple-300"
          >
            <Settings className="w-4 h-4 mr-2" />
            {showAdvanced ? "Hide" : "Show"} Advanced Settings
          </Button>

          {/* Advanced Settings */}
          {showAdvanced && (
            <div className="space-y-4 p-4 bg-gray-900 rounded-lg border border-gray-700">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Musical Mode:</label>
                <Select value={selectedMode} onValueChange={setSelectedMode} disabled={isLoading}>
                  <SelectTrigger className="bg-gray-800 border-gray-600 text-gray-50">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="bg-gray-800 border-gray-600 text-gray-50">
                    {modes.map((mode) => (
                      <SelectItem key={mode.value} value={mode.value}>
                        {mode.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Duration: {duration[0]} seconds</label>
                <Slider
                  value={duration}
                  onValueChange={setDuration}
                  max={60}
                  min={10}
                  step={5}
                  className="w-full"
                  disabled={isLoading}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Creativity: {creativity[0].toFixed(1)}
                </label>
                <Slider
                  value={creativity}
                  onValueChange={setCreativity}
                  max={1}
                  min={0.1}
                  step={0.1}
                  className="w-full"
                  disabled={isLoading}
                />
              </div>
            </div>
          )}

          {/* Generate Button */}
          <Button
            onClick={handleGenerateMusic}
            disabled={isLoading || !prompt.trim()}
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
