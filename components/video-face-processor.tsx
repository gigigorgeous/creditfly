"use client"

import type React from "react"

import { useState, useRef, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import { useToast } from "@/hooks/use-toast"
import { Loader2, Upload, RefreshCw, Wand2, Camera, Film, User } from "lucide-react"
import type { Persona } from "./persona-creator"

interface VideoFaceProcessorProps {
  personas: Persona[]
  onProcessComplete?: (result: {
    videoUrl: string
    thumbnailUrl: string
    title: string
  }) => void
}

export function VideoFaceProcessor({ personas, onProcessComplete }: VideoFaceProcessorProps) {
  const [sourceVideo, setSourceVideo] = useState<File | null>(null)
  const [sourceVideoPreview, setSourceVideoPreview] = useState<string | null>(null)
  const [selectedPersona, setSelectedPersona] = useState<Persona | null>(null)
  const [isProcessing, setIsProcessing] = useState(false)
  const [processedVideo, setProcessedVideo] = useState<{
    videoUrl: string
    thumbnailUrl: string
    title: string
  } | null>(null)
  const [activeTab, setActiveTab] = useState<string>("upload")

  const videoInputRef = useRef<HTMLInputElement>(null)
  const { toast } = useToast()

  // Effect to update the active tab based on processed video
  useEffect(() => {
    if (processedVideo) {
      setActiveTab("result")
    }
  }, [processedVideo])

  const handleVideoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0]
      setSourceVideo(file)

      // Create a preview URL
      const videoURL = URL.createObjectURL(file)
      setSourceVideoPreview(videoURL)
    }
  }

  const handleSelectPersona = (persona: Persona) => {
    setSelectedPersona(persona)
  }

  const handleProcessVideo = async () => {
    if (!sourceVideo) {
      toast({
        title: "Source video required",
        description: "Please upload a video to process",
        variant: "destructive",
      })
      return
    }

    if (!selectedPersona) {
      toast({
        title: "Select a persona",
        description: "Please select a persona to use for face swapping",
        variant: "destructive",
      })
      return
    }

    setIsProcessing(true)

    try {
      // In a real implementation, you would upload the video and process it
      // For this demo, we'll simulate a successful processing
      await new Promise((resolve) => setTimeout(resolve, 3000))

      // Simulate a processed video result
      const result = {
        videoUrl: "/api/stream-video/processed-demo",
        thumbnailUrl: "/api/video-thumbnail/processed-demo",
        title: `${selectedPersona.name} in ${sourceVideo.name.split(".")[0]}`,
      }

      setProcessedVideo(result)

      if (onProcessComplete) {
        onProcessComplete(result)
      }

      toast({
        title: "Video processed successfully",
        description: "Face swap video processing is complete",
      })
    } catch (error) {
      console.error("Error processing video:", error)
      toast({
        title: "Processing failed",
        description: error instanceof Error ? error.message : "There was an error processing the video",
        variant: "destructive",
      })
    } finally {
      setIsProcessing(false)
    }
  }

  const handleReset = () => {
    setSourceVideo(null)
    setSourceVideoPreview(null)
    setSelectedPersona(null)
    setProcessedVideo(null)
    setActiveTab("upload")
  }

  return (
    <div className="container py-6 space-y-6">
      <div className="flex flex-col space-y-2">
        <h2 className="text-2xl font-bold tracking-tight">Video Face Processor</h2>
        <p className="text-muted-foreground">Swap faces in your videos using your created personas</p>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="upload" className="flex items-center gap-2">
            <Upload className="h-4 w-4" />
            <span>Upload</span>
          </TabsTrigger>
          <TabsTrigger value="result" className="flex items-center gap-2" disabled={!processedVideo}>
            <Film className="h-4 w-4" />
            <span>Result</span>
          </TabsTrigger>
        </TabsList>

        <TabsContent value="upload" className="space-y-6 mt-6">
          <Card>
            <CardHeader>
              <CardTitle>Upload Video</CardTitle>
              <CardDescription>Upload a video and select a persona for face swapping</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-4">
                <Label htmlFor="sourceVideo">Source Video</Label>
                <div
                  className="border-2 border-dashed rounded-md p-4 text-center cursor-pointer hover:bg-muted/50 transition-colors"
                  onClick={() => videoInputRef.current?.click()}
                >
                  {sourceVideoPreview ? (
                    <div className="relative aspect-video max-h-[300px] mx-auto">
                      <video src={sourceVideoPreview} controls className="max-h-[300px] mx-auto rounded-md" />
                    </div>
                  ) : (
                    <div className="py-8 flex flex-col items-center gap-2">
                      <Camera className="h-8 w-8 text-muted-foreground" />
                      <p className="text-sm text-muted-foreground">Click to upload a video</p>
                      <p className="text-xs text-muted-foreground">MP4, MOV, or WebM files up to 100MB</p>
                    </div>
                  )}
                  <Input
                    ref={videoInputRef}
                    id="sourceVideo"
                    type="file"
                    accept="video/*"
                    className="hidden"
                    onChange={handleVideoChange}
                  />
                </div>
              </div>

              <div className="space-y-4">
                <Label>Select Persona</Label>
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
              </div>
            </CardContent>
            <CardFooter className="flex justify-end gap-2">
              <Button variant="outline" onClick={handleReset} disabled={!sourceVideo && !selectedPersona}>
                <RefreshCw className="h-4 w-4 mr-2" />
                Reset
              </Button>
              <Button onClick={handleProcessVideo} disabled={isProcessing || !sourceVideo || !selectedPersona}>
                {isProcessing ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Processing...
                  </>
                ) : (
                  <>
                    <Wand2 className="h-4 w-4 mr-2" />
                    Process Video
                  </>
                )}
              </Button>
            </CardFooter>
          </Card>
        </TabsContent>

        <TabsContent value="result" className="space-y-6 mt-6">
          {processedVideo && (
            <Card>
              <CardHeader>
                <CardTitle>Processed Video</CardTitle>
                <CardDescription>Face swapped video result</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="aspect-video bg-black rounded-md overflow-hidden">
                  <video
                    src={processedVideo.videoUrl}
                    poster={processedVideo.thumbnailUrl}
                    controls
                    className="w-full h-full"
                  />
                </div>
                <div className="flex flex-wrap gap-2">
                  <Badge variant="outline">Face Swapped</Badge>
                  {selectedPersona && <Badge variant="outline">{selectedPersona.name}</Badge>}
                </div>
              </CardContent>
              <CardFooter className="flex justify-between">
                <Button variant="outline" onClick={handleReset}>
                  <RefreshCw className="h-4 w-4 mr-2" />
                  Process Another Video
                </Button>
                <Button onClick={() => window.open(processedVideo.videoUrl, "_blank")}>
                  <Film className="h-4 w-4 mr-2" />
                  View Full Video
                </Button>
              </CardFooter>
            </Card>
          )}
        </TabsContent>
      </Tabs>
    </div>
  )
}
