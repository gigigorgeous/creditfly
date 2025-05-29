"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Music, Download, Loader2 } from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import { AudioPlayer } from "./audio-player"

interface MurekaAccount {
  id: string
  name: string
  credits: number
}

interface GeneratedTrack {
  id: string
  title: string
  status: "pending" | "processing" | "completed" | "failed"
  audioUrl?: string
  downloadUrl?: string
  createdAt: string
}

export function MurekaMusicGenerator() {
  const [accounts, setAccounts] = useState<MurekaAccount[]>([])
  const [selectedAccount, setSelectedAccount] = useState("")
  const [prompt, setPrompt] = useState("")
  const [lyrics, setLyrics] = useState("")
  const [title, setTitle] = useState("")
  const [generationType, setGenerationType] = useState<"simple" | "advanced" | "instrumental">("simple")
  const [isGenerating, setIsGenerating] = useState(false)
  const [isLoadingAccounts, setIsLoadingAccounts] = useState(true)
  const [generatedTracks, setGeneratedTracks] = useState<GeneratedTrack[]>([])
  const { toast } = useToast()

  useEffect(() => {
    loadAccounts()
  }, [])

  const loadAccounts = async () => {
    try {
      setIsLoadingAccounts(true)
      const response = await fetch("/api/mureka/accounts")

      if (!response.ok) {
        throw new Error(`API error: ${response.status}`)
      }

      const data = await response.json()

      if (data.success && Array.isArray(data.data)) {
        setAccounts(data.data)
        if (data.data.length > 0) {
          setSelectedAccount(data.data[0].id)
        }
      } else {
        // If data is not an array, set an empty array
        setAccounts([])
        console.error("Invalid accounts data format:", data)
      }
    } catch (error) {
      console.error("Error loading accounts:", error)
      setAccounts([]) // Ensure accounts is always an array
      toast({
        title: "Error",
        description: "Failed to load Mureka accounts",
        variant: "destructive",
      })
    } finally {
      setIsLoadingAccounts(false)
    }
  }

  const generateMusic = async () => {
    if (!selectedAccount) {
      toast({
        title: "No Account Selected",
        description: "Please select a Mureka account first",
        variant: "destructive",
      })
      return
    }

    if (generationType === "advanced" && !lyrics) {
      toast({
        title: "Lyrics Required",
        description: "Please enter lyrics for advanced generation",
        variant: "destructive",
      })
      return
    }

    if ((generationType === "simple" || generationType === "instrumental") && !prompt) {
      toast({
        title: "Prompt Required",
        description: "Please enter a prompt for music generation",
        variant: "destructive",
      })
      return
    }

    setIsGenerating(true)

    try {
      const response = await fetch("/api/mureka/generate-music", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          account: selectedAccount,
          prompt,
          lyrics,
          title,
          type: generationType,
        }),
      })

      const data = await response.json()

      if (data.success) {
        const newTrack: GeneratedTrack = {
          id: data.data.id || Date.now().toString(),
          title: title || "Untitled Track",
          status: "processing",
          createdAt: new Date().toISOString(),
        }

        setGeneratedTracks((prev) => [newTrack, ...prev])

        toast({
          title: "Music Generation Started",
          description: "Your track is being generated. This may take a few minutes.",
        })

        // Start polling for status
        pollMusicStatus(newTrack.id)
      } else {
        throw new Error(data.error || "Failed to generate music")
      }
    } catch (error) {
      console.error("Error generating music:", error)
      toast({
        title: "Generation Failed",
        description: error instanceof Error ? error.message : "Failed to generate music",
        variant: "destructive",
      })
    } finally {
      setIsGenerating(false)
    }
  }

  const pollMusicStatus = async (songId: string) => {
    const maxAttempts = 30 // 5 minutes with 10-second intervals
    let attempts = 0

    const poll = async () => {
      try {
        const response = await fetch(`/api/mureka/music-status/${songId}`)
        const data = await response.json()

        if (data.success && data.data) {
          const status = data.data.status

          setGeneratedTracks((prev) =>
            prev.map((track) =>
              track.id === songId
                ? {
                    ...track,
                    status: status === "completed" ? "completed" : status === "failed" ? "failed" : "processing",
                    audioUrl: data.data.audioUrl,
                    downloadUrl: data.data.downloadUrl,
                  }
                : track,
            ),
          )

          if (status === "completed") {
            toast({
              title: "Music Generated!",
              description: "Your track is ready to play and download.",
            })
            return
          } else if (status === "failed") {
            toast({
              title: "Generation Failed",
              description: "There was an error generating your track.",
              variant: "destructive",
            })
            return
          }
        }

        attempts++
        if (attempts < maxAttempts) {
          setTimeout(poll, 10000) // Poll every 10 seconds
        } else {
          toast({
            title: "Timeout",
            description: "Music generation is taking longer than expected. Please check back later.",
            variant: "destructive",
          })
        }
      } catch (error) {
        console.error("Error polling music status:", error)
      }
    }

    poll()
  }

  const downloadTrack = async (songId: string, type: "full" | "stem" = "full") => {
    try {
      const response = await fetch("/api/mureka/download-music", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ songId, type }),
      })

      const data = await response.json()

      if (data.success && data.data.downloadUrl) {
        const link = document.createElement("a")
        link.href = data.data.downloadUrl
        link.download = `track-${songId}.mp3`
        document.body.appendChild(link)
        link.click()
        document.body.removeChild(link)
      } else {
        throw new Error("Download URL not available")
      }
    } catch (error) {
      console.error("Error downloading track:", error)
      toast({
        title: "Download Failed",
        description: "Failed to download the track",
        variant: "destructive",
      })
    }
  }

  if (isLoadingAccounts) {
    return (
      <div className="flex items-center justify-center p-8">
        <Loader2 className="h-8 w-8 animate-spin" />
        <span className="ml-2">Loading Mureka accounts...</span>
      </div>
    )
  }

  return (
    <div className="container py-6 space-y-6">
      <div className="flex flex-col space-y-2">
        <h2 className="text-2xl font-bold tracking-tight">Mureka AI Music Generator</h2>
        <p className="text-muted-foreground">Generate professional music tracks using Mureka AI</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Generate Music</CardTitle>
          <CardDescription>Create music with AI using different generation modes</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="account">Mureka Account</Label>
            <Select value={selectedAccount} onValueChange={setSelectedAccount}>
              <SelectTrigger id="account">
                <SelectValue placeholder="Select account" />
              </SelectTrigger>
              <SelectContent>
                {Array.isArray(accounts) && accounts.length > 0 ? (
                  accounts.map((account) => (
                    <SelectItem key={account.id} value={account.id}>
                      {account.name} ({account.credits} credits)
                    </SelectItem>
                  ))
                ) : (
                  <SelectItem value="no-accounts" disabled>
                    No accounts available
                  </SelectItem>
                )}
              </SelectContent>
            </Select>
          </div>

          <Tabs value={generationType} onValueChange={(value) => setGenerationType(value as any)}>
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="simple">Simple</TabsTrigger>
              <TabsTrigger value="advanced">Advanced</TabsTrigger>
              <TabsTrigger value="instrumental">Instrumental</TabsTrigger>
            </TabsList>

            <TabsContent value="simple" className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="prompt">Music Prompt</Label>
                <Textarea
                  id="prompt"
                  placeholder="Describe the music you want to create..."
                  value={prompt}
                  onChange={(e) => setPrompt(e.target.value)}
                />
              </div>
            </TabsContent>

            <TabsContent value="advanced" className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="title">Song Title</Label>
                <Input
                  id="title"
                  placeholder="Enter song title"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="lyrics">Lyrics</Label>
                <Textarea
                  id="lyrics"
                  placeholder="Enter song lyrics..."
                  className="min-h-[200px]"
                  value={lyrics}
                  onChange={(e) => setLyrics(e.target.value)}
                />
              </div>
            </TabsContent>

            <TabsContent value="instrumental" className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="instrumental-prompt">Instrumental Prompt</Label>
                <Textarea
                  id="instrumental-prompt"
                  placeholder="Describe the instrumental music you want..."
                  value={prompt}
                  onChange={(e) => setPrompt(e.target.value)}
                />
              </div>
            </TabsContent>
          </Tabs>
        </CardContent>
        <CardFooter>
          <Button className="w-full" onClick={generateMusic} disabled={isGenerating || !selectedAccount}>
            {isGenerating ? (
              <div className="flex items-center gap-2">
                <Loader2 className="h-4 w-4 animate-spin" />
                <span>Generating Music...</span>
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <Music className="h-4 w-4" />
                <span>Generate Music</span>
              </div>
            )}
          </Button>
        </CardFooter>
      </Card>

      {generatedTracks.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Generated Tracks</CardTitle>
            <CardDescription>Your AI-generated music tracks</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {generatedTracks.map((track) => (
              <div key={track.id} className="p-4 border rounded-lg space-y-3">
                <div className="flex items-center justify-between">
                  <h3 className="font-medium">{track.title}</h3>
                  <Badge
                    variant={
                      track.status === "completed" ? "default" : track.status === "failed" ? "destructive" : "secondary"
                    }
                  >
                    {track.status}
                  </Badge>
                </div>

                {track.status === "processing" && (
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Loader2 className="h-4 w-4 animate-spin" />
                    <span>Generating music...</span>
                  </div>
                )}

                {track.status === "completed" && track.audioUrl && (
                  <div className="space-y-3">
                    <AudioPlayer audioUrl={track.audioUrl} title={track.title} />
                    <div className="flex gap-2">
                      <Button variant="outline" size="sm" onClick={() => downloadTrack(track.id, "full")}>
                        <Download className="h-4 w-4 mr-2" />
                        Download Full
                      </Button>
                      <Button variant="outline" size="sm" onClick={() => downloadTrack(track.id, "stem")}>
                        <Download className="h-4 w-4 mr-2" />
                        Download Stems
                      </Button>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </CardContent>
        </Card>
      )}
    </div>
  )
}
