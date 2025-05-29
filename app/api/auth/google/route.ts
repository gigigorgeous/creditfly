import { NextResponse } from "next/server"
import { cookies } from "next/headers"
import { v4 as uuidv4 } from "uuid"

// In a real app, this would handle the Google OAuth flow
// For this demo, we'll simulate a successful authentication
export async function POST() {
  try {
    // In a real app, this would validate the Google token
    // and fetch the user's Google profile

    // Simulate a user
    const userId = uuidv4()
    const user = {
      id: userId,
      username: "GoogleUser" + userId.substring(0, 5),
      email: `user${userId.substring(0, 5)}@gmail.com`,
      profilePicture: null,
      createdAt: new Date().toISOString(),
    }

    // Set authentication cookie
    const cookieStore = cookies()
    cookieStore.set("userId", userId, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      maxAge: 60 * 60 * 24 * 7, // 1 week
      path: "/",
    })

    return NextResponse.json(user)
  } catch (error) {
    console.error("Google auth error:", error)
    return NextResponse.json({ message: "Failed to authenticate with Google" }, { status: 500 })
  }
}
