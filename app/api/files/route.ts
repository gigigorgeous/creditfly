import { NextResponse } from "next/server"
import { list } from "@vercel/blob"

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const userId = searchParams.get("userId")

    // Get files from Vercel Blob
    const { blobs } = await list()

    // Filter by user if specified
    let userFiles = blobs
    if (userId) {
      userFiles = blobs.filter(
        (blob) => blob.pathname.includes(`/${userId}/`) || blob.pathname.includes(`user-${userId}`),
      )
    }

    // Transform blob data to file format
    const files = userFiles.map((blob) => {
      const pathParts = blob.pathname.split("/")
      const fileName = pathParts[pathParts.length - 1]

      // Determine file type from pathname or content type
      let type: "audio" | "video" | "image" | "other" = "other"
      if (blob.pathname.includes("/music/") || fileName.match(/\.(mp3|wav|flac|aac|ogg)$/i)) {
        type = "audio"
      } else if (blob.pathname.includes("/videos/") || fileName.match(/\.(mp4|webm|mov|avi)$/i)) {
        type = "video"
      } else if (blob.pathname.includes("/images/") || fileName.match(/\.(jpg|jpeg|png|gif|webp)$/i)) {
        type = "image"
      }

      return {
        id: blob.pathname.replace(/[^a-zA-Z0-9]/g, "_"),
        name: fileName,
        type,
        size: blob.size,
        url: blob.url,
        blobUrl: blob.url,
        uploadedAt: blob.uploadedAt,
        mimeType: blob.contentType || "application/octet-stream",
      }
    })

    // Calculate storage stats
    const totalSize = files.reduce((acc, file) => acc + file.size, 0)
    const formatBytes = (bytes: number) => {
      if (bytes === 0) return "0 B"
      const k = 1024
      const sizes = ["B", "KB", "MB", "GB"]
      const i = Math.floor(Math.log(bytes) / Math.log(k))
      return Number.parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + " " + sizes[i]
    }

    const stats = {
      totalFiles: files.length,
      totalSize,
      formattedSize: formatBytes(totalSize),
      usagePercentage: (totalSize / (1024 * 1024 * 1024)) * 100, // Percentage of 1GB
    }

    return NextResponse.json({
      files: files.sort((a, b) => new Date(b.uploadedAt).getTime() - new Date(a.uploadedAt).getTime()),
      stats,
    })
  } catch (error) {
    console.error("Error fetching files:", error)
    return NextResponse.json({ message: "Failed to fetch files" }, { status: 500 })
  }
}
