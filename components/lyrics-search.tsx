"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Search, Copy } from "lucide-react"
import { useToast } from "@/hooks/use-toast"

interface LyricsData {
  lyrics: string
  title: string
  artist: string
  album?: string
}

export function LyricsSearch() {
  const [title, setTitle] = useState("")
  const [artist, setArtist] = useState("")
  const [duration, setDuration] = useState("")
  const [isSearching, setIsSearching] = useState(false)
  const [lyricsData, setLyricsData] = useState<LyricsData | null>(null)
  const { toast } = useToast()

  const searchLyrics = async () => {
    if (!title || !artist) {
      toast({
        title: "Missing Information",
        description: "Please enter both title and artist",
        variant: "destructive",
      })
      return
    }

    setIsSearching(true)

    try {
      const params = new URLSearchParams({
        title,
        artist,
      })

      if (duration) {
        params.append("duration", duration)
      }

      const response = await fetch(`/api/lyrics/search?${params}`)
      const data = await response.json()

      if (data.success && data.data) {
        setLyricsData({
          lyrics: data.data.lyrics || "Lyrics not found",
          title: data.data.title || title,
          artist: data.data.artist || artist,
          album: data.data.album,
        })

        toast({
          title: "Lyrics Found",
          description: "Successfully retrieved lyrics",
        })
      } else {
        throw new Error(data.error || "Lyrics not found")
      }
    } catch (error) {
      console.error("Error searching lyrics:", error)
      toast({
        title: "Search Failed",
        description: error instanceof Error ? error.message : "Failed to search lyrics",
        variant: "destructive",
      })
    } finally {
      setIsSearching(false)
    }
  }

  const copyLyrics = () => {
    if (lyricsData?.lyrics) {
      navigator.clipboard.writeText(lyricsData.lyrics)
      toast({
        title: "Copied",
        description: "Lyrics copied to clipboard",
      })
    }
  }

  return (
    <div className="container py-6 space-y-6">
      <div className="flex flex-col space-y-2">
        <h2 className="text-2xl font-bold tracking-tight">Lyrics Search</h2>
        <p className="text-muted-foreground">Search for song lyrics using Musixmatch</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Search Lyrics</CardTitle>
          <CardDescription>Enter song details to find lyrics</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
              <Label htmlFor="artist">Artist</Label>
              <Input
                id="artist"
                placeholder="Enter artist name"
                value={artist}
                onChange={(e) => setArtist(e.target.value)}
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="duration">Duration (optional)</Label>
            <Input
              id="duration"
              placeholder="e.g., 3:36"
              value={duration}
              onChange={(e) => setDuration(e.target.value)}
            />
          </div>

          <Button className="w-full" onClick={searchLyrics} disabled={isSearching || !title || !artist}>
            {isSearching ? (
              <div className="flex items-center gap-2">
                <div className="animate-spin h-4 w-4 border-2 border-current border-t-transparent rounded-full"></div>
                <span>Searching...</span>
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <Search className="h-4 w-4" />
                <span>Search Lyrics</span>
              </div>
            )}
          </Button>
        </CardContent>
      </Card>

      {lyricsData && (
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle>{lyricsData.title}</CardTitle>
                <CardDescription>by {lyricsData.artist}</CardDescription>
              </div>
              <Button variant="outline" size="sm" onClick={copyLyrics}>
                <Copy className="h-4 w-4 mr-2" />
                Copy
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <div className="whitespace-pre-wrap text-sm bg-muted/50 p-4 rounded-md max-h-96 overflow-y-auto">
              {lyricsData.lyrics}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
