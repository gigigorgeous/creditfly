import { NextResponse } from "next/server"
import { MurekaAIClient } from "@/lib/rapidapi-client"

export async function GET() {
  try {
    const client = new MurekaAIClient()
    const accounts = await client.getAccounts()

    // Ensure we're returning an array, even if the API call failed
    return NextResponse.json({
      success: true,
      data: Array.isArray(accounts) ? accounts : [],
    })
  } catch (error) {
    console.error("Error fetching Mureka accounts:", error)
    // Return an empty array on error to prevent client-side errors
    return NextResponse.json(
      {
        success: false,
        data: [],
        error: "Failed to fetch accounts",
      },
      { status: 500 },
    )
  }
}
