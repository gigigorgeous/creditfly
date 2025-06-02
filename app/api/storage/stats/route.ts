import { NextResponse } from "next/server"
import { list } from "@vercel/blob"
import { redis } from "@/lib/redis"

export async function GET() {
  try {
    // Get blob storage stats
    const { blobs } = await list()
    const totalBlobSize = blobs.reduce((acc, blob) => acc + blob.size, 0)
    const totalBlobFiles = blobs.length

    // Get Redis stats
    const redisStats = await redis.hgetall("storage:stats")
    const totalRedisFiles = Number.parseInt(redisStats.totalFiles || "0")
    const totalRedisSize = Number.parseInt(redisStats.totalSize || "0")
    const audioFiles = Number.parseInt(redisStats.audioFiles || "0")
    const videoFiles = Number.parseInt(redisStats.videoFiles || "0")
    const imageFiles = Number.parseInt(redisStats.imageFiles || "0")

    // Get user stats
    const globalStats = await redis.hgetall("global:stats")
    const totalTracks = Number.parseInt(globalStats.totalTracks || "0")
    const totalDuration = Number.parseInt(globalStats.totalDuration || "0")

    const formatBytes = (bytes: number): string => {
      if (bytes === 0) return "0 B"
      const k = 1024
      const sizes = ["B", "KB", "MB", "GB"]
      const i = Math.floor(Math.log(bytes) / Math.log(k))
      return Number.parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i]
    }

    const formatDuration = (seconds: number): string => {
      const hours = Math.floor(seconds / 3600)
      const minutes = Math.floor((seconds % 3600) / 60)
      if (hours > 0) {
        return `${hours}h ${minutes}m`
      }
      return `${minutes}m`
    }

    return NextResponse.json({
      blob: {
        totalFiles: totalBlobFiles,
        totalSize: totalBlobSize,
        formattedSize: formatBytes(totalBlobSize),
        files: blobs.map((blob) => ({
          url: blob.url,
          pathname: blob.pathname,
          size: blob.size,
          uploadedAt: blob.uploadedAt,
        })),
      },
      redis: {
        totalFiles: totalRedisFiles,
        totalSize: totalRedisSize,
        formattedSize: formatBytes(totalRedisSize),
        audioFiles,
        videoFiles,
        imageFiles,
      },
      music: {
        totalTracks,
        totalDuration,
        formattedDuration: formatDuration(totalDuration),
        averageDuration: totalTracks > 0 ? Math.round(totalDuration / totalTracks) : 0,
      },
      summary: {
        totalFiles: Math.max(totalBlobFiles, totalRedisFiles),
        totalSize: Math.max(totalBlobSize, totalRedisSize),
        formattedSize: formatBytes(Math.max(totalBlobSize, totalRedisSize)),
        storageProviders: ["Vercel Blob", "Redis Cache"],
      },
    })
  } catch (error) {
    console.error("Error fetching storage stats:", error)
    return NextResponse.json({ error: "Failed to fetch storage statistics" }, { status: 500 })
  }
}
