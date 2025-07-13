"use client"

import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { DropdownMenu, DropdownMenuTrigger, DropdownMenuContent, DropdownMenuItem } from "@/components/ui/dropdown-menu"
import { Badge } from "@/components/ui/badge"
import {
  Home,
  Music,
  Video,
  Library,
  Settings,
  Plus,
  User,
  ChevronDown,
  Sparkles,
  Download,
  PlayCircle,
} from "lucide-react"
import { MusicPlayerCard } from "@/components/music-player-card"

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-gray-950 text-gray-50">
      {/* Header */}
      <header className="flex items-center justify-between p-4 md:px-8 border-b border-gray-800">
        <div className="flex items-center gap-4">
          <Music className="w-8 h-8 text-purple-500" />
          <span className="text-xl font-bold">EmpireMusicAiStudio</span>
        </div>
        <nav className="hidden md:flex items-center gap-6">
          <Button variant="ghost" className="text-purple-400 bg-purple-900/30 hover:bg-purple-900/50">
            <Home className="w-4 h-4 mr-2" />
            Home
          </Button>
          <Button variant="ghost" className="text-gray-400 hover:text-gray-50">
            <Music className="w-4 h-4 mr-2" />
            Studio
          </Button>
          <Button variant="ghost" className="text-gray-400 hover:text-gray-50">
            <Video className="w-4 h-4 mr-2" />
            Video
          </Button>
          <Button variant="ghost" className="text-gray-400 hover:text-gray-50">
            <Library className="w-4 h-4 mr-2" />
            Library
          </Button>
          <Button variant="ghost" className="text-gray-400 hover:text-gray-50">
            <Settings className="w-4 h-4 mr-2" />
            Settings
          </Button>
        </nav>
        <div className="flex items-center gap-4">
          <Button variant="outline" className="bg-gray-800 text-gray-50 border-gray-700 hover:bg-gray-700">
            <Plus className="w-4 h-4 mr-2" />
            Create Song
          </Button>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="rounded-full p-0 h-10 w-10">
                <Avatar className="w-8 h-8">
                  <AvatarImage src="/placeholder.svg?height=32&width=32" alt="User Avatar" />
                  <AvatarFallback>
                    <User className="w-5 h-5" />
                  </AvatarFallback>
                </Avatar>
                <ChevronDown className="w-4 h-4 ml-1 text-gray-400" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="bg-gray-800 border-gray-700 text-gray-50">
              <DropdownMenuItem>Profile</DropdownMenuItem>
              <DropdownMenuItem>Settings</DropdownMenuItem>
              <DropdownMenuItem>Logout</DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </header>

      {/* Hero Section */}
      <main className="container mx-auto px-4 py-16 md:py-24 grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
        {/* Left Content */}
        <div className="flex flex-col gap-6">
          <Badge
            variant="secondary"
            className="w-fit px-3 py-1 text-sm bg-gray-800 text-gray-300 border border-gray-700"
          >
            Introducing EmpireMusicAiStudio
          </Badge>
          <h1 className="text-5xl md:text-6xl font-bold tracking-tight leading-tight">
            Create Studio-Quality Music with AI
          </h1>
          <p className="text-lg text-gray-400 max-w-md">
            Generate original songs in seconds across any genre. No musical experience required.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 mt-4">
            <Button className="bg-gradient-to-r from-purple-600 to-blue-500 hover:from-purple-700 hover:to-blue-600 text-white px-6 py-3 text-lg rounded-lg shadow-lg">
              <Sparkles className="w-5 h-5 mr-2" />
              Create Your First Song
            </Button>
            <Button
              variant="outline"
              className="bg-gray-800 text-gray-50 border-gray-700 hover:bg-gray-700 px-6 py-3 text-lg rounded-lg"
            >
              <PlayCircle className="w-5 h-5 mr-2" />
              Watch Demo
            </Button>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 mt-8">
            <div className="flex items-start gap-3">
              <Sparkles className="w-6 h-6 text-purple-400 mt-1" />
              <div>
                <h3 className="font-semibold text-lg">AI-Powered</h3>
                <p className="text-gray-400 text-sm">State-of-the-art synthesis</p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <Music className="w-6 h-6 text-purple-400 mt-1" />
              <div>
                <h3 className="font-semibold text-lg">Multiple Genres</h3>
                <p className="text-gray-400 text-sm">From pop to classical</p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <Download className="w-6 h-6 text-purple-400 mt-1" />
              <div>
                <h3 className="font-semibold text-lg">Own Your Music</h3>
                <p className="text-gray-400 text-sm">Royalty-free downloads</p>
              </div>
            </div>
          </div>
        </div>

        {/* Right Content - Music Player Card */}
        <div className="flex justify-center lg:justify-end">
          <MusicPlayerCard
            src="https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3"
            title="Cosmic Dreams"
            artist="EmpireMusicAiStudio"
            genre="Electronic"
            duration="3:24"
            bpm={128}
            keySignature="A♭ min"
          />
        </div>
      </main>

      {/* Placeholder for "Craft music in minutes, not months" section */}
      <section className="container mx-auto px-4 py-16 md:py-24 text-center">
        <h2 className="text-4xl md:text-5xl font-bold tracking-tight">Craft music in minutes, not months</h2>
        {/* Additional content for this section would go here */}
      </section>
    </div>
  )
}
