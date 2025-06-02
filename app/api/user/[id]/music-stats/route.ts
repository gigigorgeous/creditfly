import { NextResponse } from "next/server"
import { redis } from "@/lib/redis"

export async function GET(request: Request, { params }: { params: { id: string } }) {
  try {
    const { id } = params

    // Get user's music stats from Redis
    const userStats = await redis.hgetall(`user:${id}:stats`)

    // Get user's music tracks
    const userMusicIds = await redis.zrange(`user:${id}:music`, 0, -1)

    // Get all user's tracks to calculate additional stats
    const tracks = await Promise.all(
      userMusicIds.map(async (musicId) => {
        const musicData = await redis.hgetall(`music:${musicId}`)
        return musicData ? { id: musicId, ...musicData } : null
      }),
    )

    const validTracks = tracks.filter(Boolean)

    // Calculate stats
    const totalTracks = validTracks.length
    const totalDuration = validTracks.reduce((acc, track) => acc + Number(track.duration || 0), 0)
    const totalPlays = validTracks.reduce((acc, track) => acc + Number(track.plays || 0), 0)
    const totalLikes = validTracks.reduce((acc, track) => acc + Number(track.likes || 0), 0)

    // Calculate favorite genre
    const genreCounts = validTracks.reduce(
      (acc, track) => {
        const genre = track.genre || "Unknown"
        acc[genre] = (acc[genre] || 0) + 1
        return acc
      },
      {} as Record<string, number>,
    )

    const favoriteGenre =
      Object.entries(genreCounts).reduce((a, b) => (genreCounts[a[0]] > genreCounts[b[0]] ? a : b))?.[0] || "Unknown"

    // Calculate storage used (approximate)
    const averageFileSize = 5 * 1024 * 1024 // 5MB average per track
    const storageUsed = totalTracks * averageFileSize
    const formatBytes = (bytes: number) => {
      if (bytes === 0) return "0 B"
      const k = 1024
      const sizes = ["B", "KB", "MB", "GB"]
      const i = Math.floor(Math.log(bytes) / Math.log(k))
      return Number.parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + " " + sizes[i]
    }

    const stats = {
      totalTracks,
      totalDuration,
      totalPlays,
      totalLikes,
      storageUsed: formatBytes(storageUsed),
      favoriteGenre,
    }

    return NextResponse.json(stats)
  } catch (error) {
    console.error("Error fetching user music stats:", error)
    return NextResponse.json({ message: "Failed to fetch stats" }, { status: 500 })
  }
}
