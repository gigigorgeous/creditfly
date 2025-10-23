"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Slider } from "@/components/ui/slider"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Loader2, Music } from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import { AudioPlayer } from "./audio-player"

interface MusicGenerationStatus {
  id: string
  status: "queued" | "in_progress" | "complete" | "failed"
  title: string
  audioUrl?: string
  createdAt: string
  updatedAt?: string
  error?: string
}

export function MusicGenerator() {
  const [title, setTitle] = useState("")
  const [prompt, setPrompt] = useState("")
  const [lyrics, setLyrics] = useState("")
  const [genre, setGenre] = useState("pop")
  const [mood, setMood] = useState("happy")
  const [style, setStyle] = useState("modern")
  const [duration, setDuration] = useState(120) // 2 minutes in seconds
  const [engine, setEngine] = useState("suno") // Default to Suno

  const [isGenerating, setIsGenerating] = useState(false)
  const [currentGeneration, setCurrentGeneration] = useState<MusicGenerationStatus | null>(null)
  const [pollingInterval, setPollingInterval] = useState<NodeJS.Timeout | null>(null)

  const { toast } = useToast()

  // Clean up polling on unmount
  useState(() => {
    return () => {
      if (pollingInterval) {
        clearInterval(pollingInterval)
      }
    }
  })

  // Start polling for generation status
  const startPolling = (generationId: string) => {
    // Clear any existing polling
    if (pollingInterval) {
      clearInterval(pollingInterval)
    }

    // Set up polling every 5 seconds
    const interval = setInterval(async () => {
      try {
        const response = await fetch(`/api/music-generation/${generationId}`)

        if (!response.ok) {
          throw new Error("Failed to check generation status")
        }

        const data = await response.json()
        setCurrentGeneration(data)

        // If generation is complete or failed, stop polling
        if (data.status === "complete" || data.status === "failed") {
          clearInterval(interval)
          setPollingInterval(null)

          if (data.status === "complete") {
            toast({
              title: "Music Generated!",
              description: "Your AI-generated music is ready to play.",
            })
          } else if (data.status === "failed") {
            toast({
              title: "Generation Failed",
              description: data.error || "There was an error generating your music.",
              variant: "destructive",
            })
          }

          setIsGenerating(false)
        }
      } catch (error) {
        console.error("Error polling generation status:", error)
      }
    }, 5000)

    setPollingInterval(interval)
  }

  const handleGenerate = async () => {
    if (!prompt.trim() && !lyrics.trim()) {
      toast({
        title: "Input Required",
        description: "Please enter either a prompt or lyrics for your music.",
        variant: "destructive",
      })
      return
    }

    setIsGenerating(true)

    try {
      const response = await fetch("/api/music-generation", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          title,
          prompt,
          genre,
          mood,
          style,
          lyrics,
          duration,
          engine, // Pass the selected engine
        }),
      })

      if (!response.ok) {
        throw new Error("Failed to start music generation")
      }

      const data = await response.json()
      setCurrentGeneration({
        id: data.id,
        status: data.status,
        title: data.title,
        createdAt: data.createdAt,
        updatedAt: data.createdAt,
      })

      toast({
        title: "Generation Started",
        description: "Your music is being generated. This may take a few minutes.",
      })

      // Start polling for status updates
      startPolling(data.id)
    } catch (error) {
      console.error("Error generating music:", error)
      toast({
        title: "Generation Failed",
        description: "There was an error starting the music generation. Please try again.",
        variant: "destructive",
      })
      setIsGenerating(false)
    }
  }

  const formatDuration = (seconds: number) => {
    const minutes = Math.floor(seconds / 60)
    const remainingSeconds = seconds % 60
    return `${minutes}:${remainingSeconds.toString().padStart(2, "0")}`
  }

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle>AI Music Generator</CardTitle>
        <CardDescription>Create original music with AI</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <Tabs defaultValue="basic" className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="basic">Basic</TabsTrigger>
            <TabsTrigger value="advanced">Advanced</TabsTrigger>
          </TabsList>

          <TabsContent value="basic" className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="title">Track Title</Label>
              <Input
                id="title"
                placeholder="Enter a title for your track"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="prompt">Music Description</Label>
              <Textarea
                id="prompt"
                placeholder="Describe the music you want to create..."
                value={prompt}
                onChange={(e) => setPrompt(e.target.value)}
                className="min-h-[100px]"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="lyrics">Lyrics (Optional)</Label>
              <Textarea
                id="lyrics"
                placeholder="Enter lyrics for your song..."
                value={lyrics}
                onChange={(e) => setLyrics(e.target.value)}
                className="min-h-[100px]"
              />
            </div>
          </TabsContent>

          <TabsContent value="advanced" className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label htmlFor="genre">Genre</Label>
                <Select value={genre} onValueChange={setGenre}>
                  <SelectTrigger id="genre">
                    <SelectValue placeholder="Select genre" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="pop">Pop</SelectItem>
                    <SelectItem value="rock">Rock</SelectItem>
                    <SelectItem value="hiphop">Hip Hop</SelectItem>
                    <SelectItem value="electronic">Electronic</SelectItem>
                    <SelectItem value="jazz">Jazz</SelectItem>
                    <SelectItem value="classical">Classical</SelectItem>
                    <SelectItem value="folk">Folk</SelectItem>
                    <SelectItem value="ambient">Ambient</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="mood">Mood</Label>
                <Select value={mood} onValueChange={setMood}>
                  <SelectTrigger id="mood">
                    <SelectValue placeholder="Select mood" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="happy">Happy</SelectItem>
                    <SelectItem value="sad">Sad</SelectItem>
                    <SelectItem value="energetic">Energetic</SelectItem>
                    <SelectItem value="calm">Calm</SelectItem>
                    <SelectItem value="dark">Dark</SelectItem>
                    <SelectItem value="uplifting">Uplifting</SelectItem>
                    <SelectItem value="romantic">Romantic</SelectItem>
                    <SelectItem value="mysterious">Mysterious</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="style">Style</Label>
                <Select value={style} onValueChange={setStyle}>
                  <SelectTrigger id="style">
                    <SelectValue placeholder="Select style" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="modern">Modern</SelectItem>
                    <SelectItem value="retro">Retro</SelectItem>
                    <SelectItem value="experimental">Experimental</SelectItem>
                    <SelectItem value="minimalist">Minimalist</SelectItem>
                    <SelectItem value="orchestral">Orchestral</SelectItem>
                    <SelectItem value="acoustic">Acoustic</SelectItem>
                    <SelectItem value="electronic">Electronic</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="space-y-2">
              <div className="flex justify-between">
                <Label htmlFor="duration">Duration: {formatDuration(duration)}</Label>
              </div>
              <Slider
                id="duration"
                min={30}
                max={300}
                step={10}
                value={[duration]}
                onValueChange={(value) => setDuration(value[0])}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="engine">AI Engine</Label>
              <Select value={engine} onValueChange={setEngine}>
                <SelectTrigger id="engine">
                  <SelectValue placeholder="Select AI engine" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="suno">Suno (High Quality)</SelectItem>
                  <SelectItem value="basic">Basic</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </TabsContent>
        </Tabs>

        {currentGeneration && (
          <div className="space-y-2 p-4 bg-muted rounded-md">
            <h3 className="font-medium">Generation Status: {currentGeneration.status}</h3>
            {currentGeneration.status === "queued" && <p>Your music is in the queue...</p>}
            {currentGeneration.status === "in_progress" && <p>Your music is being generated...</p>}
            {currentGeneration.status === "failed" && (
              <p className="text-destructive">Generation failed: {currentGeneration.error}</p>
            )}

            {currentGeneration.audioUrl && (
              <div className="pt-4">
                <AudioPlayer audioUrl={currentGeneration.audioUrl} title={currentGeneration.title} />
              </div>
            )}
          </div>
        )}
      </CardContent>
      <CardFooter>
        <Button onClick={handleGenerate} disabled={isGenerating} className="w-full">
          {isGenerating ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Generating...
            </>
          ) : (
            <>
              <Music className="mr-2 h-4 w-4" />
              Generate Music
            </>
          )}
        </Button>
      </CardFooter>
    </Card>
  )
}
