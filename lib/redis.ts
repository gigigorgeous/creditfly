// Simplified Redis implementation that doesn't cause errors
// This file is kept for compatibility but uses localStorage/memory instead

// Simple in-memory storage for demo purposes
const memoryStorage = new Map<string, any>()

// Helper function to track music plays (in-memory)
export async function trackMusicPlay(musicId: string, userId?: string) {
  try {
    // Increment play count in memory
    const playKey = `music:${musicId}:plays`
    const currentPlays = memoryStorage.get(playKey) || 0
    memoryStorage.set(playKey, currentPlays + 1)

    if (userId) {
      const userPlayKey = `user:${userId}:totalPlays`
      const userPlays = memoryStorage.get(userPlayKey) || 0
      memoryStorage.set(userPlayKey, userPlays + 1)
    }

    console.log(`Tracked play for music ${musicId}`)
    return true
  } catch (error) {
    console.error("Memory tracking error:", error)
    return false
  }
}

// Helper function to check if a user qualifies for rewards (mock)
export async function checkUserRewardEligibility(userId: string) {
  try {
    const userPlayKey = `user:${userId}:totalPlays`
    const recentPlays = memoryStorage.get(userPlayKey) || 0

    const isEligible = recentPlays >= 250
    const canClaimAgain = true // Always allow for demo

    return { isEligible, canClaimAgain, recentPlays }
  } catch (error) {
    console.error("Memory reward check error:", error)
    return { isEligible: false, canClaimAgain: false, recentPlays: 0 }
  }
}

// Helper function to claim a reward (mock)
export async function claimUserReward(userId: string, rewardId: string) {
  try {
    const rewardKey = `user:${userId}:rewards:${rewardId}`
    memoryStorage.set(rewardKey, Date.now().toString())
    console.log(`Reward ${rewardId} claimed for user ${userId}`)
    return true
  } catch (error) {
    console.error("Memory reward claim error:", error)
    return false
  }
}

// Helper function to save generated music (no-op, handled by music-generation-sdk)
export async function saveGeneratedMusic(musicData: any) {
  try {
    // This is now handled by the music generation SDK directly
    console.log("Music data passed through Redis compatibility layer")
    return true
  } catch (error) {
    console.error("Memory save music error:", error)
    return false
  }
}

// Helper to get trending music (mock data)
export async function getTrendingMusic(limit = 10) {
  try {
    // Return mock trending music for demo
    const mockTrending = [
      {
        id: "trending_1",
        title: "Popular Track 1",
        genre: "Pop",
        mood: "Happy",
        plays: 1500,
        likes: 200,
      },
      {
        id: "trending_2",
        title: "Popular Track 2",
        genre: "Rock",
        mood: "Energetic",
        plays: 1200,
        likes: 180,
      },
    ]

    return mockTrending.slice(0, limit)
  } catch (error) {
    console.error("Memory get trending error:", error)
    return []
  }
}

// Export a mock redis object for compatibility
export const redis = {
  ping: async () => "PONG",
  get: async (key: string) => memoryStorage.get(key) || null,
  set: async (key: string, value: any) => memoryStorage.set(key, value),
  hincrby: async (key: string, field: string, increment: number) => {
    const hashKey = `${key}:${field}`
    const current = memoryStorage.get(hashKey) || 0
    const newValue = current + increment
    memoryStorage.set(hashKey, newValue)
    return newValue
  },
  hset: async (key: string, data: Record<string, any>) => {
    Object.entries(data).forEach(([field, value]) => {
      memoryStorage.set(`${key}:${field}`, value)
    })
    return Object.keys(data).length
  },
  zadd: async (key: string, data: { score: number; member: string }) => {
    const setKey = `${key}:set`
    const currentSet = memoryStorage.get(setKey) || []
    currentSet.push(data)
    memoryStorage.set(setKey, currentSet)
    return 1
  },
  zrange: async (key: string, start: number, end: number, options?: { rev: boolean }) => {
    const setKey = `${key}:set`
    const currentSet = memoryStorage.get(setKey) || []
    const members = currentSet.map((item: { member: string }) => item.member)
    return options?.rev ? members.reverse().slice(start, end + 1) : members.slice(start, end + 1)
  },
  hgetall: async (key: string) => {
    const result: Record<string, any> = {}
    for (const [storageKey, value] of memoryStorage.entries()) {
      if (storageKey.startsWith(`${key}:`)) {
        const field = storageKey.replace(`${key}:`, "")
        result[field] = value
      }
    }
    return Object.keys(result).length > 0 ? result : null
  },
  zcount: async (key: string, min: number | string, max: number | string) => {
    const setKey = `${key}:set`
    const currentSet = memoryStorage.get(setKey) || []
    return currentSet.length
  },
}
