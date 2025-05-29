"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Slider } from "@/components/ui/slider"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import { Disc3, Music2, Wand2 } from "lucide-react"
import type { GeneratedMusic } from "./music-video-creator"
import { AudioPlayer } from "./audio-player"
import { useToast } from "@/hooks/use-toast"
import { AIMusicDetails } from "./ai-music-details"
import { v4 as uuidv4 } from "uuid"

const GENRES = [
  "Pop",
  "Rock",
  "Classical",
  "Electronic",
  "Jazz",
  "Hip-Hop",
  "Ambient",
  "World",
  "Country",
  "R&B",
  "Trap",
  "Dubstep",
  "Techno",
  "House",
  "Drum & Bass",
  "Reggae",
  "Funk",
  "Soul",
  "Blues",
  "Metal",
  "Punk",
  "Folk",
  "Indie",
  "Latin",
  "Afrobeat",
  "K-Pop",
  "J-Pop",
  "Disco",
  "Synthwave",
  "Lo-Fi",
]

const MOODS = [
  "Happy",
  "Sad",
  "Energetic",
  "Calm",
  "Romantic",
  "Mysterious",
  "Epic",
  "Playful",
  "Melancholic",
  "Intense",
]

const STYLES = [
  "Instrumental",
  "Vocal",
  "Cinematic",
  "Lo-Fi",
  "Experimental",
  "Acoustic",
  "Orchestral",
  "Minimalist",
  "Futuristic",
  "Retro",
]

const VOICE_TYPES = [
  "Male Deep",
  "Male Tenor",
  "Female Alto",
  "Female Soprano",
  "Robotic",
  "Whisper",
  "Choir",
  "Child",
  "Elderly",
  "Rap",
]

// Create a fallback music object
function createFallbackMusic(
  title: string,
  genre: string,
  mood: string,
  style: string,
  duration: number,
): GeneratedMusic {
  return {
    id: uuidv4(),
    title: title || "Untitled Track",
    audioUrl: "https://samplelib.com/lib/preview/mp3/sample-15s.mp3",
    genre: genre || "Pop",
    mood: mood || "Happy",
    duration: duration || 120,
    createdAt: new Date(),
    musicDescription: {
      musicDescription: `A ${genre || "Pop"} song with a ${mood || "Happy"} mood in ${style || "Vocal"} style.`,
      structure: ["intro", "verse", "chorus", "verse", "chorus", "bridge", "chorus", "outro"],
      tempo: 120,
      key: "C major",
      instrumentation: ["piano", "guitar", "drums", "bass", "synth"],
      theme: "Summer vibes and positive energy",
      melody: "Catchy and uplifting melody with memorable hooks",
      harmony: "Rich chord progressions with occasional tension and resolution",
      rhythm: "Steady beat with syncopated elements to add interest",
    },
    aiGenerated: true,
  }
}

