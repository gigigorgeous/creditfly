"use client"

import { useState, useEffect } from "react"
import { useSearchParams } from "next/navigation"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { MusicGenerator } from "@/components/music-generator"
import { VideoGenerator } from "@/components/video-generator"
import { DjInterface } from "@/components/dj-interface"
import { FaceSwap } from "@/components/face-swap"
import { PersonaCreator } from "@/components/persona-creator"
import { SimpleAudioGenerator } from "@/components/simple-audio-generator"
import { VocalsGenerator } from "@/components/vocals-generator"
import { Music, Video, Disc3, Mic, User, Camera } from "lucide-react"
import type { GeneratedMusic } from "@/components/music-video-creator"

export default function StudioPage() {
  const searchParams = useSearchParams()
  const [activeTab, setActiveTab] = useState("music-studio")
  const [activeSubTab, setActiveSubTab] = useState("ai-music")
  const [generatedMusic, setGeneratedMusic] = useState<GeneratedMusic | null>(null)

  // Handle URL parameters for initial tab selection
  useEffect(() => {
    const tab = searchParams.get("tab")
    if (tab === "video") {
      setActiveTab("persona-video")
      setActiveSubTab("create-video")
    } else if (tab === "persona") {
      setActiveTab("persona-video")
      setActiveSubTab("create-persona")
    } else if (tab === "face-swap") {
      setActiveTab("persona-video")
      setActiveSubTab("face-swap")
    }
  }, [searchParams])

  const handleMusicGenerated = (music: GeneratedMusic) => {
    setGeneratedMusic(music)
    // Auto-navigate to video creation
    setActiveTab("persona-video")
    setActiveSubTab("create-video")
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-6">
        <div className="mb-6">
          <h1 className="text-3xl font-bold mb-2">Creative Studio</h1>
          <p className="text-muted-foreground">Create amazing music and videos with AI</p>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-2 mb-6">
            <TabsTrigger value="music-studio" className="flex items-center gap-2">
              <Music className="h-4 w-4" />
              Music Studio
            </TabsTrigger>
            <TabsTrigger value="persona-video" className="flex items-center gap-2">
              <Video className="h-4 w-4" />
              Persona & Video
            </TabsTrigger>
          </TabsList>

          {/* Music Studio Tab */}
          <TabsContent value="music-studio">
            <Tabs value={activeSubTab} onValueChange={setActiveSubTab} className="w-full">
              <TabsList className="grid w-full grid-cols-3 mb-6">
                <TabsTrigger value="ai-music" className="flex items-center gap-2">
                  <Music className="h-4 w-4" />
                  AI Music
                </TabsTrigger>
                <TabsTrigger value="simple-audio" className="flex items-center gap-2">
                  <Disc3 className="h-4 w-4" />
                  Simple Audio
                </TabsTrigger>
                <TabsTrigger value="vocals" className="flex items-center gap-2">
                  <Mic className="h-4 w-4" />
                  Vocals
                </TabsTrigger>
              </TabsList>

              <TabsContent value="ai-music">
                <MusicGenerator onMusicGenerated={handleMusicGenerated} />
              </TabsContent>

              <TabsContent value="simple-audio">
                <SimpleAudioGenerator />
              </TabsContent>

              <TabsContent value="vocals">
                <VocalsGenerator />
              </TabsContent>
            </Tabs>
          </TabsContent>

          {/* Persona & Video Tab */}
          <TabsContent value="persona-video">
            <Tabs value={activeSubTab} onValueChange={setActiveSubTab} className="w-full">
              <TabsList className="grid w-full grid-cols-3 mb-6">
                <TabsTrigger value="create-persona" className="flex items-center gap-2">
                  <User className="h-4 w-4" />
                  Create Persona
                </TabsTrigger>
                <TabsTrigger value="create-video" className="flex items-center gap-2">
                  <Video className="h-4 w-4" />
                  Create Video
                </TabsTrigger>
                <TabsTrigger value="face-swap" className="flex items-center gap-2">
                  <Camera className="h-4 w-4" />
                  Face Swap
                </TabsTrigger>
              </TabsList>

              <TabsContent value="create-persona">
                <PersonaCreator />
              </TabsContent>

              <TabsContent value="create-video">
                <VideoGenerator generatedMusic={generatedMusic} />
              </TabsContent>

              <TabsContent value="face-swap">
                <FaceSwap />
              </TabsContent>
            </Tabs>
          </TabsContent>
        </Tabs>

        {/* DJ Interface at the bottom */}
        <div className="mt-8">
          <h2 className="text-xl font-semibold mb-4">DJ Controls</h2>
          <DjInterface />
        </div>
      </div>
    </div>
  )
}
