import { NextResponse } from "next/server"
import { cookies } from "next/headers"

// In a real app, you would use a database to store users
// For this demo, we'll simulate user storage with a global variable
// This is just for demonstration - in a real app, use a proper database
const users: any[] = []

export async function POST(request: Request) {
  try {
    const { email, password } = await request.json()

    // Basic validation
    if (!email || !password) {
      return NextResponse.json({ message: "Missing required fields" }, { status: 400 })
    }

    // Find user by email
    const user = users.find((user) => user.email === email)

    // Check if user exists and password matches
    if (!user || user.password !== password) {
      return NextResponse.json({ message: "Invalid email or password" }, { status: 401 })
    }

    // In a real app, you would create a JWT token
    // For this demo, we'll just set a cookie with the user ID
    const cookieStore = cookies()
    cookieStore.set("userId", user.id, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      maxAge: 60 * 60 * 24 * 7, // 1 week
      path: "/",
    })

    // Return success response (without the password)
    const { password: _, ...userWithoutPassword } = user
    return NextResponse.json(userWithoutPassword)
  } catch (error) {
    console.error("Login error:", error)
    return NextResponse.json({ message: "Failed to log in" }, { status: 500 })
  }
}
