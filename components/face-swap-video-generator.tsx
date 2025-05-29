"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { useToast } from "@/hooks/use-toast"
import { Film, User, Wand2, ImageIcon, PaletteIcon } from "lucide-react"
import type { GeneratedMusic } from "./music-video-creator"
import type { Persona } from "./persona-creator"
import { VideoFaceProcessor } from "./video-face-processor"
import { FaceProcessing } from "./face-processing"

interface FaceSwapVideoGeneratorProps {
  selectedMusic: GeneratedMusic | null
  personas: Persona[]
  onVideoGenerated: (video: {
    id: string
    title: string
    videoUrl: string
    thumbnailUrl: string
    musicId: string
    style: string
    createdAt: Date
  }) => void
}

export function FaceSwapVideoGenerator({ selectedMusic, personas, onVideoGenerated }: FaceSwapVideoGeneratorProps) {
  const [activeTab, setActiveTab] = useState("style")
  const [isGenerating, setIsGenerating] = useState(false)
  const [title, setTitle] = useState("")
  const [description, setDescription] = useState("")
  const [videoStyle, setVideoStyle] = useState("Abstract Animation")
  const [colorTheme, setColorTheme] = useState("Vibrant")
  const [selectedPersona, setSelectedPersona] = useState<Persona | null>(null)
  const [generatedPreview, setGeneratedPreview] = useState<{
    id: string
    title: string
    videoUrl: string
    thumbnailUrl: string
    musicId: string
    style: string
    createdAt: Date
  } | null>(null)
  const { toast } = useToast()

  const handleSelectPersona = (persona: Persona) => {
    setSelectedPersona(persona)
  }

  const handleGenerateVideo = async () => {
    if (!selectedMusic) {
      toast({
        title: "No music selected",
        description: "Please select a music track before generating a video",
        variant: "destructive",
      })
      return
    }

    if (!selectedPersona) {
      toast({
        title: "No persona selected",
        description: "Please select a persona for the video",
        variant: "destructive",
      })
      return
    }

    setIsGenerating(true)

    try {
      // Call our API to generate a video with the persona
      const response = await fetch("/api/generate-video-with-persona", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          title: title || `${selectedPersona.name} - ${selectedMusic.title}`,
          description,
          videoStyle,
          colorTheme,
          musicId: selectedMusic.id,
          musicTitle: selectedMusic.title,
          musicGenre: selectedMusic.genre,
          musicMood: selectedMusic.mood,
          personaId: selectedPersona.id,
          personaName: selectedPersona.name,
          personaStyle: selectedPersona.style,
          personaImages: selectedPersona.images,
        }),
      })

      if (!response.ok) {
        throw new Error("Failed to generate video")
      }

      const data = await response.json()

      // Format the result
      const videoData = {
        id: data.id,
        title: data.title,
        videoUrl: data.videoUrl,
        thumbnailUrl: data.thumbnailUrl,
        musicId: data.musicId,
        style: data.style,
        createdAt: new Date(data.createdAt),
      }

      setGeneratedPreview(videoData)

      toast({
        title: "Video Generated!",
        description: `Your ${videoStyle} video featuring ${selectedPersona.name} is ready to view.`,
      })
    } catch (error) {
      console.error("Error generating video:", error)
      toast({
        title: "Generation Error",
        description: error instanceof Error ? error.message : "Failed to generate video",
        variant: "destructive",
      })
    } finally {
      setIsGenerating(false)
    }
  }

  const handleProcessComplete = (processedVideo: {
    videoUrl: string
    thumbnailUrl: string
    title: string
  }) => {
    // Create a video object from the processed video
    const videoData = {
      id: `processed-${Date.now()}`,
      title: processedVideo.title,
      videoUrl: processedVideo.videoUrl,
      thumbnailUrl: processedVideo.thumbnailUrl,
      musicId: selectedMusic?.id || "",
      style: "Face Swapped",
      createdAt: new Date(),
    }

    // Set the preview
    setGeneratedPreview(videoData)
  }

  const handleSaveVideo = () => {
    if (generatedPreview) {
      onVideoGenerated(generatedPreview)

      // Reset the form
      setTitle("")
      setDescription("")
      setVideoStyle("Abstract Animation")
      setColorTheme("Vibrant")
      setSelectedPersona(null)
      setGeneratedPreview(null)

      toast({
        title: "Video Saved!",
        description: "Your video has been added to your collection.",
      })
    }
  }

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

  return (
    <div className="container py-6 space-y-6">
      <div className="flex flex-col space-y-2">
        <h2 className="text-2xl font-bold tracking-tight">Face Swap Video Creator</h2>
        <p className="text-muted-foreground">Generate videos featuring your personas with your music</p>
      </div>

      {selectedMusic ? (
        <>
          {generatedPreview && (
            <Card className="border-primary/20 bg-primary/5">
              <CardHeader>
                <CardTitle>Preview Your Generated Video</CardTitle>
                <CardDescription>Watch your video before saving it</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="aspect-video bg-black rounded-md overflow-hidden relative">
                  <video
                    src={generatedPreview.videoUrl}
                    poster={generatedPreview.thumbnailUrl}
                    controls
                    className="w-full h-full"
                  />
                </div>
                <div className="flex gap-2 mt-4">
                  <Badge variant="outline">{generatedPreview.style}</Badge>
                  {selectedPersona && <Badge variant="outline">{selectedPersona.name}</Badge>}
                  {selectedMusic && <Badge variant="outline">{selectedMusic.title}</Badge>}
                </div>
              </CardContent>
              <CardFooter className="flex justify-end gap-2">
                <Button variant="outline" onClick={() => setGeneratedPreview(null)}>
                  Discard
                </Button>
                <Button onClick={handleSaveVideo}>Save to Collection</Button>
              </CardFooter>
            </Card>
          )}

          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList className="grid w-full grid-cols-4">
              <TabsTrigger value="style" className="flex items-center gap-2">
                <PaletteIcon className="h-4 w-4" />
                <span>Style</span>
              </TabsTrigger>
              <TabsTrigger value="persona" className="flex items-center gap-2">
                <User className="h-4 w-4" />
                <span>Persona</span>
              </TabsTrigger>
              <TabsTrigger value="face-processing" className="flex items-center gap-2">
                <ImageIcon className="h-4 w-4" />
                <span>Face Processing</span>
              </TabsTrigger>
              <TabsTrigger value="video-processing" className="flex items-center gap-2">
                <Film className="h-4 w-4" />
                <span>Video Processing</span>
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

                  <div className="space-y-2">
                    <Label htmlFor="description">Description</Label>
                    <Textarea
                      id="description"
                      placeholder="Describe what you want in the video (optional)"
                      value={description}
                      onChange={(e) => setDescription(e.target.value)}
                      className="min-h-[100px]"
                    />
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="persona" className="space-y-6 mt-6">
              <Card>
                <CardHeader>
                  <CardTitle>Select Persona</CardTitle>
                  <CardDescription>Choose a persona to feature in your video</CardDescription>
                </CardHeader>
                <CardContent>
                  {personas.length > 0 ? (
                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                      {personas.map((persona) => (
                        <div
                          key={persona.id}
                          className={`border rounded-md p-4 cursor-pointer transition-colors ${
                            selectedPersona?.id === persona.id ? "border-primary bg-primary/5" : "hover:bg-muted/50"
                          }`}
                          onClick={() => handleSelectPersona(persona)}
                        >
                          <div className="flex items-center gap-3">
                            {persona.images.length > 0 ? (
                              <img
                                src={persona.images[0].url || "/placeholder.svg"}
                                alt={persona.name}
                                className="w-12 h-12 rounded-full object-cover"
                              />
                            ) : (
                              <div className="w-12 h-12 rounded-full bg-muted flex items-center justify-center">
                                <User className="h-6 w-6 text-muted-foreground" />
                              </div>
                            )}
                            <div>
                              <p className="font-medium">{persona.name}</p>
                              <Badge variant="outline">{persona.style}</Badge>
                            </div>
                          </div>

                          {persona.images.length > 1 && (
                            <div className="grid grid-cols-4 gap-1 mt-3">
                              {persona.images.slice(0, 4).map((image) => (
                                <img
                                  key={image.id}
                                  src={image.url || "/placeholder.svg"}
                                  alt={`${persona.name} ${image.type}`}
                                  className="w-full aspect-square object-cover rounded-sm"
                                />
                              ))}
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  ) : (
                    <Card className="bg-muted/50">
                      <CardContent className="flex flex-col items-center justify-center py-6">
                        <User className="h-8 w-8 text-muted-foreground mb-2" />
                        <p className="text-sm text-muted-foreground">No personas available</p>
                        <p className="text-xs text-muted-foreground mt-1">Create a persona in the Persona tab first</p>
                      </CardContent>
                    </Card>
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="face-processing" className="mt-6">
              <FaceProcessing />
            </TabsContent>

            <TabsContent value="video-processing" className="mt-6">
              <VideoFaceProcessor personas={personas} onProcessComplete={handleProcessComplete} />
            </TabsContent>
          </Tabs>

          <Button
            className="w-full"
            size="lg"
            onClick={handleGenerateVideo}
            disabled={isGenerating || !selectedPersona}
          >
            {isGenerating ? (
              <div className="flex items-center gap-2">
                <div className="animate-spin h-4 w-4 border-2 border-current border-t-transparent rounded-full"></div>
                <span>Generating Video...</span>
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <Wand2 className="h-4 w-4" />
                <span>Generate Video with {selectedPersona?.name || "Persona"}</span>
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
