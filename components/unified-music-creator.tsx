"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Slider } from "@/components/ui/slider"
import { Switch } from "@/components/ui/switch"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { Textarea } from "@/components/ui/textarea"
import { Input } from "@/components/ui/input"
import { Music, Video, Sparkles, Download, Share2, Settings, Wand2, Volume2, HelpCircle } from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import { AudioPlayer } from "./audio-player"
import { AudioVisualizer } from "./audio-visualizer"
import { MusicTutorial } from "./music-tutorial"

// Expanded genre list
const GENRES = [
  "Pop",
  "Rock",
  "Hip Hop",
  "Electronic",
  "Dance",
  "EDM",
  "House",
  "Techno",
  "Trance",
  "Dubstep",
  "Drum and Bass",
  "Jazz",
  "Blues",
  "Classical",
  "Folk",
  "Country",
  "Ambient",
  "Chillout",
  "Lofi",
  "R&B",
  "Soul",
  "Funk",
  "Disco",
  "Reggae",
  "Ska",
  "Punk",
  "Metal",
  "Hard Rock",
  "Alternative",
  "Indie",
  "Synthwave",
  "Vaporwave",
  "Trap",
  "Future Bass",
  "Afrobeat",
  "Latin",
  "Salsa",
  "Bossa Nova",
  "K-Pop",
  "J-Pop",
  "Anime",
  "Orchestral",
  "Cinematic",
  "Soundtrack",
  "World Music",
  "Ethnic",
  "Celtic",
  "Flamenco",
]

const MOODS = [
  "Happy",
  "Sad",
  "Energetic",
  "Calm",
  "Relaxed",
  "Aggressive",
  "Dark",
  "Uplifting",
  "Melancholic",
  "Romantic",
  "Mysterious",
  "Epic",
  "Dreamy",
  "Nostalgic",
  "Futuristic",
  "Groovy",
  "Atmospheric",
  "Intense",
  "Peaceful",
  "Dramatic",
]

const INSTRUMENTS = [
  "Piano",
  "Guitar",
  "Bass",
  "Drums",
  "Synth",
  "Strings",
  "Brass",
  "Woodwinds",
  "Vocals",
  "Electronic",
  "Orchestral",
  "Acoustic",
  "Electric",
]

const VIDEO_STYLES = [
  "Cinematic",
  "Anime",
  "3D Animation",
  "Retro",
  "Abstract",
  "Realistic",
  "Cyberpunk",
  "Vaporwave",
  "Minimalist",
  "Psychedelic",
  "Neon",
  "Vintage",
  "Modern",
  "Fantasy",
  "Sci-Fi",
]

interface Track {
  id: string
  title: string
  audioUrl: string
  videoUrl?: string
  thumbnailUrl?: string
  genre: string
  mood: string
  duration?: number
  createdAt: string
  status: "complete" | "generating"
}

