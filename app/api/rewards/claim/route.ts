import { NextResponse } from "next/server"
import { claimUserReward } from "@/lib/redis"

export async function POST(request: Request) {
  try {
    const { userId, rewardId } = await request.json()

    if (!userId || !rewardId) {
      return NextResponse.json({ error: "User ID and Reward ID are required" }, { status: 400 })
    }

    // Claim the reward in Redis
    const success = await claimUserReward(userId, rewardId)

    if (!success) {
      return NextResponse.json({ error: "Failed to claim reward" }, { status: 500 })
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Error claiming reward:", error)
    return NextResponse.json({ error: "Failed to claim reward" }, { status: 500 })
  }
}
