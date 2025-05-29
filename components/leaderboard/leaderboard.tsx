"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Loader2, Trophy, Medal } from "lucide-react"
import { useToast } from "@/hooks/use-toast"

interface LeaderboardUser {
  id: string
  username: string
  avatar: string | null
  score: number
  rank: number
  totalPlays: number
  totalLikes: number
  topGenre: string
}

export function LeaderboardPage() {
  const [activeTab, setActiveTab] = useState("weekly")
  const [isLoading, setIsLoading] = useState(true)
  const [weeklyLeaders, setWeeklyLeaders] = useState<LeaderboardUser[]>([])
  const [monthlyLeaders, setMonthlyLeaders] = useState<LeaderboardUser[]>([])
  const [allTimeLeaders, setAllTimeLeaders] = useState<LeaderboardUser[]>([])
  const { toast } = useToast()

  // Fetch leaderboard data
  useEffect(() => {
    const fetchLeaderboard = async () => {
      try {
        // In a real app, this would be an API call
        // For demo purposes, we'll simulate leaderboard data
        await new Promise((resolve) => setTimeout(resolve, 1500)) // Simulate network delay

        // Demo weekly leaders
        const demoWeeklyLeaders: LeaderboardUser[] = [
          {
            id: "user-1",
            username: "BeatMaster",
            avatar: null,
            score: 2450,
            rank: 1,
            totalPlays: 1245,
            totalLikes: 342,
            topGenre: "Electronic",
          },
          {
            id: "user-2",
            username: "SynthWave",
            avatar: null,
            score: 2120,
            rank: 2,
            totalPlays: 980,
            totalLikes: 287,
            topGenre: "Synthwave",
          },
          {
            id: "user-3",
            username: "MelodyMaker",
            avatar: null,
            score: 1870,
            rank: 3,
            totalPlays: 845,
            totalLikes: 256,
            topGenre: "Pop",
          },
          {
            id: "user-4",
            username: "RhythmKing",
            avatar: null,
            score: 1650,
            rank: 4,
            totalPlays: 720,
            totalLikes: 198,
            topGenre: "Hip-Hop",
          },
          {
            id: "user-5",
            username: "SoundScaper",
            avatar: null,
            score: 1520,
            rank: 5,
            totalPlays: 680,
            totalLikes: 176,
            topGenre: "Ambient",
          },
        ]

        // Demo monthly leaders (similar but with different scores)
        const demoMonthlyLeaders: LeaderboardUser[] = [
          {
            id: "user-2",
            username: "SynthWave",
            avatar: null,
            score: 8750,
            rank: 1,
            totalPlays: 4320,
            totalLikes: 1245,
            topGenre: "Synthwave",
          },
          {
            id: "user-1",
            username: "BeatMaster",
            avatar: null,
            score: 7890,
            rank: 2,
            totalPlays: 3980,
            totalLikes: 1120,
            topGenre: "Electronic",
          },
          {
            id: "user-6",
            username: "MusicMaestro",
            avatar: null,
            score: 6540,
            rank: 3,
            totalPlays: 3210,
            totalLikes: 987,
            topGenre: "Classical",
          },
          {
            id: "user-3",
            username: "MelodyMaker",
            avatar: null,
            score: 5980,
            rank: 4,
            totalPlays: 2870,
            totalLikes: 876,
            topGenre: "Pop",
          },
          {
            id: "user-7",
            username: "GrooveMaster",
            avatar: null,
            score: 5430,
            rank: 5,
            totalPlays: 2540,
            totalLikes: 765,
            topGenre: "Funk",
          },
        ]

        // Demo all-time leaders
        const demoAllTimeLeaders: LeaderboardUser[] = [
          {
            id: "user-8",
            username: "LegendaryBeats",
            avatar: null,
            score: 45670,
            rank: 1,
            totalPlays: 23450,
            totalLikes: 6780,
            topGenre: "Electronic",
          },
          {
            id: "user-2",
            username: "SynthWave",
            avatar: null,
            score: 38920,
            rank: 2,
            totalPlays: 19870,
            totalLikes: 5430,
            topGenre: "Synthwave",
          },
          {
            id: "user-9",
            username: "MusicMogul",
            avatar: null,
            score: 32450,
            rank: 3,
            totalPlays: 16540,
            totalLikes: 4320,
            topGenre: "Hip-Hop",
          },
          {
            id: "user-1",
            username: "BeatMaster",
            avatar: null,
            score: 29870,
            rank: 4,
            totalPlays: 14320,
            totalLikes: 3980,
            topGenre: "Electronic",
          },
          {
            id: "user-10",
            username: "SoundSage",
            avatar: null,
            score: 25430,
            rank: 5,
            totalPlays: 12450,
            totalLikes: 3210,
            topGenre: "Ambient",
          },
        ]

        setWeeklyLeaders(demoWeeklyLeaders)
        setMonthlyLeaders(demoMonthlyLeaders)
        setAllTimeLeaders(demoAllTimeLeaders)
      } catch (error) {
        console.error("Error fetching leaderboard:", error)
        toast({
          title: "Error",
          description: "Failed to load leaderboard data. Please try again.",
          variant: "destructive",
        })
      } finally {
        setIsLoading(false)
      }
    }

    fetchLeaderboard()
  }, [toast])

  // Get the appropriate leaderboard based on active tab
  const getActiveLeaderboard = () => {
    switch (activeTab) {
      case "weekly":
        return weeklyLeaders
      case "monthly":
        return monthlyLeaders
      case "alltime":
        return allTimeLeaders
      default:
        return weeklyLeaders
    }
  }

  // Get rank icon based on position
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

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    )
  }

  return (
    <div className="container py-6 space-y-6">
      <div className="flex flex-col space-y-2">
        <h2 className="text-2xl font-bold tracking-tight">Leaderboard</h2>
        <p className="text-muted-foreground">See the top creators ranked by plays and likes</p>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="weekly">This Week</TabsTrigger>
          <TabsTrigger value="monthly">This Month</TabsTrigger>
          <TabsTrigger value="alltime">All Time</TabsTrigger>
        </TabsList>

        <TabsContent value={activeTab} className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle>Top Creators</CardTitle>
              <CardDescription>
                {activeTab === "weekly" && "The best creators of the week based on plays and likes"}
                {activeTab === "monthly" && "The best creators of the month based on plays and likes"}
                {activeTab === "alltime" && "The all-time best creators based on plays and likes"}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {getActiveLeaderboard().map((user) => (
                  <div
                    key={user.id}
                    className={`flex items-center justify-between p-4 rounded-lg ${
                      user.rank <= 3 ? "bg-primary/5 border border-primary/10" : ""
                    }`}
                  >
                    <div className="flex items-center gap-4">
                      <div className="flex items-center justify-center w-8 h-8">{getRankIcon(user.rank)}</div>

                      <Avatar className="h-10 w-10">
                        <AvatarImage src={user.avatar || ""} alt={user.username} />
                        <AvatarFallback>{user.username.charAt(0).toUpperCase()}</AvatarFallback>
                      </Avatar>

                      <div>
                        <h3 className="font-medium">{user.username}</h3>
                        <div className="flex items-center gap-2 text-sm text-muted-foreground">
                          <Badge variant="outline" className="text-xs">
                            {user.topGenre}
                          </Badge>
                          <span>•</span>
                          <span>{user.totalPlays} plays</span>
                          <span>•</span>
                          <span>{user.totalLikes} likes</span>
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
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