export function UnifiedMusicCreator() {
  const [activeMode, setActiveMode] = useState<"music" | "video">("music")
  const [showVideoPrompt, setShowVideoPrompt] = useState(false)
  const [showTutorial, setShowTutorial] = useState(false)

  // Music generation state
  const [title, setTitle] = useState("")
  const [prompt, setPrompt] = useState("")
  const [lyrics, setLyrics] = useState("")
  const [selectedGenres, setSelectedGenres] = useState<string[]>(["Pop"])
  const [selectedMood, setSelectedMood] = useState("Happy")
  const [selectedInstruments, setSelectedInstruments] = useState<string[]>([])
  const [tempo, setTempo] = useState(120)
  const [duration, setDuration] = useState(180)
  const [useInstrumental, setUseInstrumental] = useState(false)

  // Video generation state
  const [videoPrompt, setVideoPrompt] = useState("")
  const [videoStyle, setVideoStyle] = useState("Cinematic")
  const [characterType, setCharacterType] = useState("realistic")

  // Generation state
  const [isGenerating, setIsGenerating] = useState(false)
  const [generationProgress, setGenerationProgress] = useState(0)
  const [tracks, setTracks] = useState<Track[]>([])
  const [selectedTrack, setSelectedTrack] = useState<Track | null>(null)

  // Audio controls
  const [volume, setVolume] = useState(75)
  const [showVisualizer, setShowVisualizer] = useState(true)

  const { toast } = useToast()

  useEffect(() => {
    // Load tracks on mount
    loadTracks()
  }, [])

  const loadTracks = async () => {
    try {
      const response = await fetch("/api/music/list")
      if (response.ok) {
        const data = await response.json()
        if (data.tracks) {
          setTracks(data.tracks)
          if (data.tracks.length > 0) {
            setSelectedTrack(data.tracks[0])
          }
        }
      }
    } catch (error) {
      console.error("Error loading tracks:", error)
    }
  }

  const handleGenerateMusic = async () => {
    if (!prompt.trim() && !lyrics.trim()) {
      toast({
        title: "Input Required",
        description: "Please provide either a prompt or lyrics for your music.",
        variant: "destructive",
      })
      return
    }

    setIsGenerating(true)
    setGenerationProgress(0)

    try {
      const response = await fetch("/api/music/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: title || "Untitled Track",
          prompt,
          lyrics,
          genres: selectedGenres,
          mood: selectedMood,
          instruments: selectedInstruments,
          tempo,
          duration,
          instrumental: useInstrumental,
        }),
      })

      if (!response.ok) {
        throw new Error("Failed to generate music")
      }

      const data = await response.json()

      // Simulate progress
      const progressInterval = setInterval(() => {
        setGenerationProgress((prev) => {
          if (prev >= 90) {
            clearInterval(progressInterval)
            return prev
          }
          return prev + 10
        })
      }, 3000)

      // Poll for completion
      const checkStatus = async () => {
        const statusResponse = await fetch(`/api/music/${data.id}`)
        if (statusResponse.ok) {
          const statusData = await statusResponse.json()

          if (statusData.status === "complete") {
            clearInterval(progressInterval)
            setGenerationProgress(100)

            const newTrack: Track = {
              id: data.id,
              title: title || "Untitled Track",
              audioUrl: statusData.audioUrl,
              genre: selectedGenres[0],
              mood: selectedMood,
              duration: duration,
              createdAt: new Date().toISOString(),
              status: "complete",
            }

            setTracks((prev) => [newTrack, ...prev])
            setSelectedTrack(newTrack)
            setIsGenerating(false)

            toast({
              title: "Music Generated!",
              description: "Your track is ready to play.",
            })

            // Prompt to create video
            if (!showVideoPrompt) {
              toast({
                title: "Create a Music Video?",
                description: "You can now generate a video for this track.",
                action: (
                  <Button onClick={() => setShowVideoPrompt(true)} size="sm">
                    Create Video
                  </Button>
                ),
              })
            }
          } else if (statusData.status === "failed") {
            throw new Error(statusData.error || "Generation failed")
          } else {
            setTimeout(checkStatus, 5000)
          }
        }
      }

      setTimeout(checkStatus, 5000)
    } catch (error) {
      console.error("Error generating music:", error)
      setIsGenerating(false)
      setGenerationProgress(0)
      toast({
        title: "Generation Failed",
        description: error instanceof Error ? error.message : "Failed to generate music",
        variant: "destructive",
      })
    }
  }

  const handleGenerateVideo = async () => {
    if (!selectedTrack) {
      toast({
        title: "No Track Selected",
        description: "Please select a music track first.",
        variant: "destructive",
      })
      return
    }

    if (!videoPrompt.trim()) {
      toast({
        title: "Prompt Required",
        description: "Please describe your music video.",
        variant: "destructive",
      })
      return
    }

    setIsGenerating(true)

    try {
      const response = await fetch("/api/video/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          trackId: selectedTrack.id,
          prompt: videoPrompt,
          style: videoStyle,
          characterType,
        }),
      })

      if (!response.ok) {
        throw new Error("Failed to generate video")
      }

      const data = await response.json()

      toast({
        title: "Video Generation Started",
        description: "Your music video is being created. This may take several minutes.",
      })

      // Poll for video completion (similar to music)
      // Implementation similar to music generation polling
    } catch (error) {
      console.error("Error generating video:", error)
      toast({
        title: "Video Generation Failed",
        description: error instanceof Error ? error.message : "Failed to generate video",
        variant: "destructive",
      })
    } finally {
      setIsGenerating(false)
    }
  }

  const toggleGenre = (genre: string) => {
    setSelectedGenres((prev) => (prev.includes(genre) ? prev.filter((g) => g !== genre) : [...prev, genre]))
  }

  const toggleInstrument = (instrument: string) => {
    setSelectedInstruments((prev) =>
      prev.includes(instrument) ? prev.filter((i) => i !== instrument) : [...prev, instrument],
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-950 via-black to-blue-950">
      {/* Tutorial Modal */}
      {showTutorial && <MusicTutorial onClose={() => setShowTutorial(false)} />}

      {/* Header */}
      <div className="border-b border-purple-500/20 bg-black/30 backdrop-blur-md">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2">
                <Music className="h-8 w-8 text-purple-400" />
                <h1 className="text-2xl font-bold text-white">AI Music Studio</h1>
              </div>

              <Badge variant="outline" className="border-purple-500 text-purple-300">
                {activeMode === "music" ? "Music Mode" : "Video Mode"}
              </Badge>
            </div>

            <div className="flex items-center space-x-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowTutorial(true)}
                className="border-purple-500 text-purple-300 hover:bg-purple-500/20"
              >
                <HelpCircle className="h-4 w-4 mr-2" />
                Tutorial
              </Button>

              <Button
                variant="outline"
                size="sm"
                className="border-purple-500 text-purple-300 hover:bg-purple-500/20 bg-transparent"
              >
                <Settings className="h-4 w-4 mr-2" />
                Settings
              </Button>
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Panel - Controls */}
          <div className="lg:col-span-1 space-y-6">
            <Card className="border-purple-500/30 bg-black/40 backdrop-blur-md">
              <CardHeader>
                <CardTitle className="text-white flex items-center justify-between">
                  <span>Create Music</span>
                  <Wand2 className="h-5 w-5 text-purple-400" />
                </CardTitle>
                <CardDescription className="text-gray-400">Generate original music with AI</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label className="text-gray-300">Track Title</Label>
                  <Input
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    placeholder="My Awesome Track"
                    className="bg-purple-950/50 border-purple-500/30 text-white"
                  />
                </div>

                <div>
                  <Label className="text-gray-300">Description / Prompt</Label>
                  <Textarea
                    value={prompt}
                    onChange={(e) => setPrompt(e.target.value)}
                    placeholder="Describe the music you want to create..."
                    className="bg-purple-950/50 border-purple-500/30 text-white min-h-[100px]"
                  />
                </div>

                <div>
                  <Label className="text-gray-300">Genres (Select multiple)</Label>
                  <div className="flex flex-wrap gap-2 mt-2">
                    {GENRES.slice(0, 12).map((genre) => (
                      <Badge
                        key={genre}
                        variant={selectedGenres.includes(genre) ? "default" : "outline"}
                        className={`cursor-pointer transition-all ${
                          selectedGenres.includes(genre)
                            ? "bg-purple-600 hover:bg-purple-700"
                            : "border-purple-500/50 text-gray-300 hover:bg-purple-500/20"
                        }`}
                        onClick={() => toggleGenre(genre)}
                      >
                        {genre}
                      </Badge>
                    ))}
                  </div>
                  <Select value={selectedGenres[0]} onValueChange={(value) => toggleGenre(value)}>
                    <SelectTrigger className="mt-2 bg-purple-950/50 border-purple-500/30 text-white">
                      <SelectValue placeholder="More genres..." />
                    </SelectTrigger>
                    <SelectContent className="bg-purple-950 border-purple-500/30">
                      {GENRES.map((genre) => (
                        <SelectItem key={genre} value={genre} className="text-white">
                          {genre}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label className="text-gray-300">Mood</Label>
                  <Select value={selectedMood} onValueChange={setSelectedMood}>
                    <SelectTrigger className="bg-purple-950/50 border-purple-500/30 text-white">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent className="bg-purple-950 border-purple-500/30">
                      {MOODS.map((mood) => (
                        <SelectItem key={mood} value={mood} className="text-white">
                          {mood}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label className="text-gray-300">Instruments</Label>
                  <div className="flex flex-wrap gap-2 mt-2">
                    {INSTRUMENTS.slice(0, 8).map((instrument) => (
                      <Badge
                        key={instrument}
                        variant={selectedInstruments.includes(instrument) ? "default" : "outline"}
                        className={`cursor-pointer transition-all ${
                          selectedInstruments.includes(instrument)
                            ? "bg-purple-600 hover:bg-purple-700"
                            : "border-purple-500/50 text-gray-300 hover:bg-purple-500/20"
                        }`}
                        onClick={() => toggleInstrument(instrument)}
                      >
                        {instrument}
                      </Badge>
                    ))}
                  </div>
                </div>

                <div>
                  <div className="flex items-center justify-between mb-2">
                    <Label className="text-gray-300">Tempo (BPM): {tempo}</Label>
                  </div>
                  <Slider
                    value={[tempo]}
                    onValueChange={(value) => setTempo(value[0])}
                    min={60}
                    max={180}
                    step={1}
                    className="w-full"
                  />
                </div>

                <div>
                  <div className="flex items-center justify-between mb-2">
                    <Label className="text-gray-300">
                      Duration: {Math.floor(duration / 60)}:{(duration % 60).toString().padStart(2, "0")}
                    </Label>
                  </div>
                  <Slider
                    value={[duration]}
                    onValueChange={(value) => setDuration(value[0])}
                    min={30}
                    max={300}
                    step={15}
                    className="w-full"
                  />
                </div>

                <div className="flex items-center space-x-2">
                  <Switch id="instrumental" checked={useInstrumental} onCheckedChange={setUseInstrumental} />
                  <Label htmlFor="instrumental" className="text-gray-300">
                    Instrumental (No vocals)
                  </Label>
                </div>

                <div>
                  <Label className="text-gray-300">Lyrics (Optional)</Label>
                  <Textarea
                    value={lyrics}
                    onChange={(e) => setLyrics(e.target.value)}
                    placeholder="Enter custom lyrics..."
                    className="bg-purple-950/50 border-purple-500/30 text-white min-h-[100px]"
                  />
                </div>

                <Button
                  onClick={handleGenerateMusic}
                  disabled={isGenerating}
                  className="w-full bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700"
                >
                  {isGenerating ? (
                    <>
                      <Sparkles className="mr-2 h-4 w-4 animate-spin" />
                      Generating... {generationProgress}%
                    </>
                  ) : (
                    <>
                      <Music className="mr-2 h-4 w-4" />
                      Generate Music
                    </>
                  )}
                </Button>
              </CardContent>
            </Card>

            {/* Video Generator Toggle */}
            <Card className="border-purple-500/30 bg-black/40 backdrop-blur-md">
              <CardHeader>
                <CardTitle className="text-white flex items-center justify-between">
                  <span>Music Video</span>
                  <Video className="h-5 w-5 text-purple-400" />
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <Label className="text-gray-300">Enable Video Generator</Label>
                  <Switch checked={showVideoPrompt} onCheckedChange={setShowVideoPrompt} />
                </div>

                {showVideoPrompt && selectedTrack && (
                  <>
                    <div>
                      <Label className="text-gray-300">Video Description</Label>
                      <Textarea
                        value={videoPrompt}
                        onChange={(e) => setVideoPrompt(e.target.value)}
                        placeholder="Describe your music video..."
                        className="bg-purple-950/50 border-purple-500/30 text-white min-h-[100px]"
                      />
                    </div>

                    <div>
                      <Label className="text-gray-300">Visual Style</Label>
                      <Select value={videoStyle} onValueChange={setVideoStyle}>
                        <SelectTrigger className="bg-purple-950/50 border-purple-500/30 text-white">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent className="bg-purple-950 border-purple-500/30">
                          {VIDEO_STYLES.map((style) => (
                            <SelectItem key={style} value={style} className="text-white">
                              {style}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    <Button
                      onClick={handleGenerateVideo}
                      disabled={isGenerating}
                      className="w-full bg-gradient-to-r from-pink-600 to-purple-600 hover:from-pink-700 hover:to-purple-700"
                    >
                      <Video className="mr-2 h-4 w-4" />
                      Generate Video
                    </Button>
                  </>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Right Panel - Player & Library */}
          <div className="lg:col-span-2 space-y-6">
            {/* Player Card */}
            {selectedTrack && (
              <Card className="border-purple-500/30 bg-black/40 backdrop-blur-md">
                <CardHeader>
                  <CardTitle className="text-white">{selectedTrack.title}</CardTitle>
                  <CardDescription className="text-gray-400">
                    {selectedTrack.genre} • {selectedTrack.mood}
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  {showVisualizer && selectedTrack.audioUrl && <AudioVisualizer audioUrl={selectedTrack.audioUrl} />}

                  <AudioPlayer audioUrl={selectedTrack.audioUrl} title={selectedTrack.title} />

                  <div className="flex items-center space-x-2">
                    <Volume2 className="h-5 w-5 text-gray-400" />
                    <Slider
                      value={[volume]}
                      onValueChange={(value) => setVolume(value[0])}
                      max={100}
                      step={1}
                      className="flex-1"
                    />
                    <span className="text-gray-400 text-sm w-12">{volume}%</span>
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <Switch id="visualizer" checked={showVisualizer} onCheckedChange={setShowVisualizer} />
                      <Label htmlFor="visualizer" className="text-gray-300">
                        Audio Visualizer
                      </Label>
                    </div>

                    <div className="flex space-x-2">
                      <Button
                        variant="outline"
                        size="sm"
                        className="border-purple-500/50 text-purple-300 bg-transparent"
                      >
                        <Download className="h-4 w-4 mr-2" />
                        Download
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        className="border-purple-500/50 text-purple-300 bg-transparent"
                      >
                        <Share2 className="h-4 w-4 mr-2" />
                        Share
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Library */}
            <Card className="border-purple-500/30 bg-black/40 backdrop-blur-md">
              <CardHeader>
                <CardTitle className="text-white flex items-center justify-between">
                  <span>Your Music Library</span>
                  <Badge variant="outline" className="border-purple-500 text-purple-300">
                    {tracks.length} tracks
                  </Badge>
                </CardTitle>
              </CardHeader>
              <CardContent>
                {tracks.length === 0 ? (
                  <div className="text-center py-12">
                    <Music className="h-16 w-16 text-purple-400 mx-auto mb-4" />
                    <h3 className="text-xl font-semibold text-white mb-2">No tracks yet</h3>
                    <p className="text-gray-400">Generate your first track to get started</p>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {tracks.map((track) => (
                      <Card
                        key={track.id}
                        className={`cursor-pointer transition-all ${
                          selectedTrack?.id === track.id
                            ? "border-purple-500 bg-purple-500/20"
                            : "border-purple-500/30 bg-purple-950/20 hover:bg-purple-500/10"
                        }`}
                        onClick={() => setSelectedTrack(track)}
                      >
                        <CardContent className="p-4">
                          <div className="flex items-start justify-between mb-2">
                            <div>
                              <h4 className="font-semibold text-white">{track.title}</h4>
                              <p className="text-sm text-gray-400">
                                {track.genre} • {track.mood}
                              </p>
                            </div>
                            {track.status === "generating" && (
                              <Sparkles className="h-5 w-5 text-purple-400 animate-pulse" />
                            )}
                          </div>
                          <p className="text-xs text-gray-500">{new Date(track.createdAt).toLocaleDateString()}</p>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
}
