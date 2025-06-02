"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Loader2, Video } from "lucide-react"
import { useToast } from "@/components/ui/use-toast"
import { useSearchParams } from "next/navigation"
import { useAuth } from "@/context/auth-context"

export function VideoGenerator() {
  const [prompt, setPrompt] = useState("")
  const [style, setStyle] = useState("realistic")
  const [loading, setLoading] = useState(false)
  const [videoUrl, setVideoUrl] = useState<string | null>(null)
  const [songId, setSongId] = useState<string | null>(null)
  const [audioUrl, setAudioUrl] = useState<string | null>(null)
  const { toast } = useToast()
  const searchParams = useSearchParams()
  const { user } = useAuth()

  // Get songId from URL parameters
  useEffect(() => {
    const songIdParam = searchParams.get("songId")
    if (songIdParam) {
      setSongId(songIdParam)
      fetchSongDetails(songIdParam)
    }
  }, [searchParams])

  // Fetch song details if songId is available
  const fetchSongDetails = async (id: string) => {
    try {
      const response = await fetch(`/api/songs/${id}`)
      if (!response.ok) throw new Error("Failed to fetch song details")

      const data = await response.json()
      setAudioUrl(data.audioUrl)
    } catch (error) {
      console.error("Error fetching song details:", error)
      toast({
        title: "Error",
        description: "Failed to load song details",
        variant: "destructive",
      })
    }
  }

  const generateVideo = async () => {
    if (!prompt) {
      toast({
        title: "Prompt required",
        description: "Please enter a description for your video",
        variant: "destructive",
      })
      return
    }

    if (!songId || !audioUrl) {
      toast({
        title: "Audio required",
        description: "Please generate music first or select an existing track",
        variant: "destructive",
      })
      return
    }

    try {
      setLoading(true)

      // Check if user is authenticated for premium features
      if (!user && style !== "realistic") {
        toast({
          title: "Authentication required",
          description: "Please log in to use custom video styles",
          variant: "destructive",
        })
        return
      }

      const response = await fetch("/api/generate-video", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          prompt,
          style,
          audioUrl,
          songId,
        }),
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.message || "Failed to generate video")
      }

      const data = await response.json()

      if (!data.videoUrl) {
        throw new Error("No video URL returned from API")
      }

      setVideoUrl(data.videoUrl)

      toast({
        title: "Video generated!",
        description: "Your AI video has been created successfully.",
      })
    } catch (error) {
      console.error("Error generating video:", error)
      toast({
        title: "Generation failed",
        description: error instanceof Error ? error.message : "Failed to generate video. Please try again.",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="space-y-4 p-4 bg-card rounded-lg border shadow-sm">
      <div className="space-y-2">
        <h3 className="text-lg font-medium">Generate AI Video</h3>
        <p className="text-sm text-muted-foreground">Describe the video you want to create</p>
      </div>

      {audioUrl && (
        <div className="pt-2 pb-4">
          <p className="text-sm font-medium mb-2">Audio Track:</p>
          <audio controls className="w-full" src={audioUrl}>
            Your browser does not support the audio element.
          </audio>
        </div>
      )}

      <Textarea
        placeholder="E.g., A concert with a band performing on stage with colorful lights"
        value={prompt}
        onChange={(e) => setPrompt(e.target.value)}
        className="min-h-[100px]"
      />

      {user && (
        <Select value={style} onValueChange={setStyle}>
          <SelectTrigger>
            <SelectValue placeholder="Select video style" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="realistic">Realistic</SelectItem>
            <SelectItem value="animated">Animated</SelectItem>
            <SelectItem value="artistic">Artistic</SelectItem>
            <SelectItem value="cinematic">Cinematic</SelectItem>
          </SelectContent>
        </Select>
      )}

      <Button onClick={generateVideo} disabled={loading || !prompt || !audioUrl} className="w-full">
        {loading ? (
          <>
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            Generating...
          </>
        ) : (
          <>
            <Video className="mr-2 h-4 w-4" />
            Generate Video
          </>
        )}
      </Button>

      {videoUrl && (
        <div className="pt-4">
          <p className="text-sm font-medium mb-2">Preview:</p>
          <video controls className="w-full rounded-md" src={videoUrl}>
            Your browser does not support the video element.
          </video>
        </div>
      )}
    </div>
  )
}
