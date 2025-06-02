"use client"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Trophy, Star, TrendingUp, Music, Users, Crown } from "lucide-react"

interface ProfileBadgesProps {
  badges: string[]
}

const BADGE_CONFIG = {
  "almost-famous": {
    name: "Almost Famous",
    description: "Reached 1,000+ total plays",
    icon: Star,
    color: "bg-yellow-500",
  },
  trending: {
    name: "Trending Artist",
    description: "Had a track in trending this week",
    icon: TrendingUp,
    color: "bg-green-500",
  },
  prolific: {
    name: "Prolific Creator",
    description: "Created 50+ tracks",
    icon: Music,
    color: "bg-blue-500",
  },
  "community-favorite": {
    name: "Community Favorite",
    description: "Received 100+ likes",
    icon: Users,
    color: "bg-purple-500",
  },
  "chart-topper": {
    name: "Chart Topper",
    description: "Had #1 track on leaderboard",
    icon: Crown,
    color: "bg-orange-500",
  },
  "early-adopter": {
    name: "Early Adopter",
    description: "One of the first 100 users",
    icon: Trophy,
    color: "bg-red-500",
  },
}

export function ProfileBadges({ badges }: ProfileBadgesProps) {
  if (!badges || badges.length === 0) return null

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Trophy className="h-5 w-5" />
          Achievements
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {badges.map((badgeId) => {
            const badge = BADGE_CONFIG[badgeId as keyof typeof BADGE_CONFIG]
            if (!badge) return null

            const IconComponent = badge.icon

            return (
              <div key={badgeId} className="flex items-center gap-3 p-3 rounded-lg border bg-card">
                <div className={`p-2 rounded-full ${badge.color} text-white`}>
                  <IconComponent className="h-4 w-4" />
                </div>
                <div className="flex-1">
                  <h4 className="font-medium text-sm">{badge.name}</h4>
                  <p className="text-xs text-muted-foreground">{badge.description}</p>
                </div>
              </div>
            )
          })}
        </div>
      </CardContent>
    </Card>
  )
}
