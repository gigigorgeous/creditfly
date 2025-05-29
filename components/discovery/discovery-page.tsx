"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Loader2, Music, Film, ThumbsUp, ThumbsDown, Play, Search, Filter } from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import type { GeneratedMusic, GeneratedVideo } from "../music-video-creator"

interface DiscoveryItem extends GeneratedMusic {
  username: string
  userAvatar: string | null
  likes: number
  dislikes: number
  plays: number
}

interface DiscoveryVideoItem extends GeneratedVideo {
  username: string
  userAvatar: string | null
  likes: number
  dislikes: number
  plays: number
}

export function DiscoveryPage() {
  const [activeTab, setActiveTab] = useState("trending")
  const [isLoading, setIsLoading] = useState(true)
  const [trendingMusic, setTrendingMusic] = useState<DiscoveryItem[]>([])
  const [trendingVideos, setTrendingVideos] = useState<DiscoveryVideoItem[]>([])
  const [searchQuery, setSearchQuery] = useState("")
  const [genreFilter, setGenreFilter] = useState("all")
  const { toast } = useToast()

  // Fetch trending content
  useEffect(() => {
    const fetchTrending = async () => {
      try {
        // In a real app, this would be an API call
        // For demo purposes, we'll simulate trending content
        await new Promise((resolve) => setTimeout(resolve, 1500)) // Simulate network delay

        // Demo trending music
        const demoTrendingMusic: DiscoveryItem[] = [
          {
            id: "trending-1",
            title: "Neon Dreams",
            audioUrl: "https://samplelib.com/lib/preview/mp3/sample-15s.mp3",
            genre: "Synthwave",
            mood: "Energetic",
            duration: 195,
            createdAt: new Date(),
            username: "SynthMaster",
            userAvatar: null,
            likes: 342,
            dislikes: 12,
            plays: 2145,
          },
          {
            id: "trending-2",
            title: "Ocean Waves",
            audioUrl: "https://samplelib.com/lib/preview/mp3/sample-9s.mp3",
            genre: "Ambient",
            mood: "Calm",
            duration: 210,
            createdAt: new Date(),
            username: "ChillVibes",
            userAvatar: null,
            likes: 287,
            dislikes: 5,
            plays: 1876,
          },
          {
            id: "trending-3",
            title: "Urban Jungle",
            audioUrl: "https://samplelib.com/lib/preview/mp3/sample-12s.mp3",
            genre: "Hip-Hop",
            mood: "Intense",
            duration: 180,
            createdAt: new Date(),
            username: "BeatMaker",
            userAvatar: null,
            likes: 256,
            dislikes: 18,
            plays: 1543,
          },
        ]

        // Demo trending videos
        const demoTrendingVideos: DiscoveryVideoItem[] = [
          {
            id: "trending-video-1",
            title: "Neon Dreams - Visual Experience",
            videoUrl: "/api/stream-video/trending1",
            thumbnailUrl: "/api/video-thumbnail/trending1",
            musicId: "trending-1",
            style: "Abstract Animation",
            createdAt: new Date(),
            username: "SynthMaster",
            userAvatar: null,
            likes: 198,
            dislikes: 7,
            plays: 1245,
          },
          {
            id: "trending-video-2",
            title: "Ocean Waves - Visual Journey",
            videoUrl: "/api/stream-video/trending2",
            thumbnailUrl: "/api/video-thumbnail/trending2",
            musicId: "trending-2",
            style: "Waveform Visualization",
            createdAt: new Date(),
            username: "ChillVibes",
            userAvatar: null,
            likes: 156,
            dislikes: 3,
            plays: 987,
          },
        ]

        setTrendingMusic(demoTrendingMusic)
        setTrendingVideos(demoTrendingVideos)
      } catch (error) {
        console.error("Error fetching trending content:", error)
        toast({
          title: "Error",
          description: "Failed to load trending content. Please try again.",
          variant: "destructive",
        })
      } finally {
        setIsLoading(false)
      }
    }

    fetchTrending()
  }, [toast])

  // Handle like/dislike
  const handleLike = (id: string, type: "music" | "video") => {
    if (type === "music") {
      setTrendingMusic((prev) => prev.map((item) => (item.id === id ? { ...item, likes: item.likes + 1 } : item)))
    } else {
      setTrendingVideos((prev) => prev.map((item) => (item.id === id ? { ...item, likes: item.likes + 1 } : item)))
    }

    toast({
      title: "Liked!",
      description: "Your like has been recorded.",
    })
  }

  const handleDislike = (id: string, type: "music" | "video") => {
    if (type === "music") {
      setTrendingMusic((prev) => prev.map((item) => (item.id === id ? { ...item, dislikes: item.dislikes + 1 } : item)))
    } else {
      setTrendingVideos((prev) =>
        prev.map((item) => (item.id === id ? { ...item, dislikes: item.dislikes + 1 } : item)),
      )
    }

    toast({
      title: "Disliked",
      description: "Your dislike has been recorded.",
    })
  }

  // Handle play
  const handlePlay = (id: string, type: "music" | "video") => {
    if (type === "music") {
      setTrendingMusic((prev) => prev.map((item) => (item.id === id ? { ...item, plays: item.plays + 1 } : item)))
    } else {
      setTrendingVideos((prev) => prev.map((item) => (item.id === id ? { ...item, plays: item.plays + 1 } : item)))
    }
  }

  // Filter content based on search and genre
  const filteredMusic = trendingMusic.filter((item) => {
    const matchesSearch =
      searchQuery === "" ||
      item.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.username.toLowerCase().includes(searchQuery.toLowerCase())

    const matchesGenre = genreFilter === "all" || item.genre === genreFilter

    return matchesSearch && matchesGenre
  })

  const filteredVideos = trendingVideos.filter((item) => {
    const matchesSearch =
      searchQuery === "" ||
      item.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.username.toLowerCase().includes(searchQuery.toLowerCase())

    return matchesSearch
  })

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    )
  }

  return (
    <div className="container py-6 space-y-6">
      <div className="flex flex-col space-y-2">
        <h2 className="text-2xl font-bold tracking-tight">Discover</h2>
        <p className="text-muted-foreground">Explore trending music and videos from the community</p>
      </div>

      <div className="flex flex-col md:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search by title or creator..."
            className="pl-10"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>

        <div className="w-full md:w-64">
          <Select value={genreFilter} onValueChange={setGenreFilter}>
            <SelectTrigger>
              <div className="flex items-center">
                <Filter className="mr-2 h-4 w-4" />
                <SelectValue placeholder="Filter by genre" />
              </div>
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Genres</SelectItem>
              <SelectItem value="Pop">Pop</SelectItem>
              <SelectItem value="Rock">Rock</SelectItem>
              <SelectItem value="Hip-Hop">Hip-Hop</SelectItem>
              <SelectItem value="Electronic">Electronic</SelectItem>
              <SelectItem value="Ambient">Ambient</SelectItem>
              <SelectItem value="Synthwave">Synthwave</SelectItem>
              <SelectItem value="Lo-Fi">Lo-Fi</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="trending" className="flex items-center gap-2">
            <Music className="h-4 w-4" />
            <span>Trending Music</span>
          </TabsTrigger>
          <TabsTrigger value="videos" className="flex items-center gap-2">
            <Film className="h-4 w-4" />
            <span>Trending Videos</span>
          </TabsTrigger>
        </TabsList>

        <TabsContent value="trending" className="mt-6">
          {filteredMusic.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {filteredMusic.map((music) => (
                <Card key={music.id}>
                  <CardHeader className="pb-2">
                    <div className="flex justify-between items-start">
                      <CardTitle className="text-lg">{music.title}</CardTitle>
                      <div className="flex items-center gap-1 text-sm text-muted-foreground">
                        <Play className="h-3 w-3" />
                        <span>{music.plays}</span>
                      </div>
                    </div>
                    <CardDescription className="flex items-center gap-2">
                      <Avatar className="h-5 w-5">
                        <AvatarImage src={music.userAvatar || ""} alt={music.username} />
                        <AvatarFallback className="text-xs">{music.username.charAt(0).toUpperCase()}</AvatarFallback>
                      </Avatar>
                      <span>{music.username}</span>
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="flex gap-2 mb-4">
                      <Badge variant="outline">{music.genre}</Badge>
                      <Badge variant="outline">{music.mood}</Badge>
                      <Badge variant="outline">
                        {`${Math.floor(music.duration / 60)}:${(music.duration % 60).toString().padStart(2, "0")}`}
                      </Badge>
                    </div>
                    <div
                      className="bg-primary/10 rounded-md p-4 flex items-center justify-center cursor-pointer"
                      onClick={() => handlePlay(music.id, "music")}
                    >
                      <Button variant="ghost" size="icon" className="h-12 w-12 text-primary">
                        <Play className="h-12 w-12" />
                      </Button>
                    </div>
                  </CardContent>
                  <CardFooter className="flex justify-between">
                    <div className="flex gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        className="flex items-center gap-1"
                        onClick={() => handleLike(music.id, "music")}
                      >
                        <ThumbsUp className="h-4 w-4" />
                        <span>{music.likes}</span>
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        className="flex items-center gap-1"
                        onClick={() => handleDislike(music.id, "music")}
                      >
                        <ThumbsDown className="h-4 w-4" />
                        <span>{music.dislikes}</span>
                      </Button>
                    </div>
                  </CardFooter>
                </Card>
              ))}
            </div>
          ) : (
            <Card className="flex flex-col items-center justify-center p-6 min-h-[200px]">
              <div className="text-center space-y-4">
                <Music className="h-16 w-16 text-primary/30 mx-auto" />
                <h3 className="text-xl font-medium">No Results Found</h3>
                <p className="text-muted-foreground max-w-md">
                  No music matches your search criteria. Try adjusting your filters.
                </p>
                <Button
                  variant="outline"
                  onClick={() => {
                    setSearchQuery("")
                    setGenreFilter("all")
                  }}
                >
                  Clear Filters
                </Button>
              </div>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="videos" className="mt-6">
          {filteredVideos.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {filteredVideos.map((video) => (
                <Card key={video.id}>
                  <CardHeader className="pb-2">
                    <div className="flex justify-between items-start">
                      <CardTitle className="text-lg">{video.title}</CardTitle>
                      <div className="flex items-center gap-1 text-sm text-muted-foreground">
                        <Play className="h-3 w-3" />
                        <span>{video.plays}</span>
                      </div>
                    </div>
                    <CardDescription className="flex items-center gap-2">
                      <Avatar className="h-5 w-5">
                        <AvatarImage src={video.userAvatar || ""} alt={video.username} />
                        <AvatarFallback className="text-xs">{video.username.charAt(0).toUpperCase()}</AvatarFallback>
                      </Avatar>
                      <span>{video.username}</span>
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="flex gap-2 mb-4">
                      <Badge variant="outline">{video.style}</Badge>
                    </div>
                    <div
                      className="aspect-video bg-black/20 rounded-md flex items-center justify-center overflow-hidden cursor-pointer"
                      onClick={() => handlePlay(video.id, "video")}
                    >
                      <img
                        src={video.thumbnailUrl || "/placeholder.svg"}
                        alt={video.title}
                        className="w-full h-full object-cover"
                      />
                      <Button variant="ghost" size="icon" className="h-16 w-16 text-primary absolute">
                        <Play className="h-16 w-16" />
                      </Button>
                    </div>
                  </CardContent>
                  <CardFooter className="flex justify-between">
                    <div className="flex gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        className="flex items-center gap-1"
                        onClick={() => handleLike(video.id, "video")}
                      >
                        <ThumbsUp className="h-4 w-4" />
                        <span>{video.likes}</span>
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        className="flex items-center gap-1"
                        onClick={() => handleDislike(video.id, "video")}
                      >
                        <ThumbsDown className="h-4 w-4" />
                        <span>{video.dislikes}</span>
                      </Button>
                    </div>
                  </CardFooter>
                </Card>
              ))}
            </div>
          ) : (
            <Card className="flex flex-col items-center justify-center p-6 min-h-[200px]">
              <div className="text-center space-y-4">
                <Film className="h-16 w-16 text-primary/30 mx-auto" />
                <h3 className="text-xl font-medium">No Results Found</h3>
                <p className="text-muted-foreground max-w-md">
                  No videos match your search criteria. Try adjusting your search.
                </p>
                <Button variant="outline" onClick={() => setSearchQuery("")}>
                  Clear Search
                </Button>
              </div>
            </Card>
          )}
        </TabsContent>
      </Tabs>
    </div>
  )
}
