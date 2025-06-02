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
import { Disc3, Music2, Loader2, Music, Save } from "lucide-react"
import type { GeneratedMusic } from "./music-video-creator"
import { AudioPlayer } from "./audio-player"
import { useToast } from "@/hooks/use-toast"
import { useRouter } from "next/navigation"
import { useAuth } from "@/context/auth-context"

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

interface MusicGeneratorProps {
  onMusicGenerated?: (music: GeneratedMusic) => void
}

export function MusicGenerator({ onMusicGenerated }: MusicGeneratorProps) {
  const [title, setTitle] = useState("")
  const [lyrics, setLyrics] = useState("")
  const [genre, setGenre] = useState("Pop")
  const [mood, setMood] = useState("Happy")
  const [style, setStyle] = useState("Vocal")
  const [voiceType, setVoiceType] = useState("")
  const [duration, setDuration] = useState([120])
  const [isGenerating, setIsGenerating] = useState(false)
  const [isSaving, setIsSaving] = useState(false)
  const [activeTab, setActiveTab] = useState("normal")
  const [previewMusic, setPreviewMusic] = useState<GeneratedMusic | null>(null)
  const { toast } = useToast()
  const router = useRouter()
  const { user } = useAuth()

  const handleGenerate = async () => {
    try {
      setIsGenerating(true)
      setPreviewMusic(null)

      if (!lyrics.trim() && !title.trim()) {
        toast({
          title: "Content Required",
          description: "Please enter either lyrics/description or a title for your music.",
          variant: "destructive",
        })
        return
      }

      const payload = {
        title: title.trim() || "Untitled Track",
        lyrics: lyrics.trim(),
        genre,
        mood,
        style,
        voiceType: activeTab === "normal" ? voiceType : undefined,
        duration: duration[0],
        userId: user?.id,
      }

      console.log("Generating music with payload:", payload)

      const response = await fetch("/api/ai-music-generation", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
        },
        body: JSON.stringify(payload),
      })

      if (!response.ok) {
        let errorMessage = `HTTP ${response.status}: ${response.statusText}`
        try {
          const errorData = await response.json()
          errorMessage = errorData.error || errorData.message || errorMessage
        } catch (parseError) {
          const errorText = await response.text()
          errorMessage = `Server returned ${response.status}. Response: ${errorText.substring(0, 100)}...`
        }
        throw new Error(errorMessage)
      }

      let data
      try {
        data = await response.json()
      } catch (parseError) {
        const responseText = await response.text()
        console.error("Response text:", responseText)
        throw new Error("Server returned invalid JSON response")
      }

      if (!data || !data.id) {
        throw new Error("Invalid response from music generation API")
      }

      // Create the music object with blob storage integration
      const musicData: GeneratedMusic = {
        id: data.id,
        title: data.title || title || "Untitled Track",
        audioUrl: data.audioUrl || "https://www.soundjay.com/misc/sounds/bell-ringing-05.wav",
        genre: data.genre || genre,
        mood: data.mood || mood,
        duration: data.duration || duration[0],
        createdAt: new Date(data.createdAt || Date.now()),
        musicDescription: data.musicDescription || {
          musicDescription: `A ${genre} song with a ${mood} mood in ${style} style.`,
          structure: ["intro", "verse", "chorus", "outro"],
          tempo: 120,
          key: "C major",
          instrumentation: ["piano", "guitar", "drums", "bass"],
        },
        aiGenerated: data.aiGenerated || true,
        blobUrl: data.blobUrl, // Store blob URL for permanent storage
      }

      setPreviewMusic(musicData)

      if (onMusicGenerated) {
        onMusicGenerated(musicData)
      }

      toast({
        title: "Music Generated Successfully!",
        description: `Your ${genre} track "${musicData.title}" is ready to play.`,
      })
    } catch (error) {
      console.error("Error generating music:", error)
      let errorMessage = "There was an error generating your music. Please try again."

      if (error instanceof Error) {
        if (error.message.includes("API key")) {
          errorMessage = "Music generation service is temporarily unavailable. Please try again later."
        } else if (error.message.includes("rate limit")) {
          errorMessage = "Too many requests. Please wait a moment and try again."
        } else {
          errorMessage = error.message
        }
      }

      toast({
        title: "Generation Failed",
        description: errorMessage,
        variant: "destructive",
      })
    } finally {
      setIsGenerating(false)
    }
  }

  const handleSaveMusic = async () => {
    if (!previewMusic) return

    try {
      setIsSaving(true)

      // Save music to blob storage and database
      const response = await fetch("/api/music/save", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          music: previewMusic,
          userId: user?.id,
        }),
      })

      if (!response.ok) {
        throw new Error("Failed to save music")
      }

      const result = await response.json()

      // Update the music object with the saved blob URL
      const savedMusic = {
        ...previewMusic,
        blobUrl: result.blobUrl,
        id: result.id,
      }

      if (onMusicGenerated) {
        onMusicGenerated(savedMusic)
      }

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
        description: "Your track has been saved to your library and is ready for video creation.",
      })

      // Navigate to video creation
      router.push(`/studio?tab=video&musicId=${savedMusic.id}`)
    } catch (error) {
      console.error("Error saving music:", error)
      toast({
        title: "Save Failed",
        description: "Failed to save your music. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsSaving(false)
    }
  }

  const formatDuration = (seconds: number) => {
    const minutes = Math.floor(seconds / 60)
    const remainingSeconds = seconds % 60
    return `${minutes}:${remainingSeconds.toString().padStart(2, "0")}`
  }

  const addStructureTag = (tag: string) => {
    setLyrics((prev) => prev + `\n\n[${tag}]\n`)
  }

  return (
    <div className="container py-6 space-y-6">
      <div className="flex flex-col space-y-2">
        <h2 className="text-2xl font-bold tracking-tight">AI Music Creator</h2>
        <p className="text-muted-foreground">Generate original music with AI across various genres and styles</p>
      </div>

      {previewMusic && (
        <Card className="border-primary/20 bg-primary/5">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Music className="h-5 w-5" />
              Preview Your Generated Music
            </CardTitle>
            <CardDescription>Listen to your track before saving it to your library</CardDescription>
          </CardHeader>
          <CardContent>
            <AudioPlayer audioUrl={previewMusic.audioUrl} title={previewMusic.title} />
            <div className="flex gap-2 mt-4 flex-wrap">
              <Badge variant="outline">{previewMusic.genre}</Badge>
              <Badge variant="outline">{previewMusic.mood}</Badge>
              <Badge variant="outline">{formatDuration(previewMusic.duration)}</Badge>
              {previewMusic.aiGenerated && <Badge variant="secondary">AI Generated</Badge>}
            </div>
            {previewMusic.musicDescription && (
              <div className="mt-4 p-4 bg-muted rounded-lg">
                <h4 className="font-semibold mb-2">Music Details</h4>
                <p className="text-sm text-muted-foreground mb-2">{previewMusic.musicDescription.musicDescription}</p>
                <div className="grid grid-cols-2 gap-2 text-sm">
                  <div>
                    <strong>Tempo:</strong> {previewMusic.musicDescription.tempo} BPM
                  </div>
                  <div>
                    <strong>Key:</strong> {previewMusic.musicDescription.key}
                  </div>
                </div>
              </div>
            )}
          </CardContent>
          <CardFooter className="flex justify-end gap-2">
            <Button variant="outline" onClick={() => setPreviewMusic(null)}>
              Discard
            </Button>
            <Button onClick={handleSaveMusic} disabled={isSaving}>
              {isSaving ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Saving...
                </>
              ) : (
                <>
                  <Save className="h-4 w-4 mr-2" />
                  Save & Create Video
                </>
              )}
            </Button>
          </CardFooter>
        </Card>
      )}

      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="normal" className="flex items-center gap-2">
            <Music2 className="h-4 w-4" />
            <span>Vocal</span>
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
                placeholder="Enter your lyrics or describe a song. Use tags like [Verse], [Chorus], [Bridge], etc. for structure.&#10;&#10;Example:&#10;[Verse]&#10;Walking down the street on a sunny day&#10;Everything feels like it's going my way&#10;&#10;[Chorus]&#10;This is my moment, this is my time&#10;Everything's perfect, everything's fine"
                className="min-h-[200px]"
                value={lyrics}
                onChange={(e) => setLyrics(e.target.value)}
              />
              <div className="mt-4 flex flex-wrap gap-2">
                {["Verse", "Chorus", "Bridge", "Intro", "Outro", "Pre-Chorus"].map((tag) => (
                  <Badge
                    key={tag}
                    variant="outline"
                    className="cursor-pointer hover:bg-primary hover:text-primary-foreground"
                    onClick={() => addStructureTag(tag)}
                  >
                    [{tag}]
                  </Badge>
                ))}
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
                  <SelectValue placeholder="Select voice type (optional)" />
                </SelectTrigger>
                <SelectContent>
                  {VOICE_TYPES.map((voice) => (
                    <SelectItem key={voice} value={voice}>
                      {voice}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
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
                placeholder="Describe the instrumental music you want (e.g., 'A cinematic orchestral piece with rising tension and epic climax', 'Relaxing ambient soundscape with gentle piano and nature sounds', 'Upbeat electronic dance track with heavy bass')"
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
                  placeholder="Enter a title for your track (optional)"
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
              <Button
                className="w-full"
                onClick={handleGenerate}
                disabled={isGenerating || (!lyrics.trim() && !title.trim())}
                size="lg"
              >
                {isGenerating ? (
                  <div className="flex items-center gap-2">
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Generating Music...
                  </div>
                ) : (
                  <div className="flex items-center gap-2">
                    <Music className="h-4 w-4" />
                    Generate Music
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
