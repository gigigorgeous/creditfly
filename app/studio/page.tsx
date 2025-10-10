"use client"

import { Music, Sparkles, Video, Headphones, Zap, Server } from "lucide-react"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { CustomMusicGenerator } from "@/components/custom-music-generator"
import { KieMusicGenerator } from "@/components/kie-music-generator"
import { EnhancedLyricsGenerator } from "@/components/enhanced-lyrics-generator"
import { EnhancedVideoConceptGenerator } from "@/components/enhanced-video-concept-generator"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

export default function StudioPage() {
  return (
    <div className="min-h-screen bg-gray-950 text-gray-50 p-4 md:p-8">
      {/* Header */}
      <div className="text-center mb-8">
        <h1 className="text-4xl md:text-5xl font-bold tracking-tight mb-4">
          <Music className="inline-block w-10 h-10 mr-3 text-purple-500" />
          Your Creative Studio
        </h1>
        <p className="text-lg text-gray-400 max-w-2xl mx-auto">
          Create professional music with your own custom AI or use Groq and Kie.ai. Full control over your music
          generation.
        </p>
      </div>

      {/* Main Studio Interface */}
      <div className="flex justify-center">
        <Tabs defaultValue="custom" className="w-full max-w-6xl">
          <TabsList className="grid w-full grid-cols-4 bg-gray-800 border border-gray-700 mb-8">
            <TabsTrigger
              value="custom"
              className="data-[state=active]:bg-green-600 data-[state=active]:text-white flex items-center gap-2"
            >
              <Server className="w-4 h-4" />
              Custom AI
            </TabsTrigger>
            <TabsTrigger
              value="kie"
              className="data-[state=active]:bg-purple-600 data-[state=active]:text-white flex items-center gap-2"
            >
              <Headphones className="w-4 h-4" />
              Kie.ai
            </TabsTrigger>
            <TabsTrigger
              value="lyrics"
              className="data-[state=active]:bg-blue-600 data-[state=active]:text-white flex items-center gap-2"
            >
              <Sparkles className="w-4 h-4" />
              Lyrics
            </TabsTrigger>
            <TabsTrigger
              value="video"
              className="data-[state=active]:bg-orange-600 data-[state=active]:text-white flex items-center gap-2"
            >
              <Video className="w-4 h-4" />
              Video
            </TabsTrigger>
          </TabsList>

          <TabsContent value="custom" className="mt-6">
            <CustomMusicGenerator />
          </TabsContent>

          <TabsContent value="kie" className="mt-6">
            <KieMusicGenerator />
          </TabsContent>

          <TabsContent value="lyrics" className="mt-6">
            <EnhancedLyricsGenerator />
          </TabsContent>

          <TabsContent value="video" className="mt-6">
            <EnhancedVideoConceptGenerator />
          </TabsContent>
        </Tabs>
      </div>

      {/* Additional Studio Features */}
      <div className="mt-16 grid grid-cols-1 md:grid-cols-4 gap-6 max-w-6xl mx-auto">
        <Card className="bg-gray-800 border-gray-700">
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <Server className="w-5 h-5 text-green-400" />
              Your Own AI
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-gray-400 text-sm">
              MusicGen running on your infrastructure. No limits, no API costs, full control.
            </p>
          </CardContent>
        </Card>

        <Card className="bg-gray-800 border-gray-700">
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <Zap className="w-5 h-5 text-purple-400" />
              Kie.ai Power
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-gray-400 text-sm">Professional tracks with vocals using Kie.ai's V3.5 model.</p>
          </CardContent>
        </Card>

        <Card className="bg-gray-800 border-gray-700">
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-blue-400" />
              Groq Lyrics
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-gray-400 text-sm">Ultra-fast lyrics with Groq's Qwen model. Instant results.</p>
          </CardContent>
        </Card>

        <Card className="bg-gray-800 border-gray-700">
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <Video className="w-5 h-5 text-orange-400" />
              Video Concepts
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-gray-400 text-sm">AI-powered video concepts and storyboards for your music.</p>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
