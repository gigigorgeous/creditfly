"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import { Film, AudioWaveformIcon as WaveformIcon, ImageIcon, PaletteIcon } from "lucide-react"
import type { GeneratedMusic, GeneratedVideo } from "./music-video-creator"
import { AudioPlayer } from "./audio-player"
import { useToast } from "@/hooks/use-toast"

const VIDEO_STYLES = [
  "Abstract Animation",
  "Waveform Visualization",
  "Stock Footage",
  "AI Imagery",
  "Geometric Patterns",
  "Particle Effects",
  "Liquid Simulation",
  "Neon Glow",
  "Retro VHS",
  "Minimalist",
]

const COLOR_THEMES = [
  "Vibrant",
  "Monochrome",
  "Pastel",
  "Neon",
  "Earthy",
  "Cool Blues",
  "Warm Sunset",
  "Dark Mode",
  "High Contrast",
  "Cyberpunk",
]

export function VideoGenerator({
  selectedMusic,
  onVideoGenerated,
}: {
  selectedMusic: GeneratedMusic | null
  onVideoGenerated: (video: GeneratedVideo) => void
}) {
  const [title, setTitle] = useState("")
  const [description, setDescription] = useState("")
  const [videoStyle, setVideoStyle] = useState("Abstract Animation")
  const [colorTheme, setColorTheme] = useState("Vibrant")
  const [isGenerating, setIsGenerating] = useState(false)
  const [activeTab, setActiveTab] = useState("style")
  const [previewVideo, setPreviewVideo] = useState<GeneratedVideo | null>(null)
  const { toast } = useToast()

  const handleGenerate = async () => {
    if (!selectedMusic) return

    setIsGenerating(true)
    setPreviewVideo(null)

    try {
      // Call our API route to generate video
      const response = await fetch("/api/generate-video", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          title,
          description,
          videoStyle,
          colorTheme,
          musicId: selectedMusic.id,
          musicTitle: selectedMusic.title,
          musicGenre: selectedMusic.genre,
          musicMood: selectedMusic.mood,
        }),
      })

      if (!response.ok) {
        throw new Error("Failed to generate video")
      }

      const generatedVideo = await response.json()

      // Create a properly formatted video object
      const videoData: GeneratedVideo = {
        id: generatedVideo.id,
        title: generatedVideo.title,
        videoUrl: generatedVideo.videoUrl,
        thumbnailUrl: generatedVideo.thumbnailUrl,
        musicId: generatedVideo.musicId,
        style: generatedVideo.style,
        createdAt: new Date(generatedVideo.createdAt),
      }

      // Set preview video
      setPreviewVideo(videoData)

      toast({
        title: "Video Generated!",
        description: `Your ${videoStyle} video for "${selectedMusic.title}" is ready to view.`,
      })
    } catch (error) {
      console.error("Error generating video:", error)
      let errorMessage = "There was an error generating your video. Please try again."

      // Check if it's an API key error
      if (error instanceof Error && error.message.includes("API key")) {
        errorMessage = "OpenAI API key is missing. The app is running in demo mode with simulated responses."
      }

      toast({
        title: "Generation Notice",
        description: errorMessage,
        variant: error instanceof Error && error.message.includes("API key") ? "default" : "destructive",
      })
    } finally {
      setIsGenerating(false)
    }
  }

  const handleSaveVideo = () => {
    if (previewVideo) {
      onVideoGenerated(previewVideo)

      // Reset form
      setTitle("")
      setDescription("")
      setVideoStyle("Abstract Animation")
      setColorTheme("Vibrant")
      setPreviewVideo(null)

      toast({
        title: "Video Saved!",
        description: "Your video has been added to your collection.",
      })
    }
  }

  return (
    <div className="container py-6 space-y-6">
      <div className="flex flex-col space-y-2">
        <h2 className="text-2xl font-bold tracking-tight">Video Creator</h2>
        <p className="text-muted-foreground">Generate music videos that match your generated music</p>
      </div>

      {selectedMusic ? (
        <>
          <Card>
            <CardHeader>
              <CardTitle>Selected Music</CardTitle>
              <CardDescription>Create a video for this music track</CardDescription>
            </CardHeader>
            <CardContent>
              <AudioPlayer audioUrl={selectedMusic.audioUrl} title={selectedMusic.title} />
              <div className="flex gap-2 mt-4">
                <Badge variant="secondary">{selectedMusic.genre}</Badge>
                <Badge variant="secondary">{selectedMusic.mood}</Badge>
                <Badge variant="outline">{`${Math.floor(selectedMusic.duration / 60)}:${(selectedMusic.duration % 60).toString().padStart(2, "0")}`}</Badge>
              </div>
            </CardContent>
          </Card>

          {previewVideo && (
            <Card className="border-primary/20 bg-primary/5">
              <CardHeader>
                <CardTitle>Preview Your Generated Video</CardTitle>
                <CardDescription>Watch your video before saving it</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="aspect-video bg-black rounded-md overflow-hidden relative">
                  <video
                    src={previewVideo.videoUrl}
                    poster={previewVideo.thumbnailUrl}
                    controls
                    className="w-full h-full"
                  />
                </div>
                <div className="flex gap-2 mt-4">
                  <Badge variant="outline">{previewVideo.style}</Badge>
                </div>
              </CardContent>
              <CardFooter className="flex justify-end gap-2">
                <Button variant="outline" onClick={() => setPreviewVideo(null)}>
                  Discard
                </Button>
                <Button onClick={handleSaveVideo}>Save to Collection</Button>
              </CardFooter>
            </Card>
          )}

          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="style" className="flex items-center gap-2">
                <PaletteIcon className="h-4 w-4" />
                <span>Style</span>
              </TabsTrigger>
              <TabsTrigger value="visualization" className="flex items-center gap-2">
                <WaveformIcon className="h-4 w-4" />
                <span>Visualization</span>
              </TabsTrigger>
              <TabsTrigger value="imagery" className="flex items-center gap-2">
                <ImageIcon className="h-4 w-4" />
                <span>Imagery</span>
              </TabsTrigger>
            </TabsList>

            <TabsContent value="style" className="space-y-6 mt-6">
              <Card>
                <CardHeader>
                  <CardTitle>Video Style</CardTitle>
                  <CardDescription>Choose the visual style for your music video</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="title">Video Title</Label>
                    <Input
                      id="title"
                      placeholder="Enter a title for your video"
                      value={title}
                      onChange={(e) => setTitle(e.target.value)}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="videoStyle">Visual Style</Label>
                    <Select value={videoStyle} onValueChange={setVideoStyle}>
                      <SelectTrigger id="videoStyle">
                        <SelectValue placeholder="Select visual style" />
                      </SelectTrigger>
                      <SelectContent>
                        {VIDEO_STYLES.map((style) => (
                          <SelectItem key={style} value={style}>
                            {style}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="colorTheme">Color Theme</Label>
                    <Select value={colorTheme} onValueChange={setColorTheme}>
                      <SelectTrigger id="colorTheme">
                        <SelectValue placeholder="Select color theme" />
                      </SelectTrigger>
                      <SelectContent>
                        {COLOR_THEMES.map((theme) => (
                          <SelectItem key={theme} value={theme}>
                            {theme}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="visualization" className="space-y-6 mt-6">
              <Card>
                <CardHeader>
                  <CardTitle>Audio Visualization</CardTitle>
                  <CardDescription>Configure how the music is visualized in your video</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="waveformStyle">Waveform Style</Label>
                      <Select>
                        <SelectTrigger id="waveformStyle">
                          <SelectValue placeholder="Select style" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="classic">Classic</SelectItem>
                          <SelectItem value="bars">Bars</SelectItem>
                          <SelectItem value="circular">Circular</SelectItem>
                          <SelectItem value="particles">Particles</SelectItem>
                          <SelectItem value="spectrum">Spectrum</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="reactivity">Reactivity</Label>
                      <Select>
                        <SelectTrigger id="reactivity">
                          <SelectValue placeholder="Select reactivity" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="subtle">Subtle</SelectItem>
                          <SelectItem value="moderate">Moderate</SelectItem>
                          <SelectItem value="intense">Intense</SelectItem>
                          <SelectItem value="extreme">Extreme</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label>Preview</Label>
                    <div className="aspect-video bg-black/20 rounded-md flex items-center justify-center">
                      <WaveformIcon className="h-24 w-24 text-primary/40" />
                    </div>
                    <p className="text-sm text-muted-foreground">
                      Visualization will be generated based on the audio frequencies and beats
                    </p>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="imagery" className="space-y-6 mt-6">
              <Card>
                <CardHeader>
                  <CardTitle>AI Imagery</CardTitle>
                  <CardDescription>Generate AI imagery based on prompts or music characteristics</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="imagePrompt">Image Prompt</Label>
                    <Textarea
                      id="imagePrompt"
                      placeholder="Describe the imagery you want (e.g., 'Abstract cosmic nebula with vibrant colors flowing like music')"
                      value={description}
                      onChange={(e) => setDescription(e.target.value)}
                      className="min-h-[100px]"
                    />
                    <p className="text-sm text-muted-foreground">
                      Leave blank to automatically generate imagery based on music characteristics
                    </p>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="artStyle">Art Style</Label>
                    <Select>
                      <SelectTrigger id="artStyle">
                        <SelectValue placeholder="Select art style" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="realistic">Realistic</SelectItem>
                        <SelectItem value="abstract">Abstract</SelectItem>
                        <SelectItem value="digital">Digital Art</SelectItem>
                        <SelectItem value="painterly">Painterly</SelectItem>
                        <SelectItem value="anime">Anime</SelectItem>
                        <SelectItem value="3d">3D Rendered</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label>Stock Footage Integration</Label>
                    <div className="flex items-center space-x-2">
                      <input type="checkbox" id="useStockFootage" className="accent-primary" />
                      <Label htmlFor="useStockFootage" className="text-sm font-normal">
                        Include relevant stock footage in the video
                      </Label>
                    </div>
                    <p className="text-sm text-muted-foreground">
                      AI will select appropriate stock footage based on the music and theme
                    </p>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>

          <Button className="w-full" size="lg" onClick={handleGenerate} disabled={isGenerating}>
            {isGenerating ? (
              <div className="flex items-center gap-2">
                <div className="animate-spin h-4 w-4 border-2 border-current border-t-transparent rounded-full"></div>
                <span>Generating Video...</span>
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <Film className="h-4 w-4" />
                <span>Generate Music Video</span>
              </div>
            )}
          </Button>
        </>
      ) : (
        <Card className="flex flex-col items-center justify-center p-6 min-h-[300px]">
          <div className="text-center space-y-4">
            <Film className="h-16 w-16 text-primary/30 mx-auto" />
            <h3 className="text-xl font-medium">No Music Selected</h3>
            <p className="text-muted-foreground max-w-md">
              Generate music first or select an existing track from your dashboard to create a music video
            </p>
            <Button variant="outline" onClick={() => window.history.back()}>
              Go Back to Music Creator
            </Button>
          </div>
        </Card>
      )}
    </div>
  )
}
