import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Music, Video, Sparkles, ArrowRight } from "lucide-react"
import { MusicModeSwitcher } from "@/components/music-mode-switcher"

export default function Home() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900">
      <div className="container mx-auto px-4 py-16">
        {/* Hero Section */}
        <div className="text-center mb-16">
          <h1 className="text-5xl md:text-7xl font-bold text-white mb-6">
            Create Music with
            <span className="bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
              {" "}
              AI Magic
            </span>
          </h1>
          <p className="text-xl text-gray-300 mb-8 max-w-3xl mx-auto">
            Generate original music, create stunning music videos, and analyze your creative journey with our
            professional AI-powered music creation suite.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/music-lab">
              <Button size="lg" className="bg-purple-600 hover:bg-purple-700 text-white px-8 py-3">
                <Sparkles className="mr-2 h-5 w-5" />
                Try Music Lab
              </Button>
            </Link>
            <Link href="/music-studio">
              <Button
                size="lg"
                variant="outline"
                className="border-white text-white hover:bg-white hover:text-black px-8 py-3 bg-transparent"
              >
                Music Studio
                <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
            </Link>
          </div>
        </div>

        {/* Mode Switcher */}
        <div className="mb-16">
          <MusicModeSwitcher />
        </div>

        {/* Features Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-16">
          <Card className="bg-black/20 border-purple-500/20 backdrop-blur-sm">
            <CardHeader>
              <Music className="h-12 w-12 text-purple-400 mb-4" />
              <CardTitle className="text-white">Music Lab</CardTitle>
              <CardDescription className="text-gray-300">
                Professional AI music generation with multiple providers, advanced controls, and real-time analytics.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Link href="/music-lab">
                <Button className="w-full bg-purple-600 hover:bg-purple-700">Explore Music Lab</Button>
              </Link>
            </CardContent>
          </Card>

          <Card className="bg-black/20 border-blue-500/20 backdrop-blur-sm">
            <CardHeader>
              <Music className="h-12 w-12 text-blue-400 mb-4" />
              <CardTitle className="text-white">Music Studio</CardTitle>
              <CardDescription className="text-gray-300">
                Interactive music creation interface with live effects, mixing controls, and real-time generation.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Link href="/music-studio">
                <Button className="w-full bg-blue-600 hover:bg-blue-700">Open Studio</Button>
              </Link>
            </CardContent>
          </Card>

          <Card className="bg-black/20 border-pink-500/20 backdrop-blur-sm">
            <CardHeader>
              <Video className="h-12 w-12 text-pink-400 mb-4" />
              <CardTitle className="text-white">Video Generator</CardTitle>
              <CardDescription className="text-gray-300">
                Create stunning music videos with AI-powered visuals, character animation, and deepfake technology.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Link href="/music-video-generator">
                <Button className="w-full bg-pink-600 hover:bg-pink-700">Create Videos</Button>
              </Link>
            </CardContent>
          </Card>
        </div>

        {/* Stats Section */}
        <div className="text-center mb-16">
          <h2 className="text-3xl font-bold text-white mb-8">Powered by Advanced AI</h2>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div className="text-center">
              <div className="text-4xl font-bold text-purple-400 mb-2">4+</div>
              <div className="text-gray-300">AI Providers</div>
            </div>
            <div className="text-center">
              <div className="text-4xl font-bold text-blue-400 mb-2">10+</div>
              <div className="text-gray-300">Music Genres</div>
            </div>
            <div className="text-center">
              <div className="text-4xl font-bold text-pink-400 mb-2">∞</div>
              <div className="text-gray-300">Creative Possibilities</div>
            </div>
            <div className="text-center">
              <div className="text-4xl font-bold text-green-400 mb-2">24/7</div>
              <div className="text-gray-300">AI Generation</div>
            </div>
          </div>
        </div>

        {/* CTA Section */}
        <div className="text-center">
          <Card className="bg-black/30 border-purple-500/30 backdrop-blur-sm max-w-2xl mx-auto">
            <CardHeader>
              <CardTitle className="text-2xl text-white">Ready to Create?</CardTitle>
              <CardDescription className="text-gray-300">
                Join thousands of creators using AI to make professional music and videos.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Link href="/music-lab">
                  <Button
                    size="lg"
                    className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700"
                  >
                    Start Creating Now
                  </Button>
                </Link>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
