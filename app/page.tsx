"use client"

import { Button } from "@/components/ui/button"
import Link from "next/link"
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
  Zap,
  Star,
  Headphones,
} from "lucide-react"
import { MusicBarGraph } from "@/components/music-bar-graph"

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
          <Link href="/" passHref>
            <Button variant="ghost" className="text-purple-400 bg-purple-900/30 hover:bg-purple-900/50">
              <Home className="w-4 h-4 mr-2" />
              Home
            </Button>
          </Link>
          <Link href="/studio" passHref>
            <Button variant="ghost" className="text-gray-400 hover:text-gray-50">
              <Music className="w-4 h-4 mr-2" />
              Studio
            </Button>
          </Link>
          <Link href="/video" passHref>
            <Button variant="ghost" className="text-gray-400 hover:text-gray-50">
              <Video className="w-4 h-4 mr-2" />
              Video
            </Button>
          </Link>
          <Link href="/library" passHref>
            <Button variant="ghost" className="text-gray-400 hover:text-gray-50">
              <Library className="w-4 h-4 mr-2" />
              Library
            </Button>
          </Link>
          <Link href="/settings" passHref>
            <Button variant="ghost" className="text-gray-400 hover:text-gray-50">
              <Settings className="w-4 h-4 mr-2" />
              Settings
            </Button>
          </Link>
        </nav>
        <div className="flex items-center gap-4">
          <Link href="/studio" passHref>
            <Button variant="outline" className="bg-gray-800 text-gray-50 border-gray-700 hover:bg-gray-700">
              <Plus className="w-4 h-4 mr-2" />
              Create Song
            </Button>
          </Link>
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
              <DropdownMenuItem asChild>
                <Link href="/profile">Profile</Link>
              </DropdownMenuItem>
              <DropdownMenuItem asChild>
                <Link href="/settings">Settings</Link>
              </DropdownMenuItem>
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
            <Zap className="w-3 h-3 mr-1" />
            Powered by Advanced AI
          </Badge>
          <h1 className="text-5xl md:text-6xl font-bold tracking-tight leading-tight">
            Create Studio-Quality Music with AI
          </h1>
          <p className="text-lg text-gray-400 max-w-md">
            Generate original songs, write compelling lyrics, and develop video concepts in seconds. No musical
            experience required.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 mt-4">
            <Link href="/studio" passHref>
              <Button className="bg-gradient-to-r from-purple-600 to-blue-500 hover:from-purple-700 hover:to-blue-600 text-white px-6 py-3 text-lg rounded-lg shadow-lg">
                <Sparkles className="w-5 h-5 mr-2" />
                Create Your First Song
              </Button>
            </Link>
            <Link href="/demo" passHref>
              <Button
                variant="outline"
                className="bg-gray-800 text-gray-50 border-gray-700 hover:bg-gray-700 px-6 py-3 text-lg rounded-lg"
              >
                <PlayCircle className="w-5 h-5 mr-2" />
                Watch Demo
              </Button>
            </Link>
          </div>

          {/* Feature Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 mt-8">
            <div className="flex items-start gap-3">
              <Sparkles className="w-6 h-6 text-purple-400 mt-1 flex-shrink-0" />
              <div>
                <h3 className="font-semibold text-lg">AI-Powered Generation</h3>
                <p className="text-gray-400 text-sm">State-of-the-art music synthesis</p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <Music className="w-6 h-6 text-purple-400 mt-1 flex-shrink-0" />
              <div>
                <h3 className="font-semibold text-lg">Multiple Genres</h3>
                <p className="text-gray-400 text-sm">From electronic to classical</p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <Headphones className="w-6 h-6 text-purple-400 mt-1 flex-shrink-0" />
              <div>
                <h3 className="font-semibold text-lg">Studio Quality</h3>
                <p className="text-gray-400 text-sm">Professional audio output</p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <Download className="w-6 h-6 text-purple-400 mt-1 flex-shrink-0" />
              <div>
                <h3 className="font-semibold text-lg">Own Your Music</h3>
                <p className="text-gray-400 text-sm">Royalty-free downloads</p>
              </div>
            </div>
          </div>
        </div>

        {/* Right Content - Music Bar Graph */}
        <div className="flex justify-center lg:justify-end">
          <MusicBarGraph />
        </div>
      </main>

      {/* Features Section */}
      <section className="container mx-auto px-4 py-16 md:py-24 bg-gray-900/50">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold tracking-tight mb-4">Everything You Need to Create Music</h2>
          <p className="text-lg text-gray-400 max-w-2xl mx-auto">
            Our comprehensive AI-powered studio provides all the tools you need to bring your musical ideas to life.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="text-center p-8 bg-gray-800 rounded-xl border border-gray-700 hover:border-purple-500 transition-all">
            <Music className="w-12 h-12 text-purple-400 mx-auto mb-4" />
            <h3 className="text-xl font-semibold mb-2">AI Music Generation</h3>
            <p className="text-gray-400">
              Create original instrumental tracks with advanced AI models. Customize every aspect from genre to mood.
            </p>
          </div>

          <div className="text-center p-8 bg-gray-800 rounded-xl border border-gray-700 hover:border-blue-500 transition-all">
            <Sparkles className="w-12 h-12 text-blue-400 mx-auto mb-4" />
            <h3 className="text-xl font-semibold mb-2">Smart Lyrics Writing</h3>
            <p className="text-gray-400">
              Generate compelling lyrics with proper song structure. Choose themes, moods, and genres that match your
              vision.
            </p>
          </div>

          <div className="text-center p-8 bg-gray-800 rounded-xl border border-gray-700 hover:border-green-500 transition-all">
            <Video className="w-12 h-12 text-green-400 mx-auto mb-4" />
            <h3 className="text-xl font-semibold mb-2">Video Concepts</h3>
            <p className="text-gray-400">
              Develop detailed music video concepts and storyboards. Perfect for planning your visual content strategy.
            </p>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="container mx-auto px-4 py-16 md:py-24 text-center">
        <div className="max-w-3xl mx-auto">
          <h2 className="text-3xl md:text-4xl font-bold tracking-tight mb-4">Ready to Create Your Next Hit?</h2>
          <p className="text-lg text-gray-400 mb-8">
            Join thousands of creators who are already using AI to make incredible music.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/studio" passHref>
              <Button className="bg-gradient-to-r from-purple-600 to-blue-500 hover:from-purple-700 hover:to-blue-600 text-white px-8 py-3 text-lg rounded-lg shadow-lg">
                <Star className="w-5 h-5 mr-2" />
                Start Creating Now
              </Button>
            </Link>
            <Link href="/demo" passHref>
              <Button
                variant="outline"
                className="bg-transparent text-gray-50 border-gray-600 hover:bg-gray-800 px-8 py-3 text-lg rounded-lg"
              >
                <PlayCircle className="w-5 h-5 mr-2" />
                See Examples
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-gray-800 py-8">
        <div className="container mx-auto px-4 text-center text-gray-400">
          <p>&copy; 2025 EmpireMusicAiStudio. All rights reserved.</p>
        </div>
      </footer>
    </div>
  )
}
