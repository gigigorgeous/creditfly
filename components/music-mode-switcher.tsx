"use client"
import { Card, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Music, Zap, Video } from "lucide-react"
import Link from "next/link"

export function MusicModeSwitcher() {
  const modes = [
    {
      id: "studio",
      title: "Music Studio",
      description: "Interactive creation with live effects",
      icon: <Music className="h-6 w-6" />,
      href: "/music-studio",
      badge: "Live",
      color: "bg-blue-500",
    },
    {
      id: "lab",
      title: "Music Lab",
      description: "Professional AI generation & analytics",
      icon: <Zap className="h-6 w-6" />,
      href: "/music-lab",
      badge: "Pro",
      color: "bg-purple-500",
    },
    {
      id: "video",
      title: "Video Generator",
      description: "Create music videos with AI",
      icon: <Video className="h-6 w-6" />,
      href: "/music-video-generator",
      badge: "New",
      color: "bg-pink-500",
    },
  ]

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
      {modes.map((mode) => (
        <Link key={mode.id} href={mode.href}>
          <Card className="hover:shadow-lg transition-shadow cursor-pointer group">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <div className={`p-2 rounded-lg ${mode.color} text-white`}>{mode.icon}</div>
                <Badge variant="secondary">{mode.badge}</Badge>
              </div>
              <CardTitle className="group-hover:text-primary transition-colors">{mode.title}</CardTitle>
              <CardDescription>{mode.description}</CardDescription>
            </CardHeader>
          </Card>
        </Link>
      ))}
    </div>
  )
}
