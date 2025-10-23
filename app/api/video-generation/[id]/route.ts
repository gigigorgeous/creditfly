import { NextResponse } from "next/server"

export async function GET(request: Request, { params }: { params: { id: string } }) {
  try {
    const id = params.id

    if (!id) {
      return NextResponse.json({ error: "Video ID is required" }, { status: 400 })
    }

    // In a real implementation, you would check the status of the video generation
    // For now, we'll simulate a response

    // Simulate different statuses based on the ID
    let status = "complete"
    if (id.endsWith("1")) {
      status = "processing"
    } else if (id.endsWith("2")) {
      status = "failed"
    }

    return NextResponse.json({
      id: id,
      status: status,
      videoUrl: status === "complete" ? `/videos/${id}.mp4` : null,
      thumbnailUrl: status === "complete" ? `/thumbnails/${id}.jpg` : null,
      progress: status === "processing" ? Math.floor(Math.random() * 100) : null,
      error: status === "failed" ? "Failed to generate video" : null,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    })
  } catch (error) {
    console.error("Error checking video generation status:", error)
    return NextResponse.json({ error: "Failed to check video generation status" }, { status: 500 })
  }
}
