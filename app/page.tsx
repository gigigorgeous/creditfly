"use client"

import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Music, Video, Users, Sparkles } from "lucide-react"

export default function HomePage() {
  const router = useRouter()

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-blue-50 to-cyan-50">
      <div className="container mx-auto px-4 py-16">
        {/* Hero Section */}
        <div className="text-center mb-16">
          <h1 className="text-4xl md:text-6xl font-bold bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent mb-6">
            AI Music & Video Creator
          </h1>
          <p className="text-xl text-muted-foreground mb-8 max-w-2xl mx-auto">
            Create amazing music and videos with the power of AI. Generate original tracks, create stunning visuals, and
            bring your creative vision to life.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button size="lg" className="text-lg px-8 py-6" onClick={() => router.push("/studio")}>
              <Music className="mr-2 h-5 w-5" />
              Start Creating Music
            </Button>
            <Button
              variant="outline"
              size="lg"
              className="text-lg px-8 py-6"
              onClick={() => router.push("/studio?tab=video")}
            >
              <Video className="mr-2 h-5 w-5" />
              Create Videos
            </Button>
          </div>
        </div>

        {/* Features Grid */}
        <div className="grid md:grid-cols-3 gap-8 mb-16">
          <Card className="border-purple-200 hover:shadow-lg transition-shadow">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Music className="h-6 w-6 text-purple-600" />
                AI Music Generation
              </CardTitle>
              <CardDescription>Create original music in any genre with AI-powered composition</CardDescription>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li>• Multiple genres and styles</li>
                <li>• Custom lyrics and vocals</li>
                <li>• Professional quality output</li>
                <li>• Instant generation</li>
              </ul>
            </CardContent>
          </Card>

          <Card className="border-blue-200 hover:shadow-lg transition-shadow">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Video className="h-6 w-6 text-blue-600" />
                Video Creation
              </CardTitle>
              <CardDescription>Transform your music into stunning visual experiences</CardDescription>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li>• AI-generated visuals</li>
                <li>• Face swap technology</li>
                <li>• Custom personas</li>
                <li>• HD video output</li>
              </ul>
            </CardContent>
          </Card>

          <Card className="border-cyan-200 hover:shadow-lg transition-shadow">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Users className="h-6 w-6 text-cyan-600" />
                Community
              </CardTitle>
              <CardDescription>Share your creations and discover amazing content</CardDescription>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li>• Global leaderboards</li>
                <li>• Play tracking</li>
                <li>• Reward system</li>
                <li>• Social features</li>
              </ul>
            </CardContent>
          </Card>
        </div>

        {/* CTA Section */}
        <div className="text-center">
          <Card className="max-w-2xl mx-auto bg-gradient-to-r from-purple-500 to-blue-500 text-white border-0">
            <CardHeader>
              <CardTitle className="text-2xl flex items-center justify-center gap-2">
                <Sparkles className="h-6 w-6" />
                Ready to Create?
              </CardTitle>
              <CardDescription className="text-purple-100">
                Join thousands of creators making amazing music and videos with AI
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Button
                size="lg"
                variant="secondary"
                className="text-lg px-8 py-6"
                onClick={() => router.push("/studio")}
              >
                Enter the Studio
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
