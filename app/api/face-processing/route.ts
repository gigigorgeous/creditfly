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
    // Handle form data with images
    const formData = await request.formData()
    const sourceImage = formData.get("sourceImage") as File
    const targetImage = formData.get("targetImage") as File
    const mode = (formData.get("mode") as string) || "enhance" // 'enhance' or 'swap'
    const enhancementLevel = Number(formData.get("enhancementLevel")) || 1.0

    if (!sourceImage) {
      return NextResponse.json({ error: "Source image is required" }, { status: 400 })
    }

    // Generate unique IDs for the images
    const sourceId = uuidv4()
    const targetId = targetImage ? uuidv4() : null
    const resultId = uuidv4()

    // Ensure uploads directory exists
    const uploadsDir = await ensureUploadDir()

    // Save the source image
    const sourceBytes = await sourceImage.arrayBuffer()
    const sourceBuffer = Buffer.from(sourceBytes)
    const sourceFilename = `source-${sourceId}${getExtension(sourceImage.name)}`
    const sourcePath = join(uploadsDir, sourceFilename)
    await writeFile(sourcePath, sourceBuffer)

    // Save the target image if provided
    let targetPath = null
    let targetFilename = null
    if (targetImage) {
      const targetBytes = await targetImage.arrayBuffer()
      const targetBuffer = Buffer.from(targetBytes)
      targetFilename = `target-${targetId}${getExtension(targetImage.name)}`
      targetPath = join(uploadsDir, targetFilename)
      await writeFile(targetPath, targetBuffer)
    }

    // Build the request payload for the face processing service
    const apiFormData = new FormData()
    apiFormData.append("source_image", sourceImage)
    apiFormData.append("mode", mode)
    apiFormData.append("enhancement_level", enhancementLevel.toString())
    if (targetImage) {
      apiFormData.append("target_image", targetImage)
    }

    // Call the face processing API service
    // In a production environment, you'd call your actual face processing service
    let resultUrl

    if (process.env.FACE_PROCESSING_API_URL) {
      // If we have a real API endpoint, use it
      const apiResponse = await fetch(`${FACE_PROCESSING_API_URL}/process`, {
        method: "POST",
        body: apiFormData,
      })

      if (!apiResponse.ok) {
        const error = await apiResponse.text()
        throw new Error(`Face processing API error: ${error}`)
      }

      const result = await apiResponse.json()
      resultUrl = result.result_url
    } else {
      // If no API endpoint is available, return the source image as a simulation
      resultUrl = `/uploads/${sourceFilename}`
    }

    return NextResponse.json({
      success: true,
      sourceImageUrl: `/uploads/${sourceFilename}`,
      targetImageUrl: targetPath ? `/uploads/${targetFilename}` : null,
      resultImageUrl: resultUrl,
      processingMode: mode,
    })
  } catch (error) {
    console.error("Error processing face:", error)
    return NextResponse.json(
      { error: "Failed to process face", message: error instanceof Error ? error.message : "Unknown error" },
      { status: 500 },
    )
  }
}

// Helper function to get file extension
function getExtension(filename: string): string {
  const parts = filename.split(".")
  return parts.length > 1 ? `.${parts[parts.length - 1]}` : ""
}
