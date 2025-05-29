import { NextResponse } from "next/server"
import { writeFile, mkdir } from "fs/promises"
import { existsSync } from "fs"
import { join } from "path"
import { v4 as uuidv4 } from "uuid"

// Configuration for the face processing service
const FACE_PROCESSING_API_URL = process.env.FACE_PROCESSING_API_URL || "http://localhost:8000"

// Ensure the uploads directory exists
async function ensureUploadDir() {
  const uploadsDir = join(process.cwd(), "public", "uploads")
  if (!existsSync(uploadsDir)) {
    await mkdir(uploadsDir, { recursive: true })
  }
  return uploadsDir
}

export async function POST(request: Request) {
  try {
    // Handle form data with video
    const formData = await request.formData()
    const sourceVideo = formData.get("sourceVideo") as File
    const personaId = formData.get("personaId") as string

    if (!sourceVideo) {
      return NextResponse.json({ error: "Source video is required" }, { status: 400 })
    }

    if (!personaId) {
      return NextResponse.json({ error: "Persona ID is required" }, { status: 400 })
    }

    // Generate unique IDs for the video
    const sourceId = uuidv4()
    const resultId = uuidv4()

    // Ensure uploads directory exists
    const uploadsDir = await ensureUploadDir()

    // Save the source video
    const sourceBytes = await sourceVideo.arrayBuffer()
    const sourceBuffer = Buffer.from(sourceBytes)
    const sourceFilename = `source-${sourceId}${getExtension(sourceVideo.name)}`
    const sourcePath = join(uploadsDir, sourceFilename)
    await writeFile(sourcePath, sourceBuffer)

    // In a real implementation, you would process the video with the face processing service
    // For the demo, we'll return a simulated result

    // Simulate video processing delay
    await new Promise((resolve) => setTimeout(resolve, 3000))

    // Return the processed video details
    return NextResponse.json({
      success: true,
      videoUrl: "/api/stream-video/processed-face-swap",
      thumbnailUrl: "/api/video-thumbnail/processed-face-swap",
      title: `Face Swapped ${sourceVideo.name.split(".")[0]}`,
    })
  } catch (error) {
    console.error("Error processing video:", error)
    return NextResponse.json(
      { error: "Failed to process video", message: error instanceof Error ? error.message : "Unknown error" },
      { status: 500 },
    )
  }
}

// Helper function to get file extension
function getExtension(filename: string): string {
  const parts = filename.split(".")
  return parts.length > 1 ? `.${parts[parts.length - 1]}` : ""
}
