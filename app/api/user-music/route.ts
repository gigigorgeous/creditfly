import { NextResponse } from "next/server"

// Mock data for when database is not available
const mockUserMusic = [
  {
    id: 1,
    title: "Summer Vibes",
    genre: "Pop",
    mood: "Happy",
    duration_milliseconds: 180000,
    audio_url: "/placeholder.mp3",
    status: "completed",
    created_at: new Date().toISOString(),
  },
  {
    id: 2,
    title: "Midnight Dreams",
    genre: "Electronic",
    mood: "Chill",
    duration_milliseconds: 240000,
    audio_url: "/placeholder.mp3",
    status: "completed",
    created_at: new Date().toISOString(),
  },
]

export async function GET(request: Request) {
  try {
    // For now, return mock data since database connection is having issues
    // TODO: Replace with actual Supabase query when authentication is fixed

    return NextResponse.json({
      success: true,
      data: mockUserMusic,
      message: "User music retrieved successfully (demo mode)",
    })
  } catch (error) {
    console.error("Error fetching user music:", error)

    // Return mock data as fallback
    return NextResponse.json({
      success: true,
      data: mockUserMusic,
      message: "Using demo data due to database connection issues",
    })
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json()

    // Mock response for saving music
    const newTrack = {
      id: Date.now(),
      ...body,
      status: "processing",
      created_at: new Date().toISOString(),
    }

    return NextResponse.json({
      success: true,
      data: newTrack,
      message: "Music track saved successfully (demo mode)",
    })
  } catch (error) {
    console.error("Error saving user music:", error)

    return NextResponse.json(
      {
        success: false,
        error: "Failed to save music track",
        message: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 },
    )
  }
}
