import { NextResponse } from "next/server"
import { del } from "@vercel/blob"
import { redis } from "@/lib/redis"

export async function DELETE(request: Request, { params }: { params: { id: string } }) {
  try {
    const { id } = params

    // Get file metadata from Redis
    const fileData = await redis.hgetall(`file:${id}`)

    if (!fileData) {
      return NextResponse.json({ message: "File not found" }, { status: 404 })
    }

    // Delete from Vercel Blob
    if (fileData.primaryUrl) {
      await del(fileData.primaryUrl)
    }

    // Delete backup URLs if they exist
    if (fileData.backupUrls) {
      const backupUrls = JSON.parse(fileData.backupUrls)
      for (const url of backupUrls) {
        try {
          await del(url)
        } catch (error) {
          console.error("Failed to delete backup URL:", url, error)
        }
      }
    }

    // Remove from Redis
    await redis.del(`file:${id}`)

    // Remove from user's files if userId exists
    if (fileData.userId) {
      await redis.zrem(`user:${fileData.userId}:files`, id)
    }

    // Update storage stats
    await redis.hincrby("storage:stats", "totalFiles", -1)
    await redis.hincrby("storage:stats", "totalSize", -Number(fileData.fileSize || 0))

    return NextResponse.json({ message: "File deleted successfully" })
  } catch (error) {
    console.error("Delete file error:", error)
    return NextResponse.json({ message: "Failed to delete file" }, { status: 500 })
  }
}
