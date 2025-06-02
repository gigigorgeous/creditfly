import { NextResponse } from "next/server"
import { checkUserRewardEligibility } from "@/lib/redis"

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const userId = searchParams.get("userId")

    if (!userId) {
      return NextResponse.json({ error: "User ID is required" }, { status: 400 })
    }

    const eligibility = await checkUserRewardEligibility(userId)

    return NextResponse.json(eligibility)
  } catch (error) {
    console.error("Error checking reward eligibility:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
