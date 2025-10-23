"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Slider } from "@/components/ui/slider"
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { PlusCircle, Music, Video, Volume2, Mic } from "lucide-react"
import { cn } from "@/lib/utils"
import Link from "next/link"

interface Track {
  id: string
  title: string
  audioUrl: string
  genre: string
  createdAt: string
}

export function MusicInterface() {
  const [activeTab, setActiveTab] = useState("fx")
  const [volume, setVolume] = useState(75)
  const [selectedGenre, setSelectedGenre] = useState("pop")
  const [tracks, setTracks] = useState<Track[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [activeEffects, setActiveEffects] = useState<string[]>([])

  // Fetch tracks on component mount
  useEffect(() => {
    const fetchTracks = async () => {
      try {
        // In a real app, you would fetch from your API
        // For now, we'll just set an empty array
        setTracks([])
      } catch (error) {
        console.error("Error fetching tracks:", error)
      }
    }

    fetchTracks()
  }, [])

  const toggleEffect = (effect: string) => {
    if (activeEffects.includes(effect)) {
      setActiveEffects(activeEffects.filter((e) => e !== effect))
    } else {
      setActiveEffects([...activeEffects, effect])
    }
  }

  const handleCreateMusic = () => {
    // Navigate to music creation page
    window.location.href = "/create-music"
  }

  return (
    <div className="flex flex-col w-full h-full bg-black text-white">
      {/* Main content area */}
      <div className="flex flex-col md:flex-row w-full h-full">
        {/* Left panel */}
        <div className="w-full md:w-1/2 p-4 border-r border-purple-900">
          <div className="bg-gray-900 rounded-lg p-4 mb-4">
            <Tabs value={activeTab} onValueChange={setActiveTab}>
              <TabsList className="mb-4 bg-gray-800">
                <TabsTrigger value="fx" className={activeTab === "fx" ? "bg-purple-700" : ""}>
                  FX
                </TabsTrigger>
                <TabsTrigger value="eq" className={activeTab === "eq" ? "bg-purple-700" : ""}>
                  EQ
                </TabsTrigger>
                <TabsTrigger value="loop" className={activeTab === "loop" ? "bg-purple-700" : ""}>
                  Loop
                </TabsTrigger>
                <TabsTrigger value="cue" className={activeTab === "cue" ? "bg-purple-700" : ""}>
                  Cue
                </TabsTrigger>
              </TabsList>

              <TabsContent value="fx">
                <div className="grid grid-cols-2 gap-4 mb-4">
                  <Button
                    variant="outline"
                    className={cn(
                      "h-14 text-lg",
                      activeEffects.includes("reverb") ? "bg-purple-700" : "bg-gray-800 hover:bg-gray-700",
                    )}
                    onClick={() => toggleEffect("reverb")}
                  >
                    Reverb
                  </Button>
                  <Button
                    variant="outline"
                    className={cn(
                      "h-14 text-lg",
                      activeEffects.includes("delay") ? "bg-purple-700" : "bg-gray-800 hover:bg-gray-700",
                    )}
                    onClick={() => toggleEffect("delay")}
                  >
                    Delay
                  </Button>
                  <Button
                    variant="outline"
                    className={cn(
                      "h-14 text-lg",
                      activeEffects.includes("filter") ? "bg-purple-700" : "bg-gray-800 hover:bg-gray-700",
                    )}
                    onClick={() => toggleEffect("filter")}
                  >
                    Filter
                  </Button>
                  <Button
                    variant="outline"
                    className={cn(
                      "h-14 text-lg",
                      activeEffects.includes("flanger") ? "bg-purple-700" : "bg-gray-800 hover:bg-gray-700",
                    )}
                    onClick={() => toggleEffect("flanger")}
                  >
                    Flanger
                  </Button>
                </div>
              </TabsContent>

              <TabsContent value="eq">
                <div className="p-4 text-center text-gray-400">Equalizer controls will appear here</div>
              </TabsContent>

              <TabsContent value="loop">
                <div className="p-4 text-center text-gray-400">Loop controls will appear here</div>
              </TabsContent>

              <TabsContent value="cue">
                <div className="p-4 text-center text-gray-400">Cue controls will appear here</div>
              </TabsContent>
            </Tabs>

            <div className="flex items-center space-x-4 mb-4">
              <Volume2 className="text-purple-500" />
              <Slider
                value={[volume]}
                max={100}
                step={1}
                onValueChange={(value) => setVolume(value[0])}
                className="flex-1"
              />
            </div>

            <div className="flex space-x-4">
              <Button className="flex-1 bg-purple-700 hover:bg-purple-600">
                <Mic className="mr-2 h-4 w-4" />
                Voice
              </Button>
              <Select value={selectedGenre} onValueChange={setSelectedGenre}>
                <SelectTrigger className="flex-1 bg-gray-800">
                  <SelectValue placeholder="Genre" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="pop">Pop</SelectItem>
                  <SelectItem value="rock">Rock</SelectItem>
                  <SelectItem value="hiphop">Hip Hop</SelectItem>
                  <SelectItem value="electronic">Electronic</SelectItem>
                  <SelectItem value="jazz">Jazz</SelectItem>
                  <SelectItem value="classical">Classical</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </div>

        {/* Right panel */}
        <div className="w-full md:w-1/2 p-4">
          <div className="bg-gray-900 rounded-lg p-4 mb-4">
            <Tabs value={activeTab} onValueChange={setActiveTab}>
              <TabsList className="mb-4 bg-gray-800">
                <TabsTrigger value="fx" className={activeTab === "fx" ? "bg-purple-700" : ""}>
                  FX
                </TabsTrigger>
                <TabsTrigger value="eq" className={activeTab === "eq" ? "bg-purple-700" : ""}>
                  EQ
                </TabsTrigger>
                <TabsTrigger value="loop" className={activeTab === "loop" ? "bg-purple-700" : ""}>
                  Loop
                </TabsTrigger>
                <TabsTrigger value="cue" className={activeTab === "cue" ? "bg-purple-700" : ""}>
                  Cue
                </TabsTrigger>
              </TabsList>

              <TabsContent value="fx">
                <div className="grid grid-cols-2 gap-4 mb-4">
                  <Button
                    variant="outline"
                    className={cn(
                      "h-14 text-lg",
                      activeEffects.includes("reverb2") ? "bg-purple-700" : "bg-gray-800 hover:bg-gray-700",
                    )}
                    onClick={() => toggleEffect("reverb2")}
                  >
                    Reverb
                  </Button>
                  <Button
                    variant="outline"
                    className={cn(
                      "h-14 text-lg",
                      activeEffects.includes("delay2") ? "bg-purple-700" : "bg-gray-800 hover:bg-gray-700",
                    )}
                    onClick={() => toggleEffect("delay2")}
                  >
                    Delay
                  </Button>
                  <Button
                    variant="outline"
                    className={cn(
                      "h-14 text-lg",
                      activeEffects.includes("filter2") ? "bg-purple-700" : "bg-gray-800 hover:bg-gray-700",
                    )}
                    onClick={() => toggleEffect("filter2")}
                  >
                    Filter
                  </Button>
                  <Button
                    variant="outline"
                    className={cn(
                      "h-14 text-lg",
                      activeEffects.includes("flanger2") ? "bg-purple-700" : "bg-gray-800 hover:bg-gray-700",
                    )}
                    onClick={() => toggleEffect("flanger2")}
                  >
                    Flanger
                  </Button>
                </div>
              </TabsContent>

              <TabsContent value="eq">
                <div className="p-4 text-center text-gray-400">Equalizer controls will appear here</div>
              </TabsContent>

              <TabsContent value="loop">
                <div className="p-4 text-center text-gray-400">Loop controls will appear here</div>
              </TabsContent>

              <TabsContent value="cue">
                <div className="p-4 text-center text-gray-400">Cue controls will appear here</div>
              </TabsContent>
            </Tabs>
          </div>
        </div>
      </div>

      {/* Tabs for Music and Videos */}
      <Tabs defaultValue="music" className="w-full">
        <TabsList className="w-full bg-gray-900 p-2 border-b border-gray-800 rounded-none">
          <TabsTrigger
            value="music"
            className="flex-1 data-[state=active]:border-b-2 data-[state=active]:border-purple-500 data-[state=active]:text-purple-500 rounded-none bg-transparent"
          >
            <Music className="mr-2 h-4 w-4" />
            Music
          </TabsTrigger>
          <TabsTrigger
            value="videos"
            className="flex-1 data-[state=active]:border-b-2 data-[state=active]:border-purple-500 data-[state=active]:text-purple-500 rounded-none bg-transparent"
          >
            <Video className="mr-2 h-4 w-4" />
            Videos
          </TabsTrigger>
        </TabsList>

        <TabsContent value="music">
          <div className="flex-1 flex flex-col items-center justify-center p-8 bg-gray-900">
            {tracks.length === 0 ? (
              <div className="text-center">
                <div className="flex justify-center mb-4">
                  <Music className="h-24 w-24 text-purple-600" />
                </div>
                <h2 className="text-2xl font-bold mb-4">No Music Generated Yet</h2>
                <p className="text-gray-400 mb-8 max-w-md mx-auto">
                  Start creating original music with AI across various genres and styles
                </p>
                <Button
                  onClick={handleCreateMusic}
                  className="bg-purple-700 hover:bg-purple-600 text-white px-6 py-3 rounded-md text-lg"
                >
                  <PlusCircle className="mr-2 h-5 w-5" />
                  Create Music
                </Button>
              </div>
            ) : (
              <div className="w-full grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {/* Track list would go here */}
              </div>
            )}
          </div>
        </TabsContent>

        <TabsContent value="videos">
          <div className="flex-1 flex flex-col items-center justify-center p-8 bg-gray-900">
            <div className="text-center">
              <div className="flex justify-center mb-4">
                <Video className="h-24 w-24 text-purple-600" />
              </div>
              <h2 className="text-2xl font-bold mb-4">No Videos Generated Yet</h2>
              <p className="text-gray-400 mb-8 max-w-md mx-auto">Create music videos using your generated tracks</p>
              <Link href="/video-studio">
                <Button className="bg-purple-700 hover:bg-purple-600 text-white px-6 py-3 rounded-md text-lg">
                  <PlusCircle className="mr-2 h-5 w-5" />
                  Create Video
                </Button>
              </Link>
            </div>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  )
}
