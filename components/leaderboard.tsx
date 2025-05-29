"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Trophy, Medal, Music, Film } from "lucide-react"

interface LeaderboardUser {
  id: string
  username: string
  avatar?: string
  score: number
  rank: number
  plays: number
  creations: number
  badge?: string
}

export function Leaderboard() {
  const [activeTab, setActiveTab] = useState("weekly")
  const [leaderboardData, setLeaderboardData] = useState<LeaderboardUser[]>([])

  useEffect(() => {
    // In a real app, this would fetch from an API
    const mockData: LeaderboardUser[] = [
      {
        id: "user1",
        username: "musicmaster",
        score: 1250,
        rank: 1,
        plays: 450,
        creations: 12,
        badge: "top-creator",
      },
      {
        id: "user2",
        username: "beatmaker",
        score: 980,
        rank: 2,
        plays: 320,
        creations: 8,
        badge: "rising-star",
      },
      {
        id: "user3",
        username: "melodymind",
        score: 820,
        rank: 3,
        plays: 280,
        creations: 6,
      },
      {
        id: "user4",
        username: "synthwave",
        score: 750,
        rank: 4,
        plays: 210,
        creations: 5,
      },
      {
        id: "user5",
        username: "audioalchemist",
        score: 680,
        rank: 5,
        plays: 190,
        creations: 7,
      },
    ]

    setLeaderboardData(mockData)
  }, [activeTab]) // Reload when tab changes

  const getRankIcon = (rank: number) => {
    switch (rank) {
      case 1:
        return <Trophy className="h-5 w-5 text-yellow-500" />
      case 2:
        return <Medal className="h-5 w-5 text-gray-400" />
      case 3:
        return <Medal className="h-5 w-5 text-amber-700" />
      default:
        return <span className="text-sm font-medium">{rank}</span>
    }
  }

  const getBadgeColor = (badge?: string) => {
    switch (badge) {
      case "top-creator":
        return "bg-purple-500/20 text-purple-600 dark:text-purple-400"
      case "rising-star":
        return "bg-blue-500/20 text-blue-600 dark:text-blue-400"
      default:
        return "bg-gray-500/20 text-gray-600 dark:text-gray-400"
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Leaderboard</CardTitle>
        <CardDescription>Top creators this week</CardDescription>
      </CardHeader>
      <CardContent>
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="weekly">Weekly</TabsTrigger>
            <TabsTrigger value="monthly">Monthly</TabsTrigger>
            <TabsTrigger value="alltime">All Time</TabsTrigger>
          </TabsList>

          <div className="mt-4 space-y-4">
            {leaderboardData.map((user) => (
              <div
                key={user.id}
                className={`flex items-center justify-between p-3 rounded-lg ${
                  user.rank <= 3 ? "bg-primary/5 border border-primary/10" : ""
                }`}
              >
                <div className="flex items-center gap-3">
                  <div className="flex items-center justify-center w-8 h-8">{getRankIcon(user.rank)}</div>

                  <Avatar className="h-10 w-10">
                    <AvatarImage src={user.avatar || `https://avatar.vercel.sh/${user.username}`} alt={user.username} />
                    <AvatarFallback>{user.username.charAt(0).toUpperCase()}</AvatarFallback>
                  </Avatar>

                  <div>
                    <div className="font-medium">{user.username}</div>
                    <div className="flex items-center gap-2 text-xs text-muted-foreground">
                      <span className="flex items-center">
                        <Music className="h-3 w-3 mr-1" />
                        {user.creations}
                      </span>
                      <span className="flex items-center">
                        <Film className="h-3 w-3 mr-1" />
                        {user.plays}
                      </span>
                      {user.badge && (
                        <Badge variant="outline" className={`text-xs ${getBadgeColor(user.badge)}`}>
                          {user.badge === "top-creator" ? "Top Creator" : "Rising Star"}
                        </Badge>
                      )}
                    </div>
                  </div>
                </div>

                <div className="text-right">
                  <div className="text-xl font-bold">{user.score}</div>
                  <div className="text-xs text-muted-foreground">points</div>
                </div>
              </div>
            ))}
          </div>
        </Tabs>
      </CardContent>
    </Card>
  )
}
