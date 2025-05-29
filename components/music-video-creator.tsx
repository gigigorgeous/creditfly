"use client"

import { useState, useEffect } from "react"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { MusicGenerator } from "@/components/music-generator"
import { VideoGenerator } from "@/components/video-generator"
import { Dashboard } from "@/components/dashboard"
import { Header } from "@/components/header"
import { SubscriptionBanner } from "@/components/subscription-banner"
import { PersonaCreator, type Persona } from "@/components/persona-creator"
import RewardNotification from "@/components/rewards/reward-notification"
import { AIVocalGenerator } from "@/components/ai-vocal-generator"
import { FaceSwapVideoGenerator } from "./face-swap-video-generator"
import { AdvancedAudioGenerator } from "./advanced-audio-generator"
import { Leaderboard } from "./leaderboard"
import { Music2, Film, LayoutDashboard, User, Mic, Wand2, Music } from "lucide-react"

export type GeneratedMusic = {
  id: string
  title: string
  audioUrl: string
  genre: string
  mood: string
  duration: number
  createdAt: Date
  musicDescription?: any
  aiGenerated?: boolean
}

export type GeneratedVideo = {
  id: string
  title: string
  videoUrl: string
  thumbnailUrl: string
  musicId: string
  style: string
  createdAt: Date
}

