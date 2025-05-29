"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Mic2, Download } from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import { AudioPlayer } from "./audio-player"

// Voice style options
const VOICE_STYLES = ["alloy", "echo", "fable", "onyx", "nova", "shimmer"]

// Emotion options
const EMOTIONS = [
  "Passionate",
  "Energetic",
  "Calm",
  "Melancholic",
  "Joyful",
  "Mysterious",
  "Intense",
  "Dreamy",
  "Playful",
  "Serious",
]

export function AIVocalGenerator() {
  const [lyrics, setLyrics] = useState("")
  const [title, setTitle] = useState("")
  const [voice, setVoice] = useState("alloy")
  const [emotion, setEmotion] = useState("Passionate")
  const [isGenerating, setIsGenerating] = useState(false)
  const [generatedVocal, setGeneratedVocal] = useState<string | null>(null)
  const { toast } = useToast()

  const handleGenerateVocal = async () => {
    if (!lyrics) {
      toast({
        title: "No Lyrics",
        description: "Please enter lyrics first.",
        variant: "destructive",
      })
      return
    }

    setIsGenerating(true)

    try {
      // Sanitize inputs to ensure they don't contain problematic characters
      const sanitizedLyrics = lyrics.replace(/[^\x00-\x7F]/g, "") // Remove non-ASCII characters
      const sanitizedTitle = title.replace(/[^\x00-\x7F]/g, "") // Remove non-ASCII characters

      // Call our API endpoint
      const response = await fetch("/api/generate-vocals", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          lyrics: sanitizedLyrics,
          voice,
          emotion: emotion.toLowerCase(),
          title: sanitizedTitle || "Untitled Vocal",
        }),
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.message || "Failed to generate vocals")
      }

      const data = await response.json()

      // Set the generated vocal URL
      setGeneratedVocal(data.audioUrl)

      toast({
        title: "Vocals Generated!",
        description:
          data.message || `AI vocals in ${voice} voice with ${emotion.toLowerCase()} emotion have been created.`,
      })
    } catch (error) {
      console.error("Error generating vocals:", error)
      toast({
        title: "Generation Failed",
        description: error instanceof Error ? error.message : "There was an error generating vocals. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsGenerating(false)
    }
  }

  const handleDownload = () => {
    if (generatedVocal) {
      const link = document.createElement("a")
      link.href = generatedVocal
      link.download = `${title || "vocal"}-${voice}-${emotion.toLowerCase()}.mp3`
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
    }
  }

  return (
    <div className="container py-6 space-y-6">
      <div className="flex flex-col space-y-2">
        <h2 className="text-2xl font-bold tracking-tight">AI Vocal Generator</h2>
        <p className="text-muted-foreground">Create professional vocals for your music using AI</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Generate Vocals</CardTitle>
          <CardDescription>Enter lyrics and customize voice settings to create AI-generated vocals</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="title">Track Title</Label>
            <Input
              id="title"
              placeholder="Enter a title for your vocal track"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="voice">Voice</Label>
              <Select value={voice} onValueChange={setVoice}>
                <SelectTrigger id="voice">
                  <SelectValue placeholder="Select voice" />
                </SelectTrigger>
                <SelectContent>
                  {VOICE_STYLES.map((style) => (
                    <SelectItem key={style} value={style}>
                      {style.charAt(0).toUpperCase() + style.slice(1)}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="emotion">Emotion</Label>
              <Select value={emotion} onValueChange={setEmotion}>
                <SelectTrigger id="emotion">
                  <SelectValue placeholder="Select emotion" />
                </SelectTrigger>
                <SelectContent>
                  {EMOTIONS.map((em) => (
                    <SelectItem key={em} value={em}>
                      {em}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="lyrics">Lyrics</Label>
            <Textarea
              id="lyrics"
              placeholder="Enter lyrics for your vocal track"
              className="min-h-[200px]"
              value={lyrics}
              onChange={(e) => setLyrics(e.target.value)}
            />
            <p className="text-xs text-muted-foreground">
              Write lyrics with clear structure. Use line breaks to indicate pauses.
            </p>
          </div>
        </CardContent>
        <CardFooter className="flex flex-col gap-4">
          <Button className="w-full" onClick={handleGenerateVocal} disabled={isGenerating || !lyrics}>
            {isGenerating ? (
              <div className="flex items-center gap-2">
                <div className="animate-spin h-4 w-4 border-2 border-current border-t-transparent rounded-full"></div>
                <span>Generating Vocals...</span>
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <Mic2 className="h-4 w-4" />
                <span>Generate Vocals</span>
              </div>
            )}
          </Button>

          {generatedVocal && (
            <div className="w-full space-y-4">
              <div className="p-4 bg-secondary/20 rounded-md">
                <AudioPlayer audioUrl={generatedVocal} title={title || "Generated Vocal Track"} />
                <div className="flex gap-2 mt-4">
                  <Badge variant="outline">{voice}</Badge>
                  <Badge variant="outline">{emotion}</Badge>
                </div>
              </div>

              <Button variant="outline" className="w-full" onClick={handleDownload}>
                <Download className="h-4 w-4 mr-2" />
                <span>Download Vocal Track</span>
              </Button>
            </div>
          )}
        </CardFooter>
      </Card>
    </div>
  )
}

export default AIVocalGenerator
