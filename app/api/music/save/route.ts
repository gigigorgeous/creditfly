import { NextResponse } from "next/server"
import { put } from "@vercel/blob"
import { redis } from "@/lib/redis"
import { v4 as uuidv4 } from "uuid"

export async function POST(request: Request) {
  try {
    const { music, userId } = await request.json()

    if (!music) {
      return NextResponse.json({ error: "Music data is required" }, { status: 400 })
    }

    // Generate a unique ID for this music track
    const musicId = music.id || uuidv4()

    // If the music has an audio URL, download and save it to blob storage
    let blobUrl = music.audioUrl
    if (music.audioUrl && !music.audioUrl.includes("blob.vercel-storage.com")) {
      try {
        // Download the audio file
        const audioResponse = await fetch(music.audioUrl)
        if (audioResponse.ok) {
          const audioBuffer = await audioResponse.arrayBuffer()

          // Upload to Vercel Blob
          const filename = `music/${musicId}/${music.title.replace(/[^a-zA-Z0-9]/g, "_")}.mp3`
          const blob = await put(filename, audioBuffer, {
            access: "public",
            contentType: "audio/mpeg",
          })

          blobUrl = blob.url
        }
      } catch (error) {
        console.error("Error saving audio to blob:", error)
        // Continue with original URL if blob upload fails
      }
    }

    // Prepare music data for storage
    const musicData = {
      id: musicId,
      title: music.title,
      audioUrl: music.audioUrl,
      blobUrl: blobUrl,
      genre: music.genre,
      mood: music.mood,
      duration: music.duration,
      createdAt: music.createdAt || new Date().toISOString(),
      musicDescription: JSON.stringify(music.musicDescription || {}),
      aiGenerated: music.aiGenerated || true,
      userId: userId || "anonymous",
      plays: 0,
      likes: 0,
    }

    // Save to Redis
    await redis.hset(`music:${musicId}`, musicData)

    // Add to user's music collection
    if (userId) {
      await redis.zadd(`user:${userId}:music`, {
        score: Date.now(),
        member: musicId,
      })
    }

    // Add to recent music
    await redis.zadd("recent:music", {
      score: Date.now(),
      member: musicId,
    })

    // Add to genre-specific list
    await redis.zadd(`genre:${music.genre.toLowerCase()}`, {
      score: Date.now(),
      member: musicId,
    })

    // Update user stats
    if (userId) {
      await redis.hincrby(`user:${userId}:stats`, "totalTracks", 1)
      await redis.hincrby(`user:${userId}:stats`, "totalDuration", music.duration || 0)
    }

    // Update global stats
    await redis.hincrby("global:stats", "totalTracks", 1)
    await redis.hincrby("global:stats", "totalDuration", music.duration || 0)

    return NextResponse.json({
      success: true,
      id: musicId,
      blobUrl: blobUrl,
      message: "Music saved successfully",
    })
  } catch (error) {
    console.error("Error saving music:", error)
    return NextResponse.json({ error: "Failed to save music" }, { status: 500 })
  }
}
