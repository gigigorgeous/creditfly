"use client"

import * as React from "react"
import { Textarea } from "@/components/ui/textarea"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Sparkles, Copy, RefreshCw, Download } from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import { Badge } from "@/components/ui/badge"

export function EnhancedLyricsGenerator() {
  const [prompt, setPrompt] = React.useState("")
  const [selectedGenre, setSelectedGenre] = React.useState<string>("")
  const [selectedMood, setSelectedMood] = React.useState<string>("")
  const [selectedTheme, setSelectedTheme] = React.useState<string>("")
  const [lyrics, setLyrics] = React.useState("")
  const [isLoading, setIsLoading] = React.useState(false)
  const [error, setError] = React.useState<string | null>(null)
  const { toast } = useToast()

  const genres = ["Pop", "Rock", "Hip-Hop", "R&B", "Country", "Jazz", "Electronic", "Folk", "Blues", "Reggae"]
  const moods = [
    "Upbeat",
    "Melancholic",
    "Energetic",
    "Romantic",
    "Nostalgic",
    "Empowering",
    "Dreamy",
    "Dark",
    "Hopeful",
  ]
  const themes = [
    "Love",
    "Heartbreak",
    "Freedom",
    "Adventure",
    "Success",
    "Struggle",
    "Friendship",
    "Family",
    "Dreams",
    "Change",
  ]

  const handleGenerateLyrics = async () => {
    setIsLoading(true)
    setError(null)
    setLyrics("")

    try {
      const response = await fetch("/api/generate-lyrics", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          prompt,
          genre: selectedGenre,
          mood: selectedMood,
          theme: selectedTheme,
        }),
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || "Failed to generate lyrics")
      }

      const data = await response.json()
      setLyrics(data.lyrics)

      toast({
        title: "Lyrics Generated!",
        description: "Your song lyrics are ready.",
      })
    } catch (err: any) {
      setError(err.message)
      toast({
        title: "Error generating lyrics",
        description: err.message,
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  const copyToClipboard = () => {
    navigator.clipboard.writeText(lyrics)
    toast({
      title: "Lyrics Copied!",
      description: "The generated lyrics have been copied to your clipboard.",
    })
  }

  const downloadLyrics = () => {
    const blob = new Blob([lyrics], { type: "text/plain" })
    const url = URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url
    a.download = "generated-lyrics.txt"
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)

    toast({
      title: "Lyrics Downloaded!",
      description: "Your lyrics have been saved as a text file.",
    })
  }

  return (
    <Card className="w-full max-w-4xl mx-auto bg-gray-800 text-gray-50 border-gray-700">
      <CardHeader>
        <CardTitle className="text-2xl font-bold flex items-center gap-2">
          <Sparkles className="w-6 h-6 text-purple-400" />
          Enhanced AI Lyrics Generator
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Main Prompt */}
        <div>
          <label htmlFor="lyrics-prompt" className="block text-sm font-medium text-gray-300 mb-2">
            Enter your theme or idea for the lyrics:
          </label>
          <Textarea
            id="lyrics-prompt"
            placeholder="e.g., A song about overcoming challenges and finding inner strength, a love story set in a cyberpunk city, celebrating friendship and good times"
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            className="bg-gray-900 border-gray-700 text-gray-50 placeholder:text-gray-500 focus-visible:ring-purple-500"
            rows={3}
            disabled={isLoading}
          />
        </div>

        {/* Genre Selection */}
        <div>
          <label className="block text-sm font-medium text-gray-300 mb-2">Genre (Optional):</label>
          <div className="flex flex-wrap gap-2">
            {genres.map((genre) => (
              <Badge
                key={genre}
                variant={selectedGenre === genre ? "default" : "outline"}
                className={`cursor-pointer ${
                  selectedGenre === genre ? "bg-purple-600 text-white" : "bg-gray-700 text-gray-300 hover:bg-gray-600"
                }`}
                onClick={() => setSelectedGenre(selectedGenre === genre ? "" : genre)}
              >
                {genre}
              </Badge>
            ))}
          </div>
        </div>

        {/* Mood Selection */}
        <div>
          <label className="block text-sm font-medium text-gray-300 mb-2">Mood (Optional):</label>
          <div className="flex flex-wrap gap-2">
            {moods.map((mood) => (
              <Badge
                key={mood}
                variant={selectedMood === mood ? "default" : "outline"}
                className={`cursor-pointer ${
                  selectedMood === mood ? "bg-blue-600 text-white" : "bg-gray-700 text-gray-300 hover:bg-gray-600"
                }`}
                onClick={() => setSelectedMood(selectedMood === mood ? "" : mood)}
              >
                {mood}
              </Badge>
            ))}
          </div>
        </div>

        {/* Theme Selection */}
        <div>
          <label className="block text-sm font-medium text-gray-300 mb-2">Theme (Optional):</label>
          <div className="flex flex-wrap gap-2">
            {themes.map((theme) => (
              <Badge
                key={theme}
                variant={selectedTheme === theme ? "default" : "outline"}
                className={`cursor-pointer ${
                  selectedTheme === theme ? "bg-green-600 text-white" : "bg-gray-700 text-gray-300 hover:bg-gray-600"
                }`}
                onClick={() => setSelectedTheme(selectedTheme === theme ? "" : theme)}
              >
                {theme}
              </Badge>
            ))}
          </div>
        </div>

        {/* Generate Button */}
        <Button
          onClick={handleGenerateLyrics}
          disabled={isLoading || !prompt.trim()}
          className="w-full bg-gradient-to-r from-purple-600 to-blue-500 hover:from-purple-700 hover:to-blue-600 text-white"
        >
          {isLoading ? (
            <>
              <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
              Generating Lyrics...
            </>
          ) : (
            <>
              <Sparkles className="mr-2 h-4 w-4" />
              Generate Lyrics
            </>
          )}
        </Button>

        {/* Error Display */}
        {error && (
          <div className="p-4 bg-red-900/20 border border-red-700 rounded-lg">
            <p className="text-red-400 text-sm">{error}</p>
          </div>
        )}

        {/* Generated Lyrics */}
        {lyrics && (
          <div className="relative p-6 bg-gray-900 rounded-lg border border-gray-700">
            <div className="flex justify-between items-center mb-4">
              <h3 className="font-semibold text-lg text-purple-300">Generated Lyrics:</h3>
              <div className="flex gap-2">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={copyToClipboard}
                  className="text-gray-400 hover:text-gray-50"
                >
                  <Copy className="w-4 h-4 mr-1" />
                  Copy
                </Button>
                <Button variant="ghost" size="sm" onClick={downloadLyrics} className="text-gray-400 hover:text-gray-50">
                  <Download className="w-4 h-4 mr-1" />
                  Download
                </Button>
              </div>
            </div>
            <pre className="whitespace-pre-wrap text-sm text-gray-200 font-mono max-h-96 overflow-y-auto leading-relaxed">
              {lyrics}
            </pre>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
