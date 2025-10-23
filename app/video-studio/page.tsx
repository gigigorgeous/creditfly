"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { useSearchParams } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Loader2, Video, ArrowLeft, Upload, User } from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import { AudioPlayer } from "@/components/audio-player"
import Link from "next/link"

interface MusicTrack {
  id: string
  title: string
  audioUrl: string
  genre: string
  createdAt: string
}

export default function VideoStudioPage() {
  const searchParams = useSearchParams()
  const musicId = searchParams.get("musicId")

  const [selectedTrack, setSelectedTrack] = useState<MusicTrack | null>(null)
  const [tracks, setTracks] = useState<MusicTrack[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [isGenerating, setIsGenerating] = useState(false)
  const [videoUrl, setVideoUrl] = useState<string | null>(null)
  const [characterImage, setCharacterImage] = useState<File | null>(null)
  const [characterImagePreview, setCharacterImagePreview] = useState<string | null>(null)
  const [prompt, setPrompt] = useState("")
  const [videoStyle, setVideoStyle] = useState("modern")
  const [characterType, setCharacterType] = useState("realistic")
  const [celebrityReference, setCelebrityReference] = useState("")

  const { toast } = useToast()

  // Fetch music tracks
  useEffect(() => {
    const fetchTracks = async () => {
      setIsLoading(true)
      try {
        // In a real app, you would fetch from your API
        // For now, we'll use mock data
        const mockTracks: MusicTrack[] = [
          {
            id: "1",
            title: "Summer Vibes",
            audioUrl: "/audio/sample-1.mp3",
            genre: "Pop",
            createdAt: new Date().toISOString(),
          },
          {
            id: "2",
            title: "Urban Beat",
            audioUrl: "/audio/sample-2.mp3",
            genre: "Hip Hop",
            createdAt: new Date().toISOString(),
          },
        ]

        setTracks(mockTracks)

        // If musicId is provided, select that track
        if (musicId) {
          const track = mockTracks.find((t) => t.id === musicId)
          if (track) {
            setSelectedTrack(track)
          }
        }
      } catch (error) {
        console.error("Error fetching tracks:", error)
        toast({
          title: "Error",
          description: "Failed to load music tracks",
          variant: "destructive",
        })
      } finally {
        setIsLoading(false)
      }
    }

    fetchTracks()
  }, [musicId, toast])

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      setCharacterImage(file)
      const reader = new FileReader()
      reader.onload = () => {
        setCharacterImagePreview(reader.result as string)
      }
      reader.readAsDataURL(file)
    }
  }

  const handleGenerateVideo = async () => {
    if (!selectedTrack) {
      toast({
        title: "Music Required",
        description: "Please select a music track for your video.",
        variant: "destructive",
      })
      return
    }

    if (!characterImage && characterType === "deepfake") {
      toast({
        title: "Image Required",
        description: "Please upload a character image for deepfake generation.",
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

    try {
      // Create form data for file upload
      const formData = new FormData()
      formData.append("musicId", selectedTrack.id)
      formData.append("prompt", prompt)
      formData.append("videoStyle", videoStyle)
      formData.append("characterType", characterType)
      formData.append("celebrityReference", celebrityReference)

      if (characterImage) {
        formData.append("characterImage", characterImage)
      }

      // In a real app, you would send this to your API
      // For now, we'll simulate a response after a delay
      setTimeout(() => {
        // Mock video URL
        setVideoUrl("/videos/sample-video.mp4")
        setIsGenerating(false)

        toast({
          title: "Video Generated!",
          description: "Your AI-generated music video is ready to play.",
        })
      }, 3000)
    } catch (error) {
      console.error("Error generating video:", error)
      toast({
        title: "Generation Failed",
        description: "There was an error generating your video. Please try again.",
        variant: "destructive",
      })
      setIsGenerating(false)
    }
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
          <h1 className="text-3xl font-bold">Video Studio</h1>
        </div>

        <Card className="bg-gray-900 border-gray-800">
          <CardHeader>
            <CardTitle>AI Music Video Generator</CardTitle>
            <CardDescription className="text-gray-400">
              Create stunning music videos with AI-powered character animation and deepfakes
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Tabs defaultValue="music" className="w-full">
              <TabsList className="grid w-full grid-cols-3 bg-gray-800">
                <TabsTrigger value="music" className="data-[state=active]:bg-purple-700">
                  Music
                </TabsTrigger>
                <TabsTrigger value="character" className="data-[state=active]:bg-purple-700">
                  Character
                </TabsTrigger>
                <TabsTrigger value="style" className="data-[state=active]:bg-purple-700">
                  Style
                </TabsTrigger>
              </TabsList>

              <TabsContent value="music" className="space-y-4 mt-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium">Select Music Track</label>
                  <div className="grid grid-cols-1 gap-4">
                    {tracks.map((track) => (
                      <div
                        key={track.id}
                        className={`p-4 rounded-lg cursor-pointer ${selectedTrack?.id === track.id ? "bg-purple-900" : "bg-gray-800"}`}
                        onClick={() => setSelectedTrack(track)}
                      >
                        <div className="flex justify-between items-center mb-2">
                          <h3 className="font-medium">{track.title}</h3>
                          <span className="text-xs bg-gray-700 px-2 py-1 rounded">{track.genre}</span>
                        </div>
                        <AudioPlayer audioUrl={track.audioUrl} title={track.title} />
                      </div>
                    ))}
                  </div>
                </div>
              </TabsContent>

              <TabsContent value="character" className="space-y-4 mt-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium">Character Type</label>
                  <Select value={characterType} onValueChange={setCharacterType}>
                    <SelectTrigger className="bg-gray-800 border-gray-700">
                      <SelectValue placeholder="Select character type" />
                    </SelectTrigger>
                    <SelectContent className="bg-gray-800 border-gray-700">
                      <SelectItem value="realistic">Realistic AI Character</SelectItem>
                      <SelectItem value="animated">Animated Character</SelectItem>
                      <SelectItem value="deepfake">Celebrity Deepfake</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {characterType === "deepfake" && (
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Celebrity Reference</label>
                    <Input
                      placeholder="e.g., Taylor Swift, Drake, etc."
                      value={celebrityReference}
                      onChange={(e) => setCelebrityReference(e.target.value)}
                      className="bg-gray-800 border-gray-700"
                    />
                  </div>
                )}

                <div className="space-y-2">
                  <label className="text-sm font-medium">Upload Character Image</label>
                  <div className="flex items-center justify-center border-2 border-dashed border-gray-700 rounded-lg p-6 bg-gray-800">
                    {characterImagePreview ? (
                      <div className="text-center">
                        <img
                          src={characterImagePreview || "/placeholder.svg"}
                          alt="Character preview"
                          className="max-h-64 mx-auto mb-4 rounded"
                        />
                        <Button
                          variant="outline"
                          onClick={() => {
                            setCharacterImage(null)
                            setCharacterImagePreview(null)
                          }}
                          className="bg-gray-700"
                        >
                          Remove Image
                        </Button>
                      </div>
                    ) : (
                      <div className="text-center">
                        <User className="h-12 w-12 text-gray-500 mx-auto mb-2" />
                        <p className="text-sm text-gray-400 mb-2">Upload a face image for the character</p>
                        <label className="cursor-pointer">
                          <Button variant="outline" className="bg-gray-700">
                            <Upload className="h-4 w-4 mr-2" />
                            Select Image
                          </Button>
                          <input type="file" accept="image/*" className="hidden" onChange={handleImageUpload} />
                        </label>
                      </div>
                    )}
                  </div>
                </div>
              </TabsContent>

              <TabsContent value="style" className="space-y-4 mt-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium">Video Description</label>
                  <Textarea
                    placeholder="Describe the music video you want to create..."
                    value={prompt}
                    onChange={(e) => setPrompt(e.target.value)}
                    className="min-h-[100px] bg-gray-800 border-gray-700"
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium">Video Style</label>
                  <Select value={videoStyle} onValueChange={setVideoStyle}>
                    <SelectTrigger className="bg-gray-800 border-gray-700">
                      <SelectValue placeholder="Select video style" />
                    </SelectTrigger>
                    <SelectContent className="bg-gray-800 border-gray-700">
                      <SelectItem value="modern">Modern</SelectItem>
                      <SelectItem value="retro">Retro/Vintage</SelectItem>
                      <SelectItem value="cinematic">Cinematic</SelectItem>
                      <SelectItem value="anime">Anime</SelectItem>
                      <SelectItem value="3d">3D Animation</SelectItem>
                      <SelectItem value="vaporwave">Vaporwave</SelectItem>
                      <SelectItem value="cyberpunk">Cyberpunk</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </TabsContent>
            </Tabs>

            {videoUrl && (
              <div className="mt-6 p-4 bg-gray-800 rounded-lg">
                <h3 className="font-medium mb-2">Generated Video</h3>
                <video
                  src={videoUrl}
                  controls
                  className="w-full rounded-lg"
                  poster="/placeholder.svg?height=400&width=600"
                />

                <div className="mt-4 flex justify-end space-x-2">
                  <Button variant="outline" className="bg-gray-700">
                    Download
                  </Button>
                  <Button className="bg-purple-700 hover:bg-purple-600">Share</Button>
                </div>
              </div>
            )}
          </CardContent>
          <CardFooter>
            <Button
              onClick={handleGenerateVideo}
              disabled={isGenerating}
              className="w-full bg-purple-700 hover:bg-purple-600 text-white"
            >
              {isGenerating ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Generating Video...
                </>
              ) : (
                <>
                  <Video className="mr-2 h-4 w-4" />
                  Generate Music Video
                </>
              )}
            </Button>
          </CardFooter>
        </Card>
      </div>
    </div>
  )
}
