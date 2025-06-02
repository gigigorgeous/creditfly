import { NextResponse } from "next/server"
import { redis } from "@/lib/redis"

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const timeFrame = searchParams.get("timeFrame") || "weekly"

    // Calculate time range based on timeFrame
    let startTime: number
    const now = Date.now()

    switch (timeFrame) {
      case "weekly":
        startTime = now - 7 * 24 * 60 * 60 * 1000
        break
      case "monthly":
        startTime = now - 30 * 24 * 60 * 60 * 1000
        break
      case "all-time":
        startTime = 0
        break
      default:
        startTime = now - 7 * 24 * 60 * 60 * 1000
    }

    // Get all users and their play counts
    const userKeys = await redis.keys("user:*:stats")
    const leaderboardData = []

    for (const userKey of userKeys) {
      const userId = userKey.split(":")[1]

      // Get user's plays in the time range
      let playCount = 0
      if (timeFrame === "all-time") {
        const totalPlays = await redis.hget(`user:${userId}:stats`, "totalPlays")
        playCount = Number(totalPlays) || 0
      } else {
        playCount = await redis.zcount(`user:${userId}:plays`, startTime, "+inf")
      }

      if (playCount > 0) {
        // Get user info (you might want to store this in Redis too)
        const userData = {
          id: userId,
          name: `User ${userId.slice(0, 8)}`, // Fallback name
          avatar: `https://api.dicebear.com/7.x/avataaars/svg?seed=${userId}`,
          plays: playCount,
        }

        leaderboardData.push(userData)
      }
    }

    // Sort by play count and take top 10
    const sortedLeaderboard = leaderboardData
      .sort((a, b) => b.plays - a.plays)
      .slice(0, 10)
      .map((user, index) => ({
        ...user,
        rank: index + 1,
      }))

    return NextResponse.json({
      leaderboard: sortedLeaderboard,
      timeFrame,
      totalUsers: leaderboardData.length,
    })
  } catch (error) {
    console.error("Error fetching leaderboard:", error)

    // Return mock data as fallback
    const mockData = Array.from({ length: 10 }, (_, i) => ({
      id: `user_${i + 1}`,
      name: `User ${i + 1}`,
      avatar: `https://api.dicebear.com/7.x/avataaars/svg?seed=user${i + 1}`,
      plays: Math.floor(Math.random() * 1000) + 100,
      rank: i + 1,
    })).sort((a, b) => b.plays - a.plays)

    return NextResponse.json({
      leaderboard: mockData,
      timeFrame: "weekly",
      totalUsers: 10,
      fallback: true,
    })
  }
}