export function MusicGenerator({
  onMusicGenerated,
}: {
  onMusicGenerated: (music: GeneratedMusic) => void
}) {
  const [title, setTitle] = useState("")
  const [lyrics, setLyrics] = useState("")
  const [genre, setGenre] = useState("Pop")
  const [mood, setMood] = useState("Happy")
  const [style, setStyle] = useState("Vocal")
  const [voiceType, setVoiceType] = useState("")
  const [duration, setDuration] = useState([120]) // in seconds
  const [isGenerating, setIsGenerating] = useState(false)
  const [activeTab, setActiveTab] = useState("normal")
  const [previewMusic, setPreviewMusic] = useState<GeneratedMusic | null>(null)
  const { toast } = useToast()

  const handleGenerate = async () => {
    try {
      setIsGenerating(true)
      setPreviewMusic(null)

      // Create the request payload
      const payload = {
        title,
        lyrics,
        genre,
        mood,
        style,
        voiceType,
        duration: duration[0],
      }

      console.log("Generating music with payload:", payload)

      // Determine which API endpoint to use
      const apiEndpoint = "/api/generate-music"
      console.log("Using API endpoint:", apiEndpoint)

      // Call our API route to generate music
      const response = await fetch(apiEndpoint, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      })

      console.log("API response status:", response.status)

      // Check if response is ok before trying to parse JSON
      if (!response.ok) {
        // Try to get error message from response
        let errorMessage = "Failed to generate music"
        try {
          const errorText = await response.text()
          console.log("Error response text:", errorText)

          // Try to parse as JSON first
          try {
            const errorData = JSON.parse(errorText)
            errorMessage = errorData.error || errorData.message || errorMessage
          } catch {
            // If not JSON, use the text directly (but truncate if too long)
            errorMessage = errorText.length > 100 ? errorText.substring(0, 100) + "..." : errorText
          }
        } catch (parseError) {
          console.error("Error reading error response:", parseError)
        }

        throw new Error(errorMessage)
      }

      // Parse successful response
      let data
      try {
        data = await response.json()
        console.log("API response data:", data)
      } catch (parseError) {
        console.error("Error parsing successful API response:", parseError)
        throw new Error("Failed to parse API response")
      }

      // Validate the response data
      if (!data || !data.id || !data.audioUrl) {
        console.error("Invalid API response data:", data)
        throw new Error("Invalid response from music generation API")
      }

      // Create a properly formatted music object
      const musicData: GeneratedMusic = {
        id: data.id,
        title: data.title || title || "Untitled Track",
        audioUrl: data.audioUrl,
        genre: data.genre || genre || "Pop",
        mood: data.mood || mood || "Happy",
        duration: data.duration || duration[0] || 120,
        createdAt: new Date(data.createdAt || Date.now()),
        musicDescription: data.musicDescription || {
          musicDescription: `A ${genre} song with a ${mood} mood.`,
          structure: ["intro", "verse", "chorus", "outro"],
          tempo: 120,
          key: "C major",
          instrumentation: ["piano", "guitar", "drums", "bass"],
        },
        aiGenerated: data.aiGenerated || false,
      }

      console.log("Formatted music data:", musicData)

      // Set preview music
      setPreviewMusic(musicData)

      toast({
        title: "Music Generated!",
        description: `Your ${genre} track "${musicData.title}" is ready to play.`,
      })
    } catch (error) {
      console.error("Error generating music:", error)

      // Log detailed error information
      if (error instanceof Error) {
        console.error("Error name:", error.name)
        console.error("Error message:", error.message)
        console.error("Error stack:", error.stack)
      } else {
        console.error("Unknown error type:", typeof error)
      }

      let errorMessage = "There was an error generating your music. Please try again."

      // Check if it's an API key error
      if (error instanceof Error && error.message.includes("API key")) {
        errorMessage = "OpenAI API key is missing. The app is running in demo mode with simulated responses."
      }

      toast({
        title: "Generation Notice",
        description: errorMessage,
        variant: error instanceof Error && error.message.includes("API key") ? "default" : "destructive",
      })

      // Create a fallback music object so the user can still proceed
      const fallbackMusic = createFallbackMusic(title, genre, mood, style, duration[0])

      // Set the fallback music as preview
      setPreviewMusic(fallbackMusic)
    } finally {
      setIsGenerating(false)
    }
  }

  const handleSaveMusic = () => {
    if (previewMusic) {
      onMusicGenerated(previewMusic)

      // Reset form
      setTitle("")
      setLyrics("")
      setGenre("Pop")
      setMood("Happy")
      setStyle("Vocal")
      setVoiceType("")
      setDuration([120])
      setPreviewMusic(null)

      toast({
        title: "Music Saved!",
        description: "Your track has been added to your collection.",
      })
    }
  }

  const formatDuration = (seconds: number) => {
    const minutes = Math.floor(seconds / 60)
    const remainingSeconds = seconds % 60
    return `${minutes}:${remainingSeconds.toString().padStart(2, "0")}`
  }

  return (
    <div className="container py-6 space-y-6">
      <div className="flex flex-col space-y-2">
        <h2 className="text-2xl font-bold tracking-tight">Music Creator</h2>
        <p className="text-muted-foreground">Generate original music with AI across various genres and styles</p>
      </div>

      {previewMusic &&
        (previewMusic.aiGenerated ? (
          <AIMusicDetails music={previewMusic} onSave={handleSaveMusic} onDiscard={() => setPreviewMusic(null)} />
        ) : (
          <Card className="border-primary/20 bg-primary/5">
            <CardHeader>
              <CardTitle>Preview Your Generated Music</CardTitle>
              <CardDescription>Listen to your track before saving it</CardDescription>
            </CardHeader>
            <CardContent>
              <AudioPlayer audioUrl={previewMusic.audioUrl} title={previewMusic.title} />
              <div className="flex gap-2 mt-4">
                <Badge variant="outline">{previewMusic.genre}</Badge>
                <Badge variant="outline">{previewMusic.mood}</Badge>
                <Badge variant="outline">{formatDuration(previewMusic.duration)}</Badge>
              </div>
            </CardContent>
            <CardFooter className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => setPreviewMusic(null)}>
                Discard
              </Button>
              <Button onClick={handleSaveMusic}>Save to Collection</Button>
            </CardFooter>
          </Card>
        ))}

      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="normal" className="flex items-center gap-2">
            <Music2 className="h-4 w-4" />
            <span>Normal</span>
          </TabsTrigger>
          <TabsTrigger value="instrumental" className="flex items-center gap-2">
            <Disc3 className="h-4 w-4" />
            <span>Instrumental</span>
          </TabsTrigger>
        </TabsList>

        <TabsContent value="normal" className="space-y-6 mt-6">
          <Card>
            <CardHeader>
              <CardTitle>Lyrics & Structure</CardTitle>
              <CardDescription>Enter your own lyrics or describe what you want the song to be about</CardDescription>
            </CardHeader>
            <CardContent>
              <Textarea
                placeholder="Enter your lyrics or describe a song. Use tags like [Verse], [Chorus], [Bridge], etc. for structure."
                className="min-h-[200px]"
                value={lyrics}
                onChange={(e) => setLyrics(e.target.value)}
              />
              <div className="mt-4 flex flex-wrap gap-2">
                <Badge variant="outline" onClick={() => setLyrics(lyrics + "\n\n[Verse]\n")}>
                  [Verse]
                </Badge>
                <Badge variant="outline" onClick={() => setLyrics(lyrics + "\n\n[Chorus]\n")}>
                  [Chorus]
                </Badge>
                <Badge variant="outline" onClick={() => setLyrics(lyrics + "\n\n[Bridge]\n")}>
                  [Bridge]
                </Badge>
                <Badge variant="outline" onClick={() => setLyrics(lyrics + "\n\n[Intro]\n")}>
                  [Intro]
                </Badge>
                <Badge variant="outline" onClick={() => setLyrics(lyrics + "\n\n[Outro]\n")}>
                  [Outro]
                </Badge>
                <Badge variant="outline" onClick={() => setLyrics(lyrics + "\n\n[Pre-Chorus]\n")}>
                  [Pre-Chorus]
                </Badge>
                <Badge variant="outline" onClick={() => setLyrics(lyrics + "\n\n[Hook]\n")}>
                  [Hook]
                </Badge>
                <Badge variant="outline" onClick={() => setLyrics(lyrics + "\n\n[Break]\n")}>
                  [Break]
                </Badge>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Voice Settings</CardTitle>
              <CardDescription>Choose the type of voice for your song</CardDescription>
            </CardHeader>
            <CardContent>
              <Select value={voiceType} onValueChange={setVoiceType}>
                <SelectTrigger>
                  <SelectValue placeholder="Select voice type" />
                </SelectTrigger>
                <SelectContent>
                  {VOICE_TYPES.map((voice) => (
                    <SelectItem key={voice} value={voice}>
                      {voice}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <p className="text-sm text-muted-foreground mt-2">
                Voice type will adapt to your selected genre and style
              </p>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="instrumental" className="space-y-6 mt-6">
          <Card>
            <CardHeader>
              <CardTitle>Instrumental Description</CardTitle>
              <CardDescription>Describe the instrumental music you want to create</CardDescription>
            </CardHeader>
            <CardContent>
              <Textarea
                placeholder="Describe the instrumental music you want (e.g., 'A cinematic orchestral piece with rising tension and epic climax')"
                className="min-h-[200px]"
                value={lyrics}
                onChange={(e) => setLyrics(e.target.value)}
              />
            </CardContent>
          </Card>
        </TabsContent>

        <div className="space-y-6 mt-6">
          <Card>
            <CardHeader>
              <CardTitle>Music Style</CardTitle>
              <CardDescription>Configure the style, genre, and mood of your music</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="title">Track Title</Label>
                <Input
                  id="title"
                  placeholder="Enter a title for your track"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="genre">Genre</Label>
                  <Select value={genre} onValueChange={setGenre}>
                    <SelectTrigger id="genre">
                      <SelectValue placeholder="Select genre" />
                    </SelectTrigger>
                    <SelectContent>
                      {GENRES.map((g) => (
                        <SelectItem key={g} value={g}>
                          {g}
                        </SelectItem>
                      ))}
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
                      {MOODS.map((m) => (
                        <SelectItem key={m} value={m}>
                          {m}
                        </SelectItem>
                      ))}
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
                      {STYLES.map((s) => (
                        <SelectItem key={s} value={s}>
                          {s}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="space-y-2">
                <div className="flex justify-between">
                  <Label htmlFor="duration">Duration: {formatDuration(duration[0])}</Label>
                  <span className="text-sm text-muted-foreground">Max: 4:00</span>
                </div>
                <Slider id="duration" min={30} max={240} step={10} value={duration} onValueChange={setDuration} />
              </div>
            </CardContent>
            <CardFooter>
              <Button className="w-full" onClick={handleGenerate} disabled={isGenerating}>
                {isGenerating ? (
                  <div className="flex items-center gap-2">
                    <div className="animate-spin h-4 w-4 border-2 border-current border-t-transparent rounded-full"></div>
                    <span>Generating...</span>
                  </div>
                ) : (
                  <div className="flex items-center gap-2">
                    <Wand2 className="h-4 w-4" />
                    <span>Generate Music</span>
                  </div>
                )}
              </Button>
            </CardFooter>
          </Card>
        </div>
      </Tabs>
    </div>
  )
}
