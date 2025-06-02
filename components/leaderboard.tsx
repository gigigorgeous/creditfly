"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Skeleton } from "@/components/ui/skeleton"

type TimeFrame = "weekly" | "monthly" | "allTime"

interface LeaderboardEntry {
  userId: string
  username: string
  avatarUrl?: string
  plays: number
  rank: number
}

// Fallback mock data in case the API fails
const MOCK_DATA: Record<TimeFrame, LeaderboardEntry[]> = {
  weekly: [
    { userId: "user1", username: "JohnDoe", plays: 1250, rank: 1 },
    { userId: "user2", username: "AliceSmith", plays: 980, rank: 2 },
    { userId: "user3", username: "BobJohnson", plays: 875, rank: 3 },
    { userId: "user4", username: "EmmaWilson", plays: 720, rank: 4 },
    { userId: "user5", username: "MichaelBrown", plays: 650, rank: 5 },
  ],
  monthly: [
    { userId: "user2", username: "AliceSmith", plays: 3200, rank: 1 },
    { userId: "user1", username: "JohnDoe", plays: 2800, rank: 2 },
    { userId: "user6", username: "SarahDavis", plays: 2300, rank: 3 },
    { userId: "user3", username: "BobJohnson", plays: 1950, rank: 4 },
    { userId: "user7", username: "DavidMiller", plays: 1820, rank: 5 },
  ],
  allTime: [
    { userId: "user1", username: "JohnDoe", plays: 12500, rank: 1 },
    { userId: "user2", username: "AliceSmith", plays: 10200, rank: 2 },
    { userId: "user6", username: "SarahDavis", plays: 9800, rank: 3 },
    { userId: "user8", username: "JamesWilson", plays: 8500, rank: 4 },
    { userId: "user3", username: "BobJohnson", plays: 7200, rank: 5 },
  ],
}

export function Leaderboard() {
  const [timeFrame, setTimeFrame] = useState<TimeFrame>("weekly")
  const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [useFallbackData, setUseFallbackData] = useState(false)

  useEffect(() => {
    const fetchLeaderboard = async () => {
      setLoading(true)
      setError(null)

      try {
        // Check if we're in preview mode or if we should use fallback data
        if (window.location.pathname === "/" || useFallbackData) {
          // Use mock data in preview mode
          console.log("Using fallback leaderboard data for preview")
          setTimeout(() => {
            setLeaderboard(MOCK_DATA[timeFrame])
            setLoading(false)
          }, 500) // Simulate loading delay
          return
        }

        const response = await fetch(`/api/leaderboard?timeFrame=${timeFrame}`, {
          cache: "no-store",
          headers: {
            Accept: "application/json",
          },
        })

        if (!response.ok) {
          throw new Error(`Failed to fetch leaderboard data: ${response.status} ${response.statusText}`)
        }

        // Check if the response is JSON
        const contentType = response.headers.get("content-type")
        if (!contentType || !contentType.includes("application/json")) {
          console.error("Received non-JSON response:", await response.text())
          throw new Error("Server returned non-JSON response")
        }

        const data = await response.json()

        // Ensure data is properly formatted
        const formattedData = Array.isArray(data)
          ? data.map((entry: any, index: number) => ({
              userId: entry.userId || `user-${index}`,
              username: entry.username || `User ${index + 1}`,
              avatarUrl: entry.avatarUrl,
              plays: entry.plays || 0,
              rank: index + 1,
            }))
          : []

        setLeaderboard(formattedData)
      } catch (error) {
        console.error("Error fetching leaderboard:", error)

        // If we get an error, use fallback data
        console.log("Using fallback data due to API error")
        setLeaderboard(MOCK_DATA[timeFrame])
        setUseFallbackData(true)

        // Still show error for debugging purposes
        setError("Using demo data. API error: " + (error instanceof Error ? error.message : String(error)))
      } finally {
        setLoading(false)
      }
    }

    fetchLeaderboard()
  }, [timeFrame, useFallbackData])

  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map((part) => part[0])
      .join("")
      .toUpperCase()
      .substring(0, 2)
  }

  const getRankColor = (rank: number) => {
    if (rank === 1) return "bg-yellow-500"
    if (rank === 2) return "bg-gray-300"
    if (rank === 3) return "bg-amber-600"
    return "bg-slate-200"
  }

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="text-xl flex items-center justify-between">
          <span>Top Creators</span>
          <Tabs value={timeFrame} onValueChange={(v) => setTimeFrame(v as TimeFrame)}>
            <TabsList>
              <TabsTrigger value="weekly">Weekly</TabsTrigger>
              <TabsTrigger value="monthly">Monthly</TabsTrigger>
              <TabsTrigger value="allTime">All Time</TabsTrigger>
            </TabsList>
          </Tabs>
        </CardTitle>
      </CardHeader>
      <CardContent>
        {loading ? (
          // Loading skeletons
          <div className="space-y-4">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="flex items-center gap-4">
                <Skeleton className="h-8 w-8 rounded-full" />
                <div className="space-y-2 flex-1">
                  <Skeleton className="h-4 w-[200px]" />
                  <Skeleton className="h-3 w-[100px]" />
                </div>
              </div>
            ))}
          </div>
        ) : leaderboard.length === 0 ? (
          <div className="text-center py-4 text-muted-foreground">No data available for this time period</div>
        ) : (
          <>
            {error && <div className="mb-4 p-2 text-xs bg-amber-50 text-amber-800 rounded-md">{error}</div>}
            <div className="space-y-4">
              {leaderboard.map((entry) => (
                <div key={entry.userId} className="flex items-center gap-4">
                  <div
                    className={`flex items-center justify-center h-8 w-8 rounded-full text-white font-bold ${getRankColor(entry.rank)}`}
                  >
                    {entry.rank}
                  </div>
                  <Avatar>
                    <AvatarImage src={entry.avatarUrl || "/placeholder.svg?height=40&width=40"} />
                    <AvatarFallback>{getInitials(entry.username)}</AvatarFallback>
                  </Avatar>
                  <div className="flex-1">
                    <div className="font-medium">{entry.username}</div>
                    <div className="text-sm text-muted-foreground">
                      {entry.plays.toLocaleString()} {entry.plays === 1 ? "play" : "plays"}
                    </div>
                  </div>
                  {entry.rank <= 3 && (
                    <Badge variant={entry.rank === 1 ? "default" : "outline"} className="ml-auto">
                      {entry.rank === 1 ? "🏆 Top Creator" : `Top ${entry.rank}`}
                    </Badge>
                  )}
                </div>
              ))}
            </div>
          </>
        )}
      </CardContent>
    </Card>
  )
}
