"use client"

import { useState, useEffect, useRef } from "react"
import { Button } from "@/components/ui/button"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Slider } from "@/components/ui/slider"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { PlusCircle, Music, Video, Mic, ChevronDown, Volume2, Sparkles } from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import { AudioPlayer } from "./audio-player"
import { useSunoStatus } from "@/lib/use-suno-status"
import Link from "next/link"
import { useMusicData } from "@/hooks/use-music-data"

interface MusicGenerationStatus {
  id: string
  status: "queued" | "in_progress" | "complete" | "failed"
  title: string
  audioUrl?: string
  createdAt: string
  updatedAt?: string
  error?: string
}

interface GeneratedTrack {
  id: string
  title: string
  audioUrl: string
  createdAt: string
  provider: "suno"
  status: "complete"
  genre: string
  mood: string
}

export function MusicStudio() {
  const [title, setTitle] = useState("")
  const [prompt, setPrompt] = useState("")
  const [lyrics, setLyrics] = useState("")
  const [genre, setGenre] = useState("pop")
  const [mood, setMood] = useState("happy")
  const [style, setStyle] = useState("modern")
  const [duration, setDuration] = useState(120) // 2 minutes in seconds
  const [volume, setVolume] = useState(75)
  const [activeTab, setActiveTab] = useState("fx")
  const [activeEffectTab, setActiveEffectTab] = useState("music")

  const [isGenerating, setIsGenerating] = useState(false)
  const [currentGeneration, setCurrentGeneration] = useState<MusicGenerationStatus | null>(null)

  const { toast } = useToast()
  const promptRef = useRef<HTMLTextAreaElement>(null)
  const { tracks, isLoading, refreshTracks, addTrack } = useMusicData()

  // If we have a Suno generation ID, use the hook to poll for status
  const { status: sunoStatus, isPolling } = useSunoStatus(
    currentGeneration?.id && currentGeneration.id.includes("-") ? currentGeneration.id : undefined,
  )

  // Update current generation when Suno status changes
  useEffect(() => {
    if (sunoStatus && currentGeneration) {
      setCurrentGeneration({
        ...currentGeneration,
        status: sunoStatus.status,
        audioUrl: sunoStatus.audioUrl,
        error: sunoStatus.error,
      })

      // If generation is complete, add to generated tracks
      if (sunoStatus.status === "complete" && sunoStatus.audioUrl) {
        const newTrack = {
          id: sunoStatus.id,
          title: currentGeneration.title || "Untitled Track",
          audioUrl: sunoStatus.audioUrl,
          createdAt: currentGeneration.createdAt,
          provider: "suno" as const,
          status: "complete" as const,
          genre: genre,
          mood: mood,
        }

        addTrack(newTrack)
        setSelectedTrack(newTrack)
        setIsGenerating(false)
      }

      // If generation failed, show error
      if (sunoStatus.status === "failed") {
        toast({
          title: "Generation Failed",
          description: sunoStatus.error || "There was an error generating your music.",
          variant: "destructive",
        })
        setIsGenerating(false)
      }
    }
  }, [sunoStatus, currentGeneration, toast, addTrack])

  // Fetch previously generated tracks on mount
  useEffect(() => {
    refreshTracks()
  }, [refreshTracks])

  const handleCreateMusic = () => {
    if (promptRef.current) {
      promptRef.current.focus()
    }
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
      const response = await fetch("/api/suno-generation", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          title: title || "Untitled Track",
          prompt,
          genre,
          mood,
          style,
          lyrics,
          duration: Math.min(duration, 240), // Max 4 minutes
          useAIPromptEnhancement: true,
        }),
      })

      if (!response.ok) {
        throw new Error("Failed to start music generation")
      }

      const data = await response.json()
      const newGeneration = {
        id: data.id,
        status: data.status,
        title: data.title,
        createdAt: data.createdAt,
        updatedAt: data.createdAt,
      }

      setCurrentGeneration(newGeneration)
      setActiveEffectTab("music")

      toast({
        title: "Generation Started",
        description: "Your music is being generated. This may take a few minutes.",
      })
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

  const handleVolumeChange = (value: number[]) => {
    setVolume(value[0])
  }

  const [selectedTrack, setSelectedTrack] = useState<GeneratedTrack | null>(null)

  useEffect(() => {
    if (tracks.length > 0) {
      setSelectedTrack(tracks[0])
    }
  }, [tracks])

  return (
    <div className="flex flex-col w-full h-full bg-[#0a0a0f] text-white">
      {/* Main content area */}
      <div className="flex flex-col md:flex-row w-full h-full">
        {/* Left panel - Controls */}
        <div className="w-full md:w-1/3 p-4 border-r border-purple-900/30">
          <div className="mb-6">
            <h2 className="text-xl font-bold mb-2">Create Music</h2>
            <div className="space-y-4">
              <div>
                <label className="block text-sm text-gray-400 mb-1">Title</label>
                <input
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="Enter a title for your track"
                  className="w-full bg-[#1a1a24] border border-purple-900/50 rounded-md p-2 text-white"
                />
              </div>

              <div>
                <label className="block text-sm text-gray-400 mb-1">Prompt</label>
                <textarea
                  ref={promptRef}
                  value={prompt}
                  onChange={(e) => setPrompt(e.target.value)}
                  placeholder="Describe the music you want to create..."
                  className="w-full bg-[#1a1a24] border border-purple-900/50 rounded-md p-2 text-white min-h-[100px]"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm text-gray-400 mb-1">Genre</label>
                  <Select value={genre} onValueChange={setGenre}>
                    <SelectTrigger className="bg-[#1a1a24] border-purple-900/50 text-white">
                      <SelectValue placeholder="Select genre" />
                    </SelectTrigger>
                    <SelectContent className="bg-[#1a1a24] border-purple-900/50 text-white">
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

                <div>
                  <label className="block text-sm text-gray-400 mb-1">Mood</label>
                  <Select value={mood} onValueChange={setMood}>
                    <SelectTrigger className="bg-[#1a1a24] border-purple-900/50 text-white">
                      <SelectValue placeholder="Select mood" />
                    </SelectTrigger>
                    <SelectContent className="bg-[#1a1a24] border-purple-900/50 text-white">
                      <SelectItem value="happy">Happy</SelectItem>
                      <SelectItem value="sad">Sad</SelectItem>
                      <SelectItem value="energetic">Energetic</SelectItem>
                      <SelectItem value="calm">Calm</SelectItem>
                      <SelectItem value="dark">Dark</SelectItem>
                      <SelectItem value="uplifting">Uplifting</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div>
                <label className="block text-sm text-gray-400 mb-1">Lyrics (Optional)</label>
                <textarea
                  value={lyrics}
                  onChange={(e) => setLyrics(e.target.value)}
                  placeholder="Enter lyrics for your song..."
                  className="w-full bg-[#1a1a24] border border-purple-900/50 rounded-md p-2 text-white min-h-[100px]"
                />
              </div>

              <Button
                onClick={handleGenerate}
                disabled={isGenerating}
                className="w-full bg-purple-600 hover:bg-purple-700 text-white"
              >
                {isGenerating ? "Generating..." : "Generate Music"}
              </Button>
            </div>
          </div>

          {/* Right panel - Player and effects */}
          <div className="w-full md:w-2/3 flex flex-col">
            {/* Top controls */}
            <div className="p-4 border-b border-purple-900/30">
              <div className="flex items-center justify-between mb-4">
                <Tabs value={activeTab} onValueChange={setActiveTab} className="w-auto">
                  <TabsList className="bg-[#1a1a24] border border-purple-900/50">
                    <TabsTrigger value="fx" className="data-[state=active]:bg-purple-600">
                      FX
                    </TabsTrigger>
                    <TabsTrigger value="eq" className="data-[state=active]:bg-purple-600">
                      EQ
                    </TabsTrigger>
                    <TabsTrigger value="loop" className="data-[state=active]:bg-purple-600">
                      Loop
                    </TabsTrigger>
                    <TabsTrigger value="cue" className="data-[state=active]:bg-purple-600">
                      Cue
                    </TabsTrigger>
                  </TabsList>
                </Tabs>

                <div className="flex items-center space-x-2">
                  <Volume2 className="h-5 w-5 text-gray-400" />
                  <Slider value={[volume]} max={100} step={1} onValueChange={handleVolumeChange} className="w-32" />
                </div>
              </div>

              <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                <Button variant="outline" className="bg-[#1a1a24] border-purple-900/50 hover:bg-purple-900/20">
                  Reverb
                </Button>
                <Button variant="outline" className="bg-[#1a1a24] border-purple-900/50 hover:bg-purple-900/20">
                  Delay
                </Button>
                <Button variant="outline" className="bg-[#1a1a24] border-purple-900/50 hover:bg-purple-900/20">
                  Filter
                </Button>
                <Button variant="outline" className="bg-[#1a1a24] border-purple-900/50 hover:bg-purple-900/20">
                  Flanger
                </Button>
              </div>

              <div className="flex items-center mt-4 space-x-2">
                <Button className="bg-purple-600 hover:bg-purple-700 flex items-center">
                  <Mic className="h-4 w-4 mr-2" />
                  Voice
                </Button>

                <Select value={genre} onValueChange={setGenre}>
                  <SelectTrigger className="bg-[#1a1a24] border-purple-900/50 text-white">
                    <span>Genre</span>
                    <ChevronDown className="h-4 w-4" />
                  </SelectTrigger>
                  <SelectContent className="bg-[#1a1a24] border-purple-900/50 text-white">
                    <SelectItem value="pop">Pop</SelectItem>
                    <SelectItem value="rock">Rock</SelectItem>
                    <SelectItem value="hiphop">Hip Hop</SelectItem>
                    <SelectItem value="electronic">Electronic</SelectItem>
                    <SelectItem value="jazz">Jazz</SelectItem>
                    <SelectItem value="classical">Classical</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Tabs for Music/Videos */}
            <div className="border-b border-purple-900/30">
              <Tabs value={activeEffectTab} onValueChange={setActiveEffectTab} className="w-full">
                <TabsList className="w-full bg-transparent border-b border-purple-900/30 rounded-none">
                  <TabsTrigger
                    value="music"
                    className="flex-1 data-[state=active]:border-b-2 data-[state=active]:border-purple-600 rounded-none bg-transparent"
                  >
                    <Music className="h-4 w-4 mr-2" />
                    Music
                  </TabsTrigger>
                  <TabsTrigger
                    value="videos"
                    className="flex-1 data-[state=active]:border-b-2 data-[state=active]:border-purple-600 rounded-none bg-transparent"
                  >
                    <Video className="h-4 w-4 mr-2" />
                    Videos
                  </TabsTrigger>
                </TabsList>
              </Tabs>
            </div>

            {/* Content area */}
            <div className="flex-1 p-4 overflow-auto">
              {activeEffectTab === "music" && (
                <div className="h-full flex flex-col items-center justify-center">
                  {isGenerating ||
                  (currentGeneration?.status && ["queued", "in_progress"].includes(currentGeneration.status)) ? (
                    <div className="text-center">
                      <div className="animate-pulse flex flex-col items-center">
                        <Music className="h-16 w-16 text-purple-600 mb-4" />
                        <h3 className="text-xl font-bold mb-2">Generating Music...</h3>
                        <p className="text-gray-400">This may take a few minutes</p>
                      </div>
                    </div>
                  ) : selectedTrack ? (
                    <div className="w-full">
                      <h3 className="text-xl font-bold mb-4">{selectedTrack.title}</h3>
                      <AudioPlayer audioUrl={selectedTrack.audioUrl} title={selectedTrack.title} />

                      <div className="mt-8">
                        <h4 className="text-lg font-semibold mb-2">Your Music Library</h4>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          {tracks.map((track) => (
                            <div
                              key={track.id}
                              className={`p-4 rounded-md cursor-pointer transition-colors ${
                                selectedTrack.id === track.id
                                  ? "bg-purple-900/30 border border-purple-600"
                                  : "bg-[#1a1a24] border border-purple-900/50 hover:bg-purple-900/20"
                              }`}
                              onClick={() => setSelectedTrack(track)}
                            >
                              <h5 className="font-medium">{track.title}</h5>
                              <p className="text-sm text-gray-400">{new Date(track.createdAt).toLocaleDateString()}</p>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div className="text-center">
                      <Music className="h-16 w-16 text-purple-600 mx-auto mb-4" />
                      <h3 className="text-2xl font-bold mb-2">No Music Generated Yet</h3>
                      <p className="text-gray-400 mb-6">
                        Start creating original music with AI across various genres and styles
                      </p>
                      <div className="flex flex-col sm:flex-row gap-4 justify-center">
                        <Button onClick={handleCreateMusic} className="bg-purple-600 hover:bg-purple-700">
                          <PlusCircle className="mr-2 h-4 w-4" />
                          Quick Create
                        </Button>
                        <Link href="/music-lab">
                          <Button
                            variant="outline"
                            className="border-purple-600 text-purple-600 hover:bg-purple-600 hover:text-white bg-transparent"
                          >
                            <Sparkles className="mr-2 h-4 w-4" />
                            Music Lab
                          </Button>
                        </Link>
                      </div>
                    </div>
                  )}
                </div>
              )}

              {activeEffectTab === "videos" && (
                <div className="text-center">
                  <Video className="h-16 w-16 text-purple-600 mx-auto mb-4" />
                  <h3 className="text-2xl font-bold mb-2">No Videos Generated Yet</h3>
                  <p className="text-gray-400 mb-6">Create music videos using your generated tracks</p>
                  <Button
                    onClick={() => (window.location.href = "/music-video-generator")}
                    className="bg-purple-600 hover:bg-purple-700"
                  >
                    <PlusCircle className="mr-2 h-4 w-4" />
                    Create Music Video
                  </Button>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