export function MusicVideoCreator() {
  // User state
  const [user, setUser] = useState<{ id: string; username: string; email: string } | null>(null)

  // Tab state
  const [activeTab, setActiveTab] = useState("dashboard")
  const [activePersonaSubTab, setActivePersonaSubTab] = useState("create")
  const [activeMusicSubTab, setActiveMusicSubTab] = useState("generator")

  // Content state
  const [generatedMusic, setGeneratedMusic] = useState<GeneratedMusic[]>([])
  const [generatedVideos, setGeneratedVideos] = useState<GeneratedVideo[]>([])
  const [selectedMusic, setSelectedMusic] = useState<GeneratedMusic | null>(null)
  const [personas, setPersonas] = useState<Persona[]>([])

  // Play tracking
  const [songPlays, setSongPlays] = useState<Record<string, number>>({})

  const handleLogin = (userData: { id: string; username: string; email: string }) => {
    setUser(userData)
    // In a real app, you would store this in localStorage or a cookie
    localStorage.setItem("user", JSON.stringify(userData))
  }

  const handleLogout = () => {
    setUser(null)
    localStorage.removeItem("user")
  }

  const handleMusicGenerated = (music: GeneratedMusic) => {
    setGeneratedMusic((prev) => [music, ...prev])
    setSelectedMusic(music)
    setActiveTab("persona")
    setActivePersonaSubTab("video")

    // Initialize play count for this song
    setSongPlays((prev) => ({
      ...prev,
      [music.id]: 0,
    }))
  }

  const handleVideoGenerated = (video: GeneratedVideo) => {
    setGeneratedVideos((prev) => [video, ...prev])
    setActiveTab("dashboard")
  }

  const handlePersonaCreated = (persona: Persona) => {
    setPersonas((prev) => [persona, ...prev])
    setActivePersonaSubTab("video")
  }

  const trackPlay = (songId: string) => {
    if (!songId) return

    setSongPlays((prev) => ({
      ...prev,
      [songId]: (prev[songId] || 0) + 1,
    }))
  }

  // Check for stored user on mount
  useEffect(() => {
    const storedUser = localStorage.getItem("user")
    if (storedUser) {
      try {
        setUser(JSON.parse(storedUser))
      } catch (e) {
        console.error("Failed to parse stored user")
      }
    }
  }, [])

  return (
    <div className="flex flex-col h-screen">
      <Header user={user} onLogin={handleLogin} onLogout={handleLogout} />
      <SubscriptionBanner />

      <Tabs value={activeTab} onValueChange={setActiveTab} className="flex-1 flex flex-col">
        <TabsList className="grid grid-cols-3 w-full">
          <TabsTrigger value="dashboard" className="flex items-center gap-2">
            <LayoutDashboard className="h-4 w-4" />
            <span>Dashboard</span>
          </TabsTrigger>
          <TabsTrigger value="music" className="flex items-center gap-2">
            <Music2 className="h-4 w-4" />
            <span>Music Studio</span>
          </TabsTrigger>
          <TabsTrigger value="persona" className="flex items-center gap-2">
            <User className="h-4 w-4" />
            <span>Persona & Video</span>
          </TabsTrigger>
        </TabsList>

        <TabsContent value="dashboard" className="flex-1 overflow-auto">
          <div className="container py-6 grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2">
              <Dashboard
                generatedMusic={generatedMusic}
                generatedVideos={generatedVideos}
                onSelectMusic={setSelectedMusic}
                onSwitchToVideo={() => {
                  setActiveTab("persona")
                  setActivePersonaSubTab("video")
                }}
                onTrackPlay={trackPlay}
              />
            </div>
            <div className="space-y-6">
              <Leaderboard />
            </div>
          </div>
        </TabsContent>

        <TabsContent value="music" className="flex-1 overflow-auto">
          <Tabs value={activeMusicSubTab} onValueChange={setActiveMusicSubTab} className="w-full">
            <TabsList className="grid grid-cols-3 w-full max-w-md mx-auto mb-6">
              <TabsTrigger value="generator" className="flex items-center gap-2">
                <Music2 className="h-4 w-4" />
                <span>AI Music</span>
              </TabsTrigger>
              <TabsTrigger value="simple" className="flex items-center gap-2">
                <Music className="h-4 w-4" />
                <span>Simple Audio</span>
              </TabsTrigger>
              <TabsTrigger value="vocals" className="flex items-center gap-2">
                <Mic className="h-4 w-4" />
                <span>Vocals</span>
              </TabsTrigger>
            </TabsList>

            <TabsContent value="generator" className="mt-0">
              <MusicGenerator onMusicGenerated={handleMusicGenerated} />
            </TabsContent>

            <TabsContent value="simple" className="mt-0">
              <AdvancedAudioGenerator onMusicGenerated={handleMusicGenerated} />
            </TabsContent>

            <TabsContent value="vocals" className="mt-0">
              <AIVocalGenerator />
            </TabsContent>
          </Tabs>
        </TabsContent>

        <TabsContent value="persona" className="flex-1 overflow-auto">
          <Tabs value={activePersonaSubTab} onValueChange={setActivePersonaSubTab} className="w-full">
            <TabsList className="grid grid-cols-3 w-full max-w-md mx-auto mb-6">
              <TabsTrigger value="create" className="flex items-center gap-2">
                <User className="h-4 w-4" />
                <span>Create Persona</span>
              </TabsTrigger>
              <TabsTrigger value="video" className="flex items-center gap-2">
                <Film className="h-4 w-4" />
                <span>Create Video</span>
              </TabsTrigger>
              <TabsTrigger value="faceswap" className="flex items-center gap-2">
                <Wand2 className="h-4 w-4" />
                <span>Face Swap</span>
              </TabsTrigger>
            </TabsList>

            <TabsContent value="create" className="mt-0">
              <PersonaCreator onPersonaCreated={handlePersonaCreated} existingPersonas={personas} />
            </TabsContent>

            <TabsContent value="video" className="mt-0">
              <VideoGenerator selectedMusic={selectedMusic} onVideoGenerated={handleVideoGenerated} />
            </TabsContent>

            <TabsContent value="faceswap" className="mt-0">
              <FaceSwapVideoGenerator
                selectedMusic={selectedMusic}
                personas={personas}
                onVideoGenerated={handleVideoGenerated}
              />
            </TabsContent>
          </Tabs>
        </TabsContent>
      </Tabs>
      <RewardNotification songPlays={songPlays} userId={user?.id} />
    </div>
  )
}

export default MusicVideoCreator
