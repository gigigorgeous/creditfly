"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Slider } from "@/components/ui/slider"
import { Badge } from "@/components/ui/badge"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { Loader2, Music, Download, Share, Heart, MoreHorizontal, Sparkles, Wand2 } from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import { AudioPlayer } from "./audio-player"

interface MusicTrack {
  id: string
  title: string
  audioUrl: string
  videoUrl?: string
  thumbnailUrl?: string
  duration?: number
  status: "queued" | "streaming" | "complete" | "error"
  createdAt: string
  prompt?: string
  gptDescription?: string
  tags?: string
  modelVersion?: string
}

export function AdvancedMusicGenerator() {
  // Basic fields
  const [title, setTitle] = useState("")
  const [prompt, setPrompt] = useState("")
  const [gptDescription, setGptDescription] = useState("")
  const [lyrics, setLyrics] = useState("")
  const [tags, setTags] = useState("")
  const [negativeTags, setNegativeTags] = useState("")
  const [instrumental, setInstrumental] = useState(false)
  const [modelVersion, setModelVersion] = useState("chirp-bluejay")

  // Advanced controls
  const [styleWeight, setStyleWeight] = useState(0.5)
  const [audioWeight, setAudioWeight] = useState(0.5)
  const [weirdnessConstraint, setWeirdnessConstraint] = useState(0.5)
  const [vocalGender, setVocalGender] = useState<"f" | "m" | undefined>(undefined)

  // State
  const [isGenerating, setIsGenerating] = useState(false)
  const [currentTrack, setCurrentTrack] = useState<MusicTrack | null>(null)
  const [generatedTracks, setGeneratedTracks] = useState<MusicTrack[]>([])
  const [mode, setMode] = useState<"description" | "custom">("description")

  const { toast } = useToast()

  const handleGenerate = async () => {
    if (mode === "description" && !gptDescription.trim()) {
      toast({
        title: "Input Required",
        description: "Please enter a description for your music.",
        variant: "destructive",
      })
      return
    }

    if (mode === "custom" && !prompt.trim() && !lyrics.trim()) {
      toast({
        title: "Input Required",
        description: "Please enter either a prompt or lyrics.",
        variant: "destructive",
      })
      return
    }

    setIsGenerating(true)

    try {
      const requestBody: any = {
        title: title || "Untitled Track",
        instrumental,
        modelVersion,
        styleWeight,
        audioWeight,
        weirdnessConstraint,
        vocalGender,
      }

      if (mode === "description") {
        requestBody.gptDescription = gptDescription
      } else {
        requestBody.prompt = prompt
        requestBody.lyrics = lyrics
        requestBody.tags = tags
        requestBody.negativeTags = negativeTags
      }

      const response = await fetch("/api/music/generate", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(requestBody),
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.message || "Failed to generate music")
      }

      const data = await response.json()

      toast({
        title: "Generation Started",
        description: `Your music is being generated. Task ID: ${data.id}`,
      })

      // Start polling
      pollTrackStatus(data.id)
    } catch (error) {
      console.error("Error generating music:", error)
      toast({
        title: "Generation Failed",
        description: error instanceof Error ? error.message : "Unknown error occurred",
        variant: "destructive",
      })
      setIsGenerating(false)
    }
  }

  const pollTrackStatus = async (taskId: string) => {
    const maxAttempts = 60
    let attempts = 0

    const checkStatus = async () => {
      try {
        const response = await fetch(`/api/music/${taskId}`)
        if (response.ok) {
          const track = await response.json()

          // Handle multiple tracks
          if (track.tracks) {
            const completedTracks = track.tracks.filter((t: MusicTrack) => t.status === "complete")
            if (completedTracks.length > 0) {
              setGeneratedTracks((prev) => [...completedTracks, ...prev])
              setCurrentTrack(completedTracks[0])
              setIsGenerating(false)
              toast({
                title: "Music Generated!",
                description: `${completedTracks.length} track(s) ready to play.`,
              })
              return true
            }
          } else {
            // Single track
            if (track.status === "complete") {
              setGeneratedTracks((prev) => [track, ...prev])
              setCurrentTrack(track)
              setIsGenerating(false)
              toast({
                title: "Music Generated!",
                description: "Your track is ready to play.",
              })
              return true
            } else if (track.status === "error") {
              setIsGenerating(false)
              toast({
                title: "Generation Failed",
                description: "There was an error generating your music.",
                variant: "destructive",
              })
              return true
            }
          }
        }

        attempts++
        if (attempts >= maxAttempts) {
          setIsGenerating(false)
          toast({
            title: "Timeout",
            description: "Music generation is taking longer than expected. Please check back later.",
            variant: "destructive",
          })
          return true
        }

        return false
      } catch (error) {
        console.error("Error checking status:", error)
        return false
      }
    }

    const poll = async () => {
      const finished = await checkStatus()
      if (!finished) {
        setTimeout(poll, 5000)
      }
    }

    poll()
  }

  return (
    <div className="w-full max-w-6xl mx-auto p-6 space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Sparkles className="h-6 w-6" />
            Advanced AI Music Generator
          </CardTitle>
          <CardDescription>
            Generate professional music with Suno v5 (Crow) - Full control over every parameter
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs value={mode} onValueChange={(v) => setMode(v as "description" | "custom")} className="w-full">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="description">
                <Wand2 className="h-4 w-4 mr-2" />
                Simple Description
              </TabsTrigger>
              <TabsTrigger value="custom">
                <Music className="h-4 w-4 mr-2" />
                Custom Mode
              </TabsTrigger>
            </TabsList>

            <TabsContent value="description" className="space-y-4 mt-4">
              <div className="space-y-2">
                <Label htmlFor="gpt-description">Describe Your Music</Label>
                <Textarea
                  id="gpt-description"
                  placeholder="e.g., An upbeat pop song about summer vacation"
                  value={gptDescription}
                  onChange={(e) => setGptDescription(e.target.value)}
                  className="min-h-[100px]"
                />
              </div>
            </TabsContent>

            <TabsContent value="custom" className="space-y-4 mt-4">
              <div className="space-y-2">
                <Label htmlFor="lyrics">Lyrics</Label>
                <Textarea
                  id="lyrics"
                  placeholder="[Verse]
Your lyrics here...

[Chorus]
..."
                  value={lyrics}
                  onChange={(e) => setLyrics(e.target.value)}
                  className="min-h-[200px] font-mono"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="tags">Style Tags</Label>
                  <Input
                    id="tags"
                    placeholder="e.g., pop, energetic, female vocals"
                    value={tags}
                    onChange={(e) => setTags(e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="negative-tags">Negative Tags</Label>
                  <Input
                    id="negative-tags"
                    placeholder="e.g., slow, acoustic"
                    value={negativeTags}
                    onChange={(e) => setNegativeTags(e.target.value)}
                  />
                </div>
              </div>
            </TabsContent>
          </Tabs>

          <div className="mt-6 space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="title">Track Title</Label>
                <Input
                  id="title"
                  placeholder="Enter track title"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="model">Model Version</Label>
                <Select value={modelVersion} onValueChange={setModelVersion}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="chirp-crow">v5 (Crow) - Latest</SelectItem>
                    <SelectItem value="chirp-bluejay">v4.5+ (Bluejay)</SelectItem>
                    <SelectItem value="chirp-auk">v4.5 (Auk)</SelectItem>
                    <SelectItem value="chirp-v4">v4.0</SelectItem>
                    <SelectItem value="chirp-v3.5">v3.5</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="flex items-center space-x-2">
              <Switch id="instrumental" checked={instrumental} onCheckedChange={setInstrumental} />
              <Label htmlFor="instrumental">Instrumental (No Vocals)</Label>
            </div>

            <div className="space-y-4 border-t pt-4">
              <h3 className="font-semibold">Advanced Controls</h3>

              <div className="space-y-2">
                <Label>Style Weight: {styleWeight.toFixed(2)}</Label>
                <Slider value={[styleWeight]} onValueChange={(v) => setStyleWeight(v[0])} max={1} min={0} step={0.01} />
                <p className="text-xs text-muted-foreground">
                  Controls how strongly the style tags influence the generation
                </p>
              </div>

              <div className="space-y-2">
                <Label>Weirdness: {weirdnessConstraint.toFixed(2)}</Label>
                <Slider
                  value={[weirdnessConstraint]}
                  onValueChange={(v) => setWeirdnessConstraint(v[0])}
                  max={1}
                  min={0}
                  step={0.01}
                />
                <p className="text-xs text-muted-foreground">Higher values create more experimental results</p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="vocal-gender">Vocal Gender</Label>
                <Select value={vocalGender} onValueChange={(v) => setVocalGender(v as "f" | "m" | undefined)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Auto (Let AI decide)" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="auto">Auto (Let AI decide)</SelectItem>
                    <SelectItem value="f">Female</SelectItem>
                    <SelectItem value="m">Male</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>

          {currentTrack && (
            <div className="mt-6 p-4 bg-muted rounded-lg">
              <div className="flex items-center justify-between mb-2">
                <h3 className="font-medium">{currentTrack.title}</h3>
                <Badge variant={currentTrack.status === "complete" ? "default" : "secondary"}>
                  {currentTrack.status}
                </Badge>
              </div>

              {currentTrack.status === "complete" && currentTrack.audioUrl && (
                <AudioPlayer audioUrl={currentTrack.audioUrl} title={currentTrack.title} />
              )}

              {currentTrack.status === "streaming" && (
                <div className="flex items-center space-x-2">
                  <Loader2 className="h-4 w-4 animate-spin" />
                  <span>Generating...</span>
                </div>
              )}
            </div>
          )}
        </CardContent>
        <CardFooter>
          <Button onClick={handleGenerate} disabled={isGenerating} className="w-full" size="lg">
            {isGenerating ? (
              <>
                <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                Generating...
              </>
            ) : (
              <>
                <Sparkles className="mr-2 h-5 w-5" />
                Generate Music
              </>
            )}
          </Button>
        </CardFooter>
      </Card>

      {/* Generated Tracks Library */}
      <Card>
        <CardHeader>
          <CardTitle>Your Music Library</CardTitle>
          <CardDescription>{generatedTracks.length} track(s) generated</CardDescription>
        </CardHeader>
        <CardContent>
          {generatedTracks.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <Music className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p>No tracks generated yet. Create your first track above!</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {generatedTracks.map((track) => (
                <Card key={track.id}>
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between mb-2">
                      <h4 className="font-medium truncate">{track.title}</h4>
                      <Badge variant="outline" className="text-xs">
                        {track.modelVersion}
                      </Badge>
                    </div>

                    {track.thumbnailUrl && (
                      <img
                        src={track.thumbnailUrl || "/placeholder.svg"}
                        alt={track.title}
                        className="w-full h-32 object-cover rounded mb-2"
                      />
                    )}

                    {track.audioUrl && <AudioPlayer audioUrl={track.audioUrl} title={track.title} />}

                    <div className="flex items-center justify-between mt-2">
                      <div className="flex space-x-1">
                        <Button size="sm" variant="ghost">
                          <Heart className="h-4 w-4" />
                        </Button>
                        <Button size="sm" variant="ghost">
                          <Share className="h-4 w-4" />
                        </Button>
                        <Button size="sm" variant="ghost">
                          <Download className="h-4 w-4" />
                        </Button>
                      </div>
                      <Button size="sm" variant="ghost">
                        <MoreHorizontal className="h-4 w-4" />
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
