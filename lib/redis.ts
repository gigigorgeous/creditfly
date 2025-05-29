import { Redis } from "@upstash/redis"

// Create a Redis client using the environment variables provided by Vercel
export const redis = new Redis({
  url: process.env.REDIS_URL || "",
  token: process.env.REDIS_TOKEN || "",
})

// Helper function to track music plays
export async function trackMusicPlay(musicId: string, userId?: string) {
  try {
    // Increment global play count for the music
    await redis.hincrby(`music:${musicId}`, "plays", 1)

    // Add to global trending list with sorted set (score is timestamp)
    await redis.zadd("trending:music", { score: Date.now(), member: musicId })

    // If user is logged in, track their play history
    if (userId) {
      // Add to user's play history (sorted set with timestamp as score)
      await redis.zadd(`user:${userId}:plays`, { score: Date.now(), member: musicId })

      // Increment user's total play count
      await redis.hincrby(`user:${userId}:stats`, "totalPlays", 1)
    }

    return true
  } catch (error) {
    console.error("Redis tracking error:", error)
    return false
  }
}

// Helper function to check if a user qualifies for rewards
export async function checkUserRewardEligibility(userId: string) {
  try {
    // Get total plays in the last 30 days
    const thirtyDaysAgo = Date.now() - 30 * 24 * 60 * 60 * 1000
    const recentPlays = await redis.zcount(`user:${userId}:plays`, thirtyDaysAgo, "+inf")

    // Check if plays exceed threshold (250)
    const isEligible = recentPlays >= 250

    // Check if they've already claimed a reward recently
    const lastRewardClaim = await redis.get(`user:${userId}:lastRewardClaim`)
    const canClaimAgain = !lastRewardClaim || Date.now() - Number.parseInt(lastRewardClaim) > 30 * 24 * 60 * 60 * 1000

    return { isEligible, canClaimAgain, recentPlays }
  } catch (error) {
    console.error("Redis reward check error:", error)
    return { isEligible: false, canClaimAgain: false, recentPlays: 0 }
  }
}

// Helper function to claim a reward
export async function claimUserReward(userId: string, rewardId: string) {
  try {
    // Record the reward claim with timestamp
    await redis.set(`user:${userId}:lastRewardClaim`, Date.now().toString())

    // Add the reward to user's rewards
    await redis.hset(`user:${userId}:rewards`, rewardId, Date.now().toString())

    // Track which reward was claimed
    await redis.hincrby("rewards:stats", rewardId, 1)

    return true
  } catch (error) {
    console.error("Redis reward claim error:", error)
    return false
  }
}

// Helper function to save generated music
export async function saveGeneratedMusic(musicData: any) {
  try {
    const musicId = musicData.id

    // Save music metadata
    await redis.hset(`music:${musicId}`, {
      ...musicData,
      createdAt: musicData.createdAt || new Date().toISOString(),
      plays: 0,
      likes: 0,
    })

    // Add to recent music list
    await redis.zadd("recent:music", { score: Date.now(), member: musicId })

    // If user is associated, add to their collection
    if (musicData.userId) {
      await redis.zadd(`user:${musicData.userId}:music`, {
        score: Date.now(),
        member: musicId,
      })
    }

    return true
  } catch (error) {
    console.error("Redis save music error:", error)
    return false
  }
}

// Helper to get trending music
export async function getTrendingMusic(limit = 10) {
  try {
    // Get the top music IDs from trending sorted set
    const trendingIds = await redis.zrange("trending:music", 0, limit - 1, { rev: true })

    if (!trendingIds.length) return []

    // Fetch full music data for each ID
    const trendingMusic = await Promise.all(
      trendingIds.map(async (id) => {
        const musicData = await redis.hgetall(`music:${id}`)
        return musicData ? { id, ...musicData } : null
      }),
    )

    return trendingMusic.filter(Boolean)
  } catch (error) {
    console.error("Redis get trending error:", error)
    return []
  }
}
