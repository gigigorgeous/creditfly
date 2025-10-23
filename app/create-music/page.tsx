"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Slider } from "@/components/ui/slider"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Loader2, Music, ArrowLeft } from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import { AudioPlayer } from "@/components/audio-player"
import Link from "next/link"

export default function CreateMusicPage() {
  const [title, setTitle] = useState("")
  const [prompt, setPrompt] = useState("")
  const [lyrics, setLyrics] = useState("")
  const [genre, setGenre] = useState("pop")
  const [mood, setMood] = useState("happy")
  const [style, setStyle] = useState("modern")
  const [duration, setDuration] = useState(180) // 3 minutes in seconds
  const [isGenerating, setIsGenerating] = useState(false)
  const [audioUrl, setAudioUrl] = useState<string | null>(null)
  const [generatedId, setGeneratedId] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)

  const { toast } = useToast()

  const handleGenerate = async () => {
    // Clear any previous errors
    setError(null)

    // Validate inputs
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
      // Create a request payload with all necessary information
      const payload = {
        title: title || "Untitled Track",
        prompt,
        genre,
        mood,
        style,
        lyrics,
        duration,
        engine: "suno", // Use Suno by default
      }

      console.log("Sending music generation request:", payload)

      const response = await fetch("/api/music-generation", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || data.details || "Failed to generate music")
      }

      console.log("Music generation response:", data)

      setGeneratedId(data.id)

      // Start polling for status if needed
      if (data.status === "queued" || data.status === "in_progress") {
        pollGenerationStatus(data.id)
      } else if (data.status === "complete" && data.audioUrl) {
        setAudioUrl(data.audioUrl)
        setIsGenerating(false)
        toast({
          title: "Music Generated!",
          description: "Your AI-generated music is ready to play.",
        })
      }
    } catch (error) {
      console.error("Error generating music:", error)
      setError(error instanceof Error ? error.message : "Unknown error occurred")
      toast({
        title: "Generation Failed",
        description:
          error instanceof Error ? error.message : "There was an error generating your music. Please try again.",
        variant: "destructive",
      })
      setIsGenerating(false)
    }
  }

  const pollGenerationStatus = async (id: string) => {
    const checkStatus = async () => {
      try {
        const response = await fetch(`/api/music-generation/${id}`)

        if (!response.ok) {
          throw new Error("Failed to check generation status")
        }

        const data = await response.json()
        console.log("Generation status:", data)

        if (data.status === "complete") {
          setAudioUrl(data.audioUrl)
          setIsGenerating(false)
          toast({
            title: "Music Generated!",
            description: "Your AI-generated music is ready to play.",
          })
          return true
        } else if (data.status === "failed") {
          setIsGenerating(false)
          setError(data.error || "Generation failed")
          toast({
            title: "Generation Failed",
            description: data.error || "There was an error generating your music.",
            variant: "destructive",
          })
          return true
        }

        return false
      } catch (error) {
        console.error("Error checking generation status:", error)
        return false
      }
    }

    const poll = async () => {
      const finished = await checkStatus()
      if (!finished) {
        setTimeout(poll, 5000) // Check every 5 seconds
      }
    }

    poll()
  }

  const formatDuration = (seconds: number) => {
    const minutes = Math.floor(seconds / 60)
    const remainingSeconds = seconds % 60
    return `${minutes}:${remainingSeconds.toString().padStart(2, "0")}`
  }

  return (
    <div className="min-h-screen bg-black text-white">
      <div className="container mx-auto py-8 px-4">
        <div className="flex items-center mb-6">
          <Link href="/" className="mr-4">
            <Button variant="ghost" size="icon">
              <ArrowLeft className="h-5 w-5" />
            </Button>
          </Link>
          <h1 className="text-3xl font-bold">Create Music</h1>
        </div>

        <Card className="bg-gray-900 border-gray-800">
          <CardHeader>
            <CardTitle>AI Music Generator</CardTitle>
            <CardDescription className="text-gray-400">
              Create original music with AI across various genres and styles
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Tabs defaultValue="basic" className="w-full">
              <TabsList className="grid w-full grid-cols-2 bg-gray-800">
                <TabsTrigger value="basic" className="data-[state=active]:bg-purple-700">
                  Basic
                </TabsTrigger>
                <TabsTrigger value="advanced" className="data-[state=active]:bg-purple-700">
                  Advanced
                </TabsTrigger>
              </TabsList>

              <TabsContent value="basic" className="space-y-4 mt-4">
                <div className="space-y-2">
                  <label htmlFor="title" className="text-sm font-medium">
                    Track Title
                  </label>
                  <Input
                    id="title"
                    placeholder="Enter a title for your track"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    className="bg-gray-800 border-gray-700"
                  />
                </div>

                <div className="space-y-2">
                  <label htmlFor="prompt" className="text-sm font-medium">
                    Music Description
                  </label>
                  <Textarea
                    id="prompt"
                    placeholder="Describe the music you want to create..."
                    value={prompt}
                    onChange={(e) => setPrompt(e.target.value)}
                    className="min-h-[100px] bg-gray-800 border-gray-700"
                  />
                </div>

                <div className="space-y-2">
                  <label htmlFor="lyrics" className="text-sm font-medium">
                    Lyrics (Optional)
                  </label>
                  <Textarea
                    id="lyrics"
                    placeholder="Enter lyrics for your song..."
                    value={lyrics}
                    onChange={(e) => setLyrics(e.target.value)}
                    className="min-h-[100px] bg-gray-800 border-gray-700"
                  />
                </div>
              </TabsContent>

              <TabsContent value="advanced" className="space-y-4 mt-4">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="space-y-2">
                    <label htmlFor="genre" className="text-sm font-medium">
                      Genre
                    </label>
                    <Select value={genre} onValueChange={setGenre}>
                      <SelectTrigger id="genre" className="bg-gray-800 border-gray-700">
                        <SelectValue placeholder="Select genre" />
                      </SelectTrigger>
                      <SelectContent className="bg-gray-800 border-gray-700">
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
                    <label htmlFor="mood" className="text-sm font-medium">
                      Mood
                    </label>
                    <Select value={mood} onValueChange={setMood}>
                      <SelectTrigger id="mood" className="bg-gray-800 border-gray-700">
                        <SelectValue placeholder="Select mood" />
                      </SelectTrigger>
                      <SelectContent className="bg-gray-800 border-gray-700">
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
                    <label htmlFor="style" className="text-sm font-medium">
                      Style
                    </label>
                    <Select value={style} onValueChange={setStyle}>
                      <SelectTrigger id="style" className="bg-gray-800 border-gray-700">
                        <SelectValue placeholder="Select style" />
                      </SelectTrigger>
                      <SelectContent className="bg-gray-800 border-gray-700">
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
                    <label htmlFor="duration" className="text-sm font-medium">
                      Duration: {formatDuration(duration)}
                    </label>
                  </div>
                  <Slider
                    id="duration"
                    min={30}
                    max={240} // Max 4 minutes
                    step={10}
                    value={[duration]}
                    onValueChange={(value) => setDuration(value[0])}
                    className="w-full"
                  />
                </div>
              </TabsContent>
            </Tabs>

            {error && (
              <div className="mt-4 p-3 bg-red-900/30 border border-red-700 rounded-md text-red-200">
                <p className="text-sm font-medium">Error: {error}</p>
              </div>
            )}

            {audioUrl && (
              <div className="mt-6 p-4 bg-gray-800 rounded-lg">
                <h3 className="font-medium mb-2">Generated Music</h3>
                <AudioPlayer audioUrl={audioUrl} title={title} />

                <div className="mt-4 flex justify-end">
                  <Link href={`/video-studio?musicId=${generatedId}`}>
                    <Button className="bg-purple-700 hover:bg-purple-600">Create Music Video</Button>
                  </Link>
                </div>
              </div>
            )}
          </CardContent>
          <CardFooter>
            <Button
              onClick={handleGenerate}
              disabled={isGenerating}
              className="w-full bg-purple-700 hover:bg-purple-600 text-white"
            >
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
      </div>
    </div>
  )
}
