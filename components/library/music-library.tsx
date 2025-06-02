"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { AudioPlayer } from "../audio-player"
import { Search, Music, Clock, Calendar, Play, Download, Share2, Heart } from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import type { GeneratedMusic } from "../music-video-creator"

interface MusicLibraryProps {
  userId?: string
}

export function MusicLibrary({ userId }: MusicLibraryProps) {
  const [tracks, setTracks] = useState<GeneratedMusic[]>([])
  const [filteredTracks, setFilteredTracks] = useState<GeneratedMusic[]>([])
  const [searchQuery, setSearchQuery] = useState("")
  const [selectedGenre, setSelectedGenre] = useState<string>("all")
  const [sortBy, setSortBy] = useState<"recent" | "popular" | "duration">("recent")
  const [isLoading, setIsLoading] = useState(true)
  const [playingTrack, setPlayingTrack] = useState<string | null>(null)
  const { toast } = useToast()

  // Fetch user's music library
  useEffect(() => {
    const fetchLibrary = async () => {
      try {
        setIsLoading(true)

        // In production, this would fetch from your API
        const response = await fetch(`/api/library/music${userId ? `?userId=${userId}` : ""}`)

        if (response.ok) {
          const data = await response.json()
          setTracks(data.tracks || [])
        } else {
          // Fallback to demo data
          const demoTracks: GeneratedMusic[] = [
            {
              id: "track-1",
              title: "Sunset Dreams",
              audioUrl: "https://samplelib.com/lib/preview/mp3/sample-15s.mp3",
              genre: "Ambient",
              mood: "Relaxing",
              duration: 240,
              createdAt: new Date("2024-01-15"),
              plays: 1250,
              likes: 89,
            },
            {
              id: "track-2",
              title: "Electric Nights",
              audioUrl: "https://samplelib.com/lib/preview/mp3/sample-9s.mp3",
              genre: "Electronic",
              mood: "Energetic",
              duration: 180,
              createdAt: new Date("2024-01-10"),
              plays: 2100,
              likes: 156,
            },
            {
              id: "track-3",
              title: "Morning Coffee",
              audioUrl: "https://samplelib.com/lib/preview/mp3/sample-12s.mp3",
              genre: "Lo-Fi",
              mood: "Calm",
              duration: 200,
              createdAt: new Date("2024-01-08"),
              plays: 890,
              likes: 67,
            },
          ]
          setTracks(demoTracks)
        }
      } catch (error) {
        console.error("Error fetching library:", error)
        toast({
          title: "Error",
          description: "Failed to load music library",
          variant: "destructive",
        })
      } finally {
        setIsLoading(false)
      }
    }

    fetchLibrary()
  }, [userId, toast])

  // Filter and sort tracks
  useEffect(() => {
    let filtered = tracks

    // Apply search filter
    if (searchQuery) {
      filtered = filtered.filter(
        (track) =>
          track.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
          track.genre.toLowerCase().includes(searchQuery.toLowerCase()) ||
          track.mood.toLowerCase().includes(searchQuery.toLowerCase()),
      )
    }

    // Apply genre filter
    if (selectedGenre !== "all") {
      filtered = filtered.filter((track) => track.genre.toLowerCase() === selectedGenre.toLowerCase())
    }

    // Apply sorting
    filtered = [...filtered].sort((a, b) => {
      switch (sortBy) {
        case "recent":
          return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
        case "popular":
          return (b.plays || 0) - (a.plays || 0)
        case "duration":
          return b.duration - a.duration
        default:
          return 0
      }
    })

    setFilteredTracks(filtered)
  }, [tracks, searchQuery, selectedGenre, sortBy])

  const genres = ["all", ...Array.from(new Set(tracks.map((track) => track.genre)))]

  const handleDownload = async (track: GeneratedMusic) => {
    try {
      // In production, this would trigger a download from your storage
      const response = await fetch(`/api/download/music/${track.id}`)
      if (response.ok) {
        const blob = await response.blob()
        const url = window.URL.createObjectURL(blob)
        const a = document.createElement("a")
        a.href = url
        a.download = `${track.title}.mp3`
        document.body.appendChild(a)
        a.click()
        window.URL.revokeObjectURL(url)
        document.body.removeChild(a)
      }
    } catch (error) {
      toast({
        title: "Download failed",
        description: "Unable to download track. Please try again.",
        variant: "destructive",
      })
    }
  }

  const handleShare = async (track: GeneratedMusic) => {
    try {
      if (navigator.share) {
        await navigator.share({
          title: track.title,
          text: `Check out this AI-generated track: ${track.title}`,
          url: window.location.href,
        })
      } else {
        // Fallback: copy to clipboard
        await navigator.clipboard.writeText(window.location.href)
        toast({
          title: "Link copied",
          description: "Track link copied to clipboard",
        })
      }
    } catch (error) {
      console.error("Share failed:", error)
    }
  }

  const handleLike = async (track: GeneratedMusic) => {
    try {
      const response = await fetch(`/api/tracks/${track.id}/like`, {
        method: "POST",
      })

      if (response.ok) {
        // Update local state
        setTracks((prev) => prev.map((t) => (t.id === track.id ? { ...t, likes: (t.likes || 0) + 1 } : t)))

        toast({
          title: "Liked!",
          description: "Added to your favorites",
        })
      }
    } catch (error) {
      console.error("Like failed:", error)
    }
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center space-y-4">
          <Music className="h-12 w-12 animate-pulse text-primary mx-auto" />
          <p>Loading your music library...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col space-y-4">
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
            <Input
              placeholder="Search tracks, genres, or moods..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>
          <div className="flex gap-2">
            <select
              value={selectedGenre}
              onChange={(e) => setSelectedGenre(e.target.value)}
              className="px-3 py-2 border rounded-md bg-background"
            >
              {genres.map((genre) => (
                <option key={genre} value={genre}>
                  {genre === "all" ? "All Genres" : genre}
                </option>
              ))}
            </select>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as any)}
              className="px-3 py-2 border rounded-md bg-background"
            >
              <option value="recent">Most Recent</option>
              <option value="popular">Most Popular</option>
              <option value="duration">Longest</option>
            </select>
          </div>
        </div>

        <div className="flex items-center gap-4 text-sm text-muted-foreground">
          <span>{filteredTracks.length} tracks</span>
          <span>•</span>
          <span>{Math.round(filteredTracks.reduce((acc, track) => acc + track.duration, 0) / 60)} minutes total</span>
        </div>
      </div>

      <Tabs defaultValue="grid" className="w-full">
        <TabsList>
          <TabsTrigger value="grid">Grid View</TabsTrigger>
          <TabsTrigger value="list">List View</TabsTrigger>
        </TabsList>

        <TabsContent value="grid" className="mt-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredTracks.map((track) => (
              <Card key={track.id} className="group hover:shadow-lg transition-shadow">
                <CardHeader className="pb-2">
                  <div className="flex justify-between items-start">
                    <CardTitle className="text-lg truncate">{track.title}</CardTitle>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => handleLike(track)}
                      className="opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                      <Heart className="h-4 w-4" />
                    </Button>
                  </div>
                  <div className="flex gap-2">
                    <Badge variant="outline">{track.genre}</Badge>
                    <Badge variant="outline">{track.mood}</Badge>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  {playingTrack === track.id ? (
                    <AudioPlayer audioUrl={track.audioUrl} title={track.title} musicId={track.id} />
                  ) : (
                    <div
                      className="bg-primary/10 rounded-md p-4 flex items-center justify-center cursor-pointer hover:bg-primary/20 transition-colors"
                      onClick={() => setPlayingTrack(track.id)}
                    >
                      <Play className="h-8 w-8 text-primary" />
                    </div>
                  )}

                  <div className="flex items-center justify-between text-sm text-muted-foreground">
                    <span className="flex items-center gap-1">
                      <Clock className="h-3 w-3" />
                      {Math.floor(track.duration / 60)}:{(track.duration % 60).toString().padStart(2, "0")}
                    </span>
                    <span className="flex items-center gap-1">
                      <Calendar className="h-3 w-3" />
                      {track.createdAt.toLocaleDateString()}
                    </span>
                  </div>

                  <div className="flex items-center justify-between text-sm">
                    <span>{track.plays?.toLocaleString() || 0} plays</span>
                    <span>{track.likes?.toLocaleString() || 0} likes</span>
                  </div>

                  <div className="flex gap-2">
                    <Button variant="outline" size="sm" onClick={() => handleDownload(track)}>
                      <Download className="h-3 w-3 mr-1" />
                      Download
                    </Button>
                    <Button variant="outline" size="sm" onClick={() => handleShare(track)}>
                      <Share2 className="h-3 w-3 mr-1" />
                      Share
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="list" className="mt-6">
          <div className="space-y-2">
            {filteredTracks.map((track, index) => (
              <Card key={track.id} className="p-4">
                <div className="flex items-center gap-4">
                  <div className="text-sm text-muted-foreground w-8">{index + 1}</div>

                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => setPlayingTrack(playingTrack === track.id ? null : track.id)}
                  >
                    <Play className="h-4 w-4" />
                  </Button>

                  <div className="flex-1 min-w-0">
                    <h3 className="font-medium truncate">{track.title}</h3>
                    <div className="flex gap-2 mt-1">
                      <Badge variant="outline" className="text-xs">
                        {track.genre}
                      </Badge>
                      <Badge variant="outline" className="text-xs">
                        {track.mood}
                      </Badge>
                    </div>
                  </div>

                  <div className="text-sm text-muted-foreground">
                    {Math.floor(track.duration / 60)}:{(track.duration % 60).toString().padStart(2, "0")}
                  </div>

                  <div className="text-sm text-muted-foreground">{track.plays?.toLocaleString() || 0} plays</div>

                  <div className="flex gap-1">
                    <Button variant="ghost" size="icon" onClick={() => handleDownload(track)}>
                      <Download className="h-4 w-4" />
                    </Button>
                    <Button variant="ghost" size="icon" onClick={() => handleShare(track)}>
                      <Share2 className="h-4 w-4" />
                    </Button>
                    <Button variant="ghost" size="icon" onClick={() => handleLike(track)}>
                      <Heart className="h-4 w-4" />
                    </Button>
                  </div>
                </div>

                {playingTrack === track.id && (
                  <div className="mt-4 pt-4 border-t">
                    <AudioPlayer audioUrl={track.audioUrl} title={track.title} musicId={track.id} />
                  </div>
                )}
              </Card>
            ))}
          </div>
        </TabsContent>
      </Tabs>

      {filteredTracks.length === 0 && (
        <Card className="flex flex-col items-center justify-center p-8 min-h-[300px]">
          <Music className="h-16 w-16 text-muted-foreground mb-4" />
          <h3 className="text-xl font-medium mb-2">No tracks found</h3>
          <p className="text-muted-foreground text-center max-w-md">
            {searchQuery || selectedGenre !== "all"
              ? "Try adjusting your search or filters"
              : "Start creating music to build your library"}
          </p>
        </Card>
      )}
    </div>
  )
}
