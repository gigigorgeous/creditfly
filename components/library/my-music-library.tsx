"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Checkbox } from "@/components/ui/checkbox"
import { AudioPlayer } from "../audio-player"
import { FileManager } from "./file-manager"
import { MusicUploader } from "./music-uploader"
import {
  Search,
  Music,
  Clock,
  Calendar,
  Play,
  Download,
  Share2,
  Heart,
  MoreVertical,
  Grid3X3,
  List,
  Upload,
  Trash2,
  FolderOpen,
  SortAsc,
  Filter,
  Star,
  Headphones,
} from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import { useAuth } from "@/context/auth-context"
import type { GeneratedMusic } from "../music-video-creator"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"

interface MusicStats {
  totalTracks: number
  totalDuration: number
  totalPlays: number
  totalLikes: number
  storageUsed: string
  favoriteGenre: string
}

export function MyMusicLibrary() {
  const [tracks, setTracks] = useState<GeneratedMusic[]>([])
  const [filteredTracks, setFilteredTracks] = useState<GeneratedMusic[]>([])
  const [selectedTracks, setSelectedTracks] = useState<Set<string>>(new Set())
  const [searchQuery, setSearchQuery] = useState("")
  const [selectedGenre, setSelectedGenre] = useState<string>("all")
  const [sortBy, setSortBy] = useState<"recent" | "popular" | "duration" | "alphabetical">("recent")
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid")
  const [isLoading, setIsLoading] = useState(true)
  const [playingTrack, setPlayingTrack] = useState<string | null>(null)
  const [showUploader, setShowUploader] = useState(false)
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [trackToDelete, setTrackToDelete] = useState<string | null>(null)
  const [stats, setStats] = useState<MusicStats | null>(null)
  const { toast } = useToast()
  const { user } = useAuth()

  // Fetch user's music library
  useEffect(() => {
    const fetchLibrary = async () => {
      if (!user?.id) return

      try {
        setIsLoading(true)

        const response = await fetch(`/api/library/music?userId=${user.id}&limit=100`)

        if (response.ok) {
          const data = await response.json()
          const musicTracks = data.tracks.map((track: any) => ({
            ...track,
            createdAt: new Date(track.createdAt),
            musicDescription:
              typeof track.musicDescription === "string" ? JSON.parse(track.musicDescription) : track.musicDescription,
          }))
          setTracks(musicTracks)
        } else {
          // Demo data for preview
          const demoTracks: GeneratedMusic[] = [
            {
              id: "track-1",
              title: "Sunset Dreams",
              audioUrl: "https://samplelib.com/lib/preview/mp3/sample-15s.mp3",
              blobUrl: "https://example.blob.vercel-storage.com/music/track-1/sunset-dreams.mp3",
              genre: "Ambient",
              mood: "Relaxing",
              duration: 240,
              createdAt: new Date("2024-01-15"),
              plays: 1250,
              likes: 89,
              aiGenerated: true,
              isFavorite: true,
            },
            {
              id: "track-2",
              title: "Electric Nights",
              audioUrl: "https://samplelib.com/lib/preview/mp3/sample-9s.mp3",
              blobUrl: "https://example.blob.vercel-storage.com/music/track-2/electric-nights.mp3",
              genre: "Electronic",
              mood: "Energetic",
              duration: 180,
              createdAt: new Date("2024-01-10"),
              plays: 2100,
              likes: 156,
              aiGenerated: true,
              isFavorite: false,
            },
            {
              id: "track-3",
              title: "Morning Coffee",
              audioUrl: "https://samplelib.com/lib/preview/mp3/sample-12s.mp3",
              blobUrl: "https://example.blob.vercel-storage.com/music/track-3/morning-coffee.mp3",
              genre: "Lo-Fi",
              mood: "Calm",
              duration: 200,
              createdAt: new Date("2024-01-08"),
              plays: 890,
              likes: 67,
              aiGenerated: true,
              isFavorite: true,
            },
          ]
          setTracks(demoTracks)
        }

        // Fetch user stats
        const statsResponse = await fetch(`/api/user/${user.id}/music-stats`)
        if (statsResponse.ok) {
          const statsData = await statsResponse.json()
          setStats(statsData)
        } else {
          // Demo stats
          setStats({
            totalTracks: 3,
            totalDuration: 620,
            totalPlays: 4240,
            totalLikes: 312,
            storageUsed: "15.2 MB",
            favoriteGenre: "Electronic",
          })
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
  }, [user?.id, toast])

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
        case "alphabetical":
          return a.title.localeCompare(b.title)
        default:
          return 0
      }
    })

    setFilteredTracks(filtered)
  }, [tracks, searchQuery, selectedGenre, sortBy])

  const genres = ["all", ...Array.from(new Set(tracks.map((track) => track.genre)))]

  const handleSelectTrack = (trackId: string, selected: boolean) => {
    const newSelected = new Set(selectedTracks)
    if (selected) {
      newSelected.add(trackId)
    } else {
      newSelected.delete(trackId)
    }
    setSelectedTracks(newSelected)
  }

  const handleSelectAll = (selected: boolean) => {
    if (selected) {
      setSelectedTracks(new Set(filteredTracks.map((track) => track.id)))
    } else {
      setSelectedTracks(new Set())
    }
  }

  const handleDownload = async (track: GeneratedMusic) => {
    try {
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

        toast({
          title: "Download Started",
          description: `Downloading "${track.title}"`,
        })
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
          url: `${window.location.origin}/track/${track.id}`,
        })
      } else {
        await navigator.clipboard.writeText(`${window.location.origin}/track/${track.id}`)
        toast({
          title: "Link copied",
          description: "Track link copied to clipboard",
        })
      }
    } catch (error) {
      console.error("Share failed:", error)
    }
  }

  const handleToggleFavorite = async (track: GeneratedMusic) => {
    try {
      const response = await fetch(`/api/tracks/${track.id}/favorite`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ favorite: !track.isFavorite }),
      })

      if (response.ok) {
        setTracks((prev) => prev.map((t) => (t.id === track.id ? { ...t, isFavorite: !t.isFavorite } : t)))

        toast({
          title: track.isFavorite ? "Removed from favorites" : "Added to favorites",
          description: `"${track.title}" ${track.isFavorite ? "removed from" : "added to"} your favorites`,
        })
      }
    } catch (error) {
      console.error("Toggle favorite failed:", error)
    }
  }

  const handleDeleteTrack = async (trackId: string) => {
    try {
      const response = await fetch(`/api/tracks/${trackId}`, {
        method: "DELETE",
      })

      if (response.ok) {
        setTracks((prev) => prev.filter((t) => t.id !== trackId))
        setSelectedTracks((prev) => {
          const newSet = new Set(prev)
          newSet.delete(trackId)
          return newSet
        })

        toast({
          title: "Track deleted",
          description: "Track has been permanently deleted",
        })
      }
    } catch (error) {
      toast({
        title: "Delete failed",
        description: "Unable to delete track. Please try again.",
        variant: "destructive",
      })
    }
  }

  const handleBulkDelete = async () => {
    if (selectedTracks.size === 0) return

    try {
      const response = await fetch("/api/tracks/bulk-delete", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ trackIds: Array.from(selectedTracks) }),
      })

      if (response.ok) {
        setTracks((prev) => prev.filter((t) => !selectedTracks.has(t.id)))
        setSelectedTracks(new Set())

        toast({
          title: "Tracks deleted",
          description: `${selectedTracks.size} tracks have been deleted`,
        })
      }
    } catch (error) {
      toast({
        title: "Bulk delete failed",
        description: "Unable to delete selected tracks. Please try again.",
        variant: "destructive",
      })
    }
  }

  const formatDuration = (seconds: number) => {
    const minutes = Math.floor(seconds / 60)
    const remainingSeconds = seconds % 60
    return `${minutes}:${remainingSeconds.toString().padStart(2, "0")}`
  }

  const formatTotalDuration = (seconds: number) => {
    const hours = Math.floor(seconds / 3600)
    const minutes = Math.floor((seconds % 3600) / 60)
    if (hours > 0) {
      return `${hours}h ${minutes}m`
    }
    return `${minutes}m`
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
      {/* Header */}
      <div className="flex flex-col space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">My Music</h1>
            <p className="text-muted-foreground">Manage and organize your AI-generated music collection</p>
          </div>
          <Button onClick={() => setShowUploader(true)}>
            <Upload className="h-4 w-4 mr-2" />
            Upload Music
          </Button>
        </div>

        {/* Stats Cards */}
        {stats && (
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center space-x-2">
                  <Music className="h-4 w-4 text-primary" />
                  <div>
                    <p className="text-2xl font-bold">{stats.totalTracks}</p>
                    <p className="text-xs text-muted-foreground">Tracks</p>
                  </div>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center space-x-2">
                  <Clock className="h-4 w-4 text-primary" />
                  <div>
                    <p className="text-2xl font-bold">{formatTotalDuration(stats.totalDuration)}</p>
                    <p className="text-xs text-muted-foreground">Duration</p>
                  </div>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center space-x-2">
                  <Headphones className="h-4 w-4 text-primary" />
                  <div>
                    <p className="text-2xl font-bold">{stats.totalPlays.toLocaleString()}</p>
                    <p className="text-xs text-muted-foreground">Plays</p>
                  </div>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center space-x-2">
                  <Heart className="h-4 w-4 text-primary" />
                  <div>
                    <p className="text-2xl font-bold">{stats.totalLikes.toLocaleString()}</p>
                    <p className="text-xs text-muted-foreground">Likes</p>
                  </div>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center space-x-2">
                  <FolderOpen className="h-4 w-4 text-primary" />
                  <div>
                    <p className="text-2xl font-bold">{stats.storageUsed}</p>
                    <p className="text-xs text-muted-foreground">Storage</p>
                  </div>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center space-x-2">
                  <Star className="h-4 w-4 text-primary" />
                  <div>
                    <p className="text-2xl font-bold">{stats.favoriteGenre}</p>
                    <p className="text-xs text-muted-foreground">Top Genre</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        )}
      </div>

      {/* Controls */}
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
            <Select value={selectedGenre} onValueChange={setSelectedGenre}>
              <SelectTrigger className="w-[140px]">
                <Filter className="h-4 w-4 mr-2" />
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {genres.map((genre) => (
                  <SelectItem key={genre} value={genre}>
                    {genre === "all" ? "All Genres" : genre}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select value={sortBy} onValueChange={(value: any) => setSortBy(value)}>
              <SelectTrigger className="w-[140px]">
                <SortAsc className="h-4 w-4 mr-2" />
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="recent">Most Recent</SelectItem>
                <SelectItem value="popular">Most Popular</SelectItem>
                <SelectItem value="duration">Longest</SelectItem>
                <SelectItem value="alphabetical">A-Z</SelectItem>
              </SelectContent>
            </Select>
            <div className="flex border rounded-md">
              <Button variant={viewMode === "grid" ? "default" : "ghost"} size="sm" onClick={() => setViewMode("grid")}>
                <Grid3X3 className="h-4 w-4" />
              </Button>
              <Button variant={viewMode === "list" ? "default" : "ghost"} size="sm" onClick={() => setViewMode("list")}>
                <List className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>

        {/* Bulk Actions */}
        {selectedTracks.size > 0 && (
          <div className="flex items-center gap-4 p-4 bg-muted rounded-lg">
            <span className="text-sm font-medium">{selectedTracks.size} tracks selected</span>
            <div className="flex gap-2">
              <Button variant="outline" size="sm" onClick={handleBulkDelete}>
                <Trash2 className="h-4 w-4 mr-2" />
                Delete Selected
              </Button>
              <Button variant="outline" size="sm" onClick={() => setSelectedTracks(new Set())}>
                Clear Selection
              </Button>
            </div>
          </div>
        )}

        <div className="flex items-center justify-between text-sm text-muted-foreground">
          <div className="flex items-center gap-4">
            <span>{filteredTracks.length} tracks</span>
            <span>•</span>
            <span>{formatTotalDuration(filteredTracks.reduce((acc, track) => acc + track.duration, 0))} total</span>
          </div>
          <div className="flex items-center gap-2">
            <Checkbox
              checked={selectedTracks.size === filteredTracks.length && filteredTracks.length > 0}
              onCheckedChange={handleSelectAll}
            />
            <span>Select all</span>
          </div>
        </div>
      </div>

      {/* Music Grid/List */}
      <Tabs value="music" className="w-full">
        <TabsList>
          <TabsTrigger value="music">Music Library</TabsTrigger>
          <TabsTrigger value="files">File Manager</TabsTrigger>
        </TabsList>

        <TabsContent value="music" className="mt-6">
          {viewMode === "grid" ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
              {filteredTracks.map((track) => (
                <Card key={track.id} className="group hover:shadow-lg transition-shadow">
                  <CardHeader className="pb-2">
                    <div className="flex justify-between items-start">
                      <div className="flex items-center gap-2">
                        <Checkbox
                          checked={selectedTracks.has(track.id)}
                          onCheckedChange={(checked) => handleSelectTrack(track.id, checked as boolean)}
                        />
                        <CardTitle className="text-lg truncate flex-1">{track.title}</CardTitle>
                      </div>
                      <div className="flex items-center gap-1">
                        {track.isFavorite && <Star className="h-4 w-4 text-yellow-500 fill-current" />}
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon" className="h-8 w-8">
                              <MoreVertical className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem onClick={() => handleToggleFavorite(track)}>
                              <Heart className="h-4 w-4 mr-2" />
                              {track.isFavorite ? "Remove from favorites" : "Add to favorites"}
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => handleDownload(track)}>
                              <Download className="h-4 w-4 mr-2" />
                              Download
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => handleShare(track)}>
                              <Share2 className="h-4 w-4 mr-2" />
                              Share
                            </DropdownMenuItem>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem
                              onClick={() => {
                                setTrackToDelete(track.id)
                                setDeleteDialogOpen(true)
                              }}
                              className="text-destructive"
                            >
                              <Trash2 className="h-4 w-4 mr-2" />
                              Delete
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </div>
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
                        {formatDuration(track.duration)}
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
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            <div className="space-y-2">
              {filteredTracks.map((track, index) => (
                <Card key={track.id} className="p-4">
                  <div className="flex items-center gap-4">
                    <Checkbox
                      checked={selectedTracks.has(track.id)}
                      onCheckedChange={(checked) => handleSelectTrack(track.id, checked as boolean)}
                    />
                    <div className="text-sm text-muted-foreground w-8">{index + 1}</div>

                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => setPlayingTrack(playingTrack === track.id ? null : track.id)}
                    >
                      <Play className="h-4 w-4" />
                    </Button>

                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <h3 className="font-medium truncate">{track.title}</h3>
                        {track.isFavorite && <Star className="h-4 w-4 text-yellow-500 fill-current" />}
                      </div>
                      <div className="flex gap-2 mt-1">
                        <Badge variant="outline" className="text-xs">
                          {track.genre}
                        </Badge>
                        <Badge variant="outline" className="text-xs">
                          {track.mood}
                        </Badge>
                      </div>
                    </div>

                    <div className="text-sm text-muted-foreground">{formatDuration(track.duration)}</div>

                    <div className="text-sm text-muted-foreground">{track.plays?.toLocaleString() || 0} plays</div>

                    <div className="flex gap-1">
                      <Button variant="ghost" size="icon" onClick={() => handleToggleFavorite(track)}>
                        <Heart className={`h-4 w-4 ${track.isFavorite ? "text-red-500 fill-current" : ""}`} />
                      </Button>
                      <Button variant="ghost" size="icon" onClick={() => handleDownload(track)}>
                        <Download className="h-4 w-4" />
                      </Button>
                      <Button variant="ghost" size="icon" onClick={() => handleShare(track)}>
                        <Share2 className="h-4 w-4" />
                      </Button>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon">
                            <MoreVertical className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem onClick={() => handleDownload(track)}>
                            <Download className="h-4 w-4 mr-2" />
                            Download
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => handleShare(track)}>
                            <Share2 className="h-4 w-4 mr-2" />
                            Share
                          </DropdownMenuItem>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem
                            onClick={() => {
                              setTrackToDelete(track.id)
                              setDeleteDialogOpen(true)
                            }}
                            className="text-destructive"
                          >
                            <Trash2 className="h-4 w-4 mr-2" />
                            Delete
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
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
          )}

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
        </TabsContent>

        <TabsContent value="files" className="mt-6">
          <FileManager userId={user?.id} />
        </TabsContent>
      </Tabs>

      {/* Upload Modal */}
      {showUploader && (
        <MusicUploader
          onClose={() => setShowUploader(false)}
          onUploadComplete={(newTrack) => {
            setTracks((prev) => [newTrack, ...prev])
            setShowUploader(false)
            toast({
              title: "Upload Complete",
              description: `"${newTrack.title}" has been added to your library`,
            })
          }}
        />
      )}

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Track</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete this track? This action cannot be undone and will permanently remove the
              track from your library and storage.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => {
                if (trackToDelete) {
                  handleDeleteTrack(trackToDelete)
                  setTrackToDelete(null)
                }
                setDeleteDialogOpen(false)
              }}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}
