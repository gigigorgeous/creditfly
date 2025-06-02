"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import { Music2, Film, PlayCircle, Download, Share2, MoreHorizontal, PlusCircle } from "lucide-react"
import type { GeneratedMusic, GeneratedVideo } from "./music-video-creator"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { DjInterface } from "./dj-interface"
import { AudioPlayer } from "./audio-player"

interface DashboardProps {
  generatedMusic: GeneratedMusic[]
  generatedVideos: GeneratedVideo[]
  onSelectMusic: (music: GeneratedMusic) => void
  onSwitchToVideo: () => void
  onTrackPlay?: (songId: string) => void
}

export function Dashboard({
  generatedMusic,
  generatedVideos,
  onSelectMusic,
  onSwitchToVideo,
  onTrackPlay,
}: DashboardProps) {
  const [activeTab, setActiveTab] = useState("music")
  const [expandedMusicId, setExpandedMusicId] = useState<string | null>(null)

  const handleCreateVideo = (music: GeneratedMusic) => {
    onSelectMusic(music)
    onSwitchToVideo()
  }

  const toggleExpandMusic = (musicId: string) => {
    if (expandedMusicId === musicId) {
      setExpandedMusicId(null)
    } else {
      setExpandedMusicId(musicId)
      // Track play when expanding to listen
      onTrackPlay?.(musicId)
    }
  }

  return (
    <div className="container py-6 space-y-6">
      <div className="flex flex-col space-y-2">
        <h2 className="text-2xl font-bold tracking-tight">Dashboard</h2>
        <p className="text-muted-foreground">Manage your generated music and videos</p>
      </div>

      <DjInterface />

      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="music" className="flex items-center gap-2">
            <Music2 className="h-4 w-4" />
            <span>Music</span>
            {generatedMusic.length > 0 && (
              <Badge variant="secondary" className="ml-1">
                {generatedMusic.length}
              </Badge>
            )}
          </TabsTrigger>
          <TabsTrigger value="videos" className="flex items-center gap-2">
            <Film className="h-4 w-4" />
            <span>Videos</span>
            {generatedVideos.length > 0 && (
              <Badge variant="secondary" className="ml-1">
                {generatedVideos.length}
              </Badge>
            )}
          </TabsTrigger>
        </TabsList>

        <TabsContent value="music" className="mt-6">
          {generatedMusic.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {generatedMusic.map((music) => (
                <Card key={music.id}>
                  <CardHeader className="pb-2">
                    <div className="flex justify-between items-start">
                      <CardTitle className="text-lg">{music.title}</CardTitle>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon" className="h-8 w-8">
                            <MoreHorizontal className="h-4 w-4" />
                            <span className="sr-only">Options</span>
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem>
                            <Download className="h-4 w-4 mr-2" />
                            <span>Download</span>
                          </DropdownMenuItem>
                          <DropdownMenuItem>
                            <Share2 className="h-4 w-4 mr-2" />
                            <span>Share</span>
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>
                    <CardDescription>Created {music.createdAt.toLocaleDateString()}</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="flex gap-2 mb-4">
                      <Badge variant="outline">{music.genre}</Badge>
                      <Badge variant="outline">{music.mood}</Badge>
                      <Badge variant="outline">
                        {`${Math.floor(music.duration / 60)}:${(music.duration % 60).toString().padStart(2, "0")}`}
                      </Badge>
                    </div>

                    {expandedMusicId === music.id ? (
                      <AudioPlayer
                        audioUrl={music.audioUrl}
                        title={music.title}
                        musicId={music.id}
                        onPlay={() => onTrackPlay?.(music.id)}
                      />
                    ) : (
                      <div
                        className="bg-primary/10 rounded-md p-4 flex items-center justify-center cursor-pointer"
                        onClick={() => toggleExpandMusic(music.id)}
                      >
                        <Button variant="ghost" size="icon" className="h-12 w-12 text-primary">
                          <PlayCircle className="h-12 w-12" />
                        </Button>
                      </div>
                    )}
                  </CardContent>
                  <CardFooter>
                    <Button variant="outline" className="w-full" onClick={() => handleCreateVideo(music)}>
                      <Film className="h-4 w-4 mr-2" />
                      <span>Create Video</span>
                    </Button>
                  </CardFooter>
                </Card>
              ))}
            </div>
          ) : (
            <Card className="flex flex-col items-center justify-center p-6 min-h-[300px]">
              <div className="text-center space-y-4">
                <Music2 className="h-16 w-16 text-primary/30 mx-auto" />
                <h3 className="text-xl font-medium">No Music Generated Yet</h3>
                <p className="text-muted-foreground max-w-md">
                  Start creating original music with AI across various genres and styles
                </p>
                <Button variant="default" onClick={() => (window.location.href = "/music")}>
                  <PlusCircle className="h-4 w-4 mr-2" />
                  <span>Create Music</span>
                </Button>
              </div>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="videos" className="mt-6">
          {generatedVideos.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {generatedVideos.map((video) => (
                <Card key={video.id}>
                  <CardHeader className="pb-2">
                    <div className="flex justify-between items-start">
                      <CardTitle className="text-lg">{video.title}</CardTitle>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon" className="h-8 w-8">
                            <MoreHorizontal className="h-4 w-4" />
                            <span className="sr-only">Options</span>
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem>
                            <Download className="h-4 w-4 mr-2" />
                            <span>Download</span>
                          </DropdownMenuItem>
                          <DropdownMenuItem>
                            <Share2 className="h-4 w-4 mr-2" />
                            <span>Share</span>
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>
                    <CardDescription>Created {video.createdAt.toLocaleDateString()}</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="flex gap-2 mb-4">
                      <Badge variant="outline">{video.style}</Badge>
                    </div>
                    <div className="aspect-video bg-black/20 rounded-md flex items-center justify-center overflow-hidden">
                      <img
                        src={video.thumbnailUrl || "/placeholder.svg"}
                        alt={video.title}
                        className="w-full h-full object-cover"
                      />
                      <Button variant="ghost" size="icon" className="h-16 w-16 text-primary absolute">
                        <PlayCircle className="h-16 w-16" />
                      </Button>
                    </div>
                  </CardContent>
                  <CardFooter className="flex justify-between">
                    <Button variant="outline">
                      <Download className="h-4 w-4 mr-2" />
                      <span>Download</span>
                    </Button>
                    <Button variant="outline">
                      <Share2 className="h-4 w-4 mr-2" />
                      <span>Share</span>
                    </Button>
                  </CardFooter>
                </Card>
              ))}
            </div>
          ) : (
            <Card className="flex flex-col items-center justify-center p-6 min-h-[300px]">
              <div className="text-center space-y-4">
                <Film className="h-16 w-16 text-primary/30 mx-auto" />
                <h3 className="text-xl font-medium">No Videos Generated Yet</h3>
                <p className="text-muted-foreground max-w-md">
                  Create music first, then generate videos that match your music
                </p>
                <Button variant="default" onClick={() => (window.location.href = "/music")}>
                  <PlusCircle className="h-4 w-4 mr-2" />
                  <span>Create Music</span>
                </Button>
              </div>
            </Card>
          )}
        </TabsContent>
      </Tabs>
    </div>
  )
}
