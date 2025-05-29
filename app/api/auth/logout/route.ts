import { NextResponse } from "next/server"
import { cookies } from "next/headers"

export async function POST() {
  try {
    // Clear the authentication cookie
    const cookieStore = cookies()
    cookieStore.delete("userId")

    return NextResponse.json({ message: "Logged out successfully" })
  } catch (error) {
    console.error("Logout error:", error)
    return NextResponse.json({ message: "Failed to log out" }, { status: 500 })
  }
}
