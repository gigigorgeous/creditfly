"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Slider } from "@/components/ui/slider"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Loader2, Video, PlusCircle, ImageIcon } from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import { AudioPlayer } from "./audio-player"

interface Track {
  id: string
  title: string
  audioUrl: string
  createdAt: string
}

interface VideoGenerationStatus {
  id: string
  status: "queued" | "in_progress" | "complete" | "failed"
  title: string
  videoUrl?: string
  thumbnailUrl?: string
  createdAt: string
  error?: string
}

export function MusicVideoGenerator() {
  const [title, setTitle] = useState("")
  const [prompt, setPrompt] = useState("")
  const [selectedTrackId, setSelectedTrackId] = useState<string | null>(null)
  const [style, setStyle] = useState("cinematic")
  const [duration, setDuration] = useState(30) // 30 seconds default
  const [isGenerating, setIsGenerating] = useState(false)
  const [tracks, setTracks] = useState<Track[]>([])
  const [currentGeneration, setCurrentGeneration] = useState<VideoGenerationStatus | null>(null)
  const [generatedVideos, setGeneratedVideos] = useState<VideoGenerationStatus[]>([])
  const [selectedVideo, setSelectedVideo] = useState<VideoGenerationStatus | null>(null)

  const { toast } = useToast()

  // Fetch music tracks on mount
  useEffect(() => {
    const fetchTracks = async () => {
      try {
        // Fetch from both Suno generations and Music Lab
        const [sunoResponse, musicLabResponse] = await Promise.all([
          fetch("/api/suno-generations?limit=20").catch(() => ({ ok: false })),
          fetch("/api/music/list").catch(() => ({ ok: false })),
        ])

        const availableTracks: Track[] = []

        // Add Suno tracks
        if (sunoResponse.ok) {
          const sunoData = await sunoResponse.json()
          const sunoTracks = sunoData.generations
            .filter((gen: any) => gen.status === "complete" && gen.audioUrl)
            .map((gen: any) => ({
              id: gen.id,
              title: gen.title,
              audioUrl: gen.audioUrl,
              createdAt: gen.created_at || gen.createdAt,
            }))
          availableTracks.push(...sunoTracks)
        }

        // Add Music Lab tracks
        if (musicLabResponse.ok) {
          const musicLabData = await musicLabResponse.json()
          const labTracks = musicLabData.tracks
            .filter((track: any) => track.status === "complete" && track.audioUrl)
            .map((track: any) => ({
              id: track.id,
              title: track.title,
              audioUrl: track.audioUrl,
              createdAt: track.createdAt,
            }))
          availableTracks.push(...labTracks)
        }

        // Remove duplicates and sort by creation date
        const uniqueTracks = availableTracks
          .filter((track, index, self) => index === self.findIndex((t) => t.id === track.id))
          .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())

        setTracks(uniqueTracks)
        if (uniqueTracks.length > 0) {
          setSelectedTrackId(uniqueTracks[0].id)
        }
      } catch (error) {
        console.error("Error fetching tracks:", error)
      }
    }

    fetchTracks()
  }, [])

  const selectedTrack = tracks.find((track) => track.id === selectedTrackId)

  const handleGenerate = async () => {
    if (!selectedTrackId) {
      toast({
        title: "Track Required",
        description: "Please select a music track for your video.",
        variant: "destructive",
      })
      return
    }

    if (!prompt.trim()) {
      toast({
        title: "Prompt Required",
        description: "Please enter a description for your music video.",
        variant: "destructive",
      })
      return
    }

    setIsGenerating(true)

    // Mock video generation for demo
    // In a real implementation, you would call your video generation API
    setTimeout(() => {
      const newVideo = {
        id: `video-${Date.now()}`,
        status: "complete",
        title: title || "Untitled Video",
        videoUrl: "https://example.com/generated-video.mp4",
        thumbnailUrl: "/placeholder.svg?height=720&width=1280",
        createdAt: new Date().toISOString(),
      }

      setGeneratedVideos((prev) => [newVideo, ...prev])
      setSelectedVideo(newVideo)
      setCurrentGeneration(null)
      setIsGenerating(false)

      toast({
        title: "Video Generated!",
        description: "Your music video has been created successfully.",
      })
    }, 5000)

    // Simulate in-progress state
    setCurrentGeneration({
      id: `video-${Date.now()}`,
      status: "in_progress",
      title: title || "Untitled Video",
      createdAt: new Date().toISOString(),
    })
  }

  const formatDuration = (seconds: number) => {
    const minutes = Math.floor(seconds / 60)
    const remainingSeconds = seconds % 60
    return `${minutes}:${remainingSeconds.toString().padStart(2, "0")}`
  }

  return (
    <div className="flex flex-col w-full h-full bg-[#0a0a0f] text-white">
      <div className="flex flex-col md:flex-row w-full h-full">
        {/* Left panel - Controls */}
        <div className="w-full md:w-1/3 p-4 border-r border-purple-900/30">
          <div className="mb-6">
            <h2 className="text-xl font-bold mb-2">Create Music Video</h2>
            <div className="space-y-4">
              <div>
                <label className="block text-sm text-gray-400 mb-1">Title</label>
                <input
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="Enter a title for your video"
                  className="w-full bg-[#1a1a24] border border-purple-900/50 rounded-md p-2 text-white"
                />
              </div>

              <div>
                <label className="block text-sm text-gray-400 mb-1">Select Music Track</label>
                <Select value={selectedTrackId || ""} onValueChange={setSelectedTrackId}>
                  <SelectTrigger className="bg-[#1a1a24] border-purple-900/50 text-white">
                    <SelectValue placeholder="Select a track" />
                  </SelectTrigger>
                  <SelectContent className="bg-[#1a1a24] border-purple-900/50 text-white max-h-[300px]">
                    {tracks.map((track) => (
                      <SelectItem key={track.id} value={track.id}>
                        {track.title}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {selectedTrack && (
                <div className="bg-[#1a1a24] border border-purple-900/50 rounded-md p-3">
                  <h4 className="font-medium mb-2">{selectedTrack.title}</h4>
                  <AudioPlayer audioUrl={selectedTrack.audioUrl} title={selectedTrack.title} />
                </div>
              )}

              <div>
                <label className="block text-sm text-gray-400 mb-1">Video Description</label>
                <textarea
                  value={prompt}
                  onChange={(e) => setPrompt(e.target.value)}
                  placeholder="Describe what you want in your music video..."
                  className="w-full bg-[#1a1a24] border border-purple-900/50 rounded-md p-2 text-white min-h-[100px]"
                />
              </div>

              <div>
                <label className="block text-sm text-gray-400 mb-1">Visual Style</label>
                <Select value={style} onValueChange={setStyle}>
                  <SelectTrigger className="bg-[#1a1a24] border-purple-900/50 text-white">
                    <SelectValue placeholder="Select style" />
                  </SelectTrigger>
                  <SelectContent className="bg-[#1a1a24] border-purple-900/50 text-white">
                    <SelectItem value="cinematic">Cinematic</SelectItem>
                    <SelectItem value="anime">Anime</SelectItem>
                    <SelectItem value="3d">3D Animation</SelectItem>
                    <SelectItem value="retro">Retro</SelectItem>
                    <SelectItem value="abstract">Abstract</SelectItem>
                    <SelectItem value="realistic">Realistic</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <div className="flex justify-between">
                  <label className="block text-sm text-gray-400">Duration: {formatDuration(duration)}</label>
                </div>
                <Slider
                  min={10}
                  max={60}
                  step={5}
                  value={[duration]}
                  onValueChange={(value) => setDuration(value[0])}
                  className="w-full"
                />
              </div>

              <Button
                onClick={handleGenerate}
                disabled={isGenerating}
                className="w-full bg-purple-600 hover:bg-purple-700 text-white"
              >
                {isGenerating ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Generating...
                  </>
                ) : (
                  <>
                    <Video className="mr-2 h-4 w-4" />
                    Generate Music Video
                  </>
                )}
              </Button>
            </div>
          </div>

          {/* Right panel - Video display */}
          <div className="w-full md:w-2/3 flex flex-col">
            <div className="p-4 border-b border-purple-900/30">
              <Tabs defaultValue="library" className="w-full">
                <TabsList className="w-full bg-transparent border-b border-purple-900/30 rounded-none">
                  <TabsTrigger
                    value="library"
                    className="flex-1 data-[state=active]:border-b-2 data-[state=active]:border-purple-600 rounded-none bg-transparent"
                  >
                    <Video className="h-4 w-4 mr-2" />
                    Video Library
                  </TabsTrigger>
                  <TabsTrigger
                    value="current"
                    className="flex-1 data-[state=active]:border-b-2 data-[state=active]:border-purple-600 rounded-none bg-transparent"
                  >
                    <ImageIcon className="h-4 w-4 mr-2" />
                    Current Video
                  </TabsTrigger>
                </TabsList>
              </Tabs>
            </div>

            {/* Content area */}
            <div className="flex-1 p-4 overflow-auto">
              {isGenerating || currentGeneration?.status === "in_progress" ? (
                <div className="h-full flex flex-col items-center justify-center">
                  <div className="animate-pulse flex flex-col items-center">
                    <Video className="h-16 w-16 text-purple-600 mb-4" />
                    <h3 className="text-xl font-bold mb-2">Generating Video...</h3>
                    <p className="text-gray-400">This may take a few minutes</p>
                  </div>
                </div>
              ) : selectedVideo ? (
                <div className="w-full">
                  <h3 className="text-xl font-bold mb-4">{selectedVideo.title}</h3>

                  <div className="relative aspect-video bg-black rounded-md overflow-hidden mb-4">
                    <img
                      src={selectedVideo.thumbnailUrl || "/placeholder.svg"}
                      alt={selectedVideo.title}
                      className="w-full h-full object-cover"
                    />
                    <div className="absolute inset-0 flex items-center justify-center">
                      <Button className="bg-purple-600/80 hover:bg-purple-700">Play Video</Button>
                    </div>
                  </div>

                  <div className="mt-8">
                    <h4 className="text-lg font-semibold mb-2">Your Video Library</h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {generatedVideos.map((video) => (
                        <div
                          key={video.id}
                          className={`p-4 rounded-md cursor-pointer transition-colors ${
                            selectedVideo.id === video.id
                              ? "bg-purple-900/30 border border-purple-600"
                              : "bg-[#1a1a24] border border-purple-900/50 hover:bg-purple-900/20"
                          }`}
                          onClick={() => setSelectedVideo(video)}
                        >
                          <div className="relative aspect-video bg-black rounded-md overflow-hidden mb-2">
                            <img
                              src={video.thumbnailUrl || "/placeholder.svg"}
                              alt={video.title}
                              className="w-full h-full object-cover"
                            />
                          </div>
                          <h5 className="font-medium">{video.title}</h5>
                          <p className="text-sm text-gray-400">{new Date(video.createdAt).toLocaleDateString()}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              ) : (
                <div className="h-full flex flex-col items-center justify-center">
                  <Video className="h-16 w-16 text-purple-600 mb-4" />
                  <h3 className="text-2xl font-bold mb-2">No Videos Generated Yet</h3>
                  <p className="text-gray-400 mb-6">Create music videos using your generated tracks</p>
                  <Button
                    onClick={() => {
                      if (selectedTrackId) {
                        handleGenerate()
                      } else {
                        toast({
                          title: "Track Required",
                          description: "Please select a music track first.",
                          variant: "destructive",
                        })
                      }
                    }}
                    className="bg-purple-600 hover:bg-purple-700"
                  >
                    <PlusCircle className="h-4 w-4 mr-2" />
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
