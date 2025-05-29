import { NextResponse } from "next/server"
import { v4 as uuidv4 } from "uuid"

// In a real app, you would use a database to store users
// For this demo, we'll simulate user storage
const users: any[] = []

export async function POST(request: Request) {
  try {
    const { username, email, password } = await request.json()

    // Basic validation
    if (!username || !email || !password) {
      return NextResponse.json({ message: "Missing required fields" }, { status: 400 })
    }

    // Check if user already exists
    const existingUser = users.find((user) => user.email === email)
    if (existingUser) {
      return NextResponse.json({ message: "User with this email already exists" }, { status: 409 })
    }

    // In a real app, you would hash the password
    // For this demo, we'll just store it as is (not secure!)
    const newUser = {
      id: uuidv4(),
      username,
      email,
      password,
      createdAt: new Date().toISOString(),
      profilePicture: null,
      bio: "",
    }

    // Add user to our "database"
    users.push(newUser)

    // Return success response (without the password)
    const { password: _, ...userWithoutPassword } = newUser
    return NextResponse.json(userWithoutPassword, { status: 201 })
  } catch (error) {
    console.error("Signup error:", error)
    return NextResponse.json({ message: "Failed to create user" }, { status: 500 })
  }
}
