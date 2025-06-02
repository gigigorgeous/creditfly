import { NextResponse } from "next/server"
import { storage } from "@/lib/storage"
import { redis } from "@/lib/redis"

export async function POST(request: Request) {
  try {
    const formData = await request.formData()
    const file = formData.get("file") as File
    const type = formData.get("type") as string // "audio" | "video" | "image"
    const id = formData.get("id") as string
    const userId = formData.get("userId") as string

    if (!file || !type || !id) {
      return NextResponse.json({ message: "Missing required fields" }, { status: 400 })
    }

    // Validate file type
    const allowedTypes = {
      audio: ["audio/mpeg", "audio/wav", "audio/mp3"],
      video: ["video/mp4", "video/webm", "video/mov"],
      image: ["image/jpeg", "image/png", "image/webp"],
    }

    if (!allowedTypes[type as keyof typeof allowedTypes]?.includes(file.type)) {
      return NextResponse.json({ message: "Invalid file type" }, { status: 400 })
    }

    // Upload file with backup
    let uploadResult
    switch (type) {
      case "audio":
        uploadResult = await storage.uploadFile(file, `music/${id}/${file.name}`, { backup: true })
        break
      case "video":
        uploadResult = await storage.uploadFile(file, `videos/${id}/${file.name}`, { backup: true })
        break
      case "image":
        uploadResult = await storage.uploadFile(file, `images/${id}/${file.name}`, { backup: true })
        break
      default:
        return NextResponse.json({ message: "Invalid upload type" }, { status: 400 })
    }

    if (!uploadResult.success) {
      return NextResponse.json({ message: uploadResult.error || "Upload failed" }, { status: 500 })
    }

    // Store file metadata in Redis
    const fileMetadata = {
      id,
      fileName: file.name,
      fileSize: file.size,
      fileType: file.type,
      uploadType: type,
      primaryUrl: uploadResult.primaryUrl,
      backupUrls: uploadResult.backupUrls,
      userId,
      uploadedAt: new Date().toISOString(),
    }

    await redis.hset(`file:${id}`, fileMetadata)

    // Add to user's files if userId provided
    if (userId) {
      await redis.zadd(`user:${userId}:files`, { score: Date.now(), member: id })
    }

    // Track storage usage
    await redis.hincrby("storage:stats", "totalFiles", 1)
    await redis.hincrby("storage:stats", "totalSize", file.size)

    return NextResponse.json({
      success: true,
      fileId: id,
      url: uploadResult.primaryUrl,
      backupUrls: uploadResult.backupUrls,
      metadata: fileMetadata,
    })
  } catch (error) {
    console.error("Upload error:", error)
    return NextResponse.json({ message: "Upload failed" }, { status: 500 })
  }
}
