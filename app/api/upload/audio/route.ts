import { NextResponse } from "next/server"
import { put } from "@vercel/blob"
import { redis } from "@/lib/redis"

export async function POST(request: Request) {
  try {
    const formData = await request.formData()
    const file = formData.get("file") as File
    const musicId = formData.get("musicId") as string
    const userId = formData.get("userId") as string
    const title = formData.get("title") as string

    if (!file) {
      return NextResponse.json({ error: "No file provided" }, { status: 400 })
    }

    // Validate file type
    const allowedTypes = ["audio/mpeg", "audio/wav", "audio/mp3", "audio/m4a"]
    if (!allowedTypes.includes(file.type)) {
      return NextResponse.json({ error: "Invalid file type. Please upload an audio file." }, { status: 400 })
    }

    // Validate file size (max 50MB)
    const maxSize = 50 * 1024 * 1024 // 50MB
    if (file.size > maxSize) {
      return NextResponse.json({ error: "File too large. Maximum size is 50MB." }, { status: 400 })
    }

    // Generate filename
    const filename = `music/${musicId || Date.now()}/${title?.replace(/[^a-zA-Z0-9]/g, "_") || "audio"}.${file.name.split(".").pop()}`

    // Upload to Vercel Blob
    const blob = await put(filename, file, {
      access: "public",
      contentType: file.type,
    })

    // Store file metadata in Redis
    const fileMetadata = {
      id: musicId || `audio_${Date.now()}`,
      filename: file.name,
      originalName: file.name,
      size: file.size,
      type: file.type,
      blobUrl: blob.url,
      uploadedAt: new Date().toISOString(),
      userId: userId || "anonymous",
    }

    await redis.hset(`file:${fileMetadata.id}`, fileMetadata)

    // Add to user's files if userId provided
    if (userId) {
      await redis.zadd(`user:${userId}:files`, {
        score: Date.now(),
        member: fileMetadata.id,
      })
    }

    // Update storage stats
    await redis.hincrby("storage:stats", "totalFiles", 1)
    await redis.hincrby("storage:stats", "totalSize", file.size)
    await redis.hincrby("storage:stats", "audioFiles", 1)

    return NextResponse.json({
      success: true,
      fileId: fileMetadata.id,
      url: blob.url,
      filename: blob.pathname,
      size: file.size,
      metadata: fileMetadata,
    })
  } catch (error) {
    console.error("Audio upload error:", error)
    return NextResponse.json({ error: "Failed to upload audio file" }, { status: 500 })
  }
}
