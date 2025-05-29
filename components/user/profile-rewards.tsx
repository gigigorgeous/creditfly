"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { Sparkles, Music, Film } from "lucide-react"

interface ProfileRewardsProps {
  rewards?: {
    unlimitedUntil?: string
    songGenerations?: number
    videoGenerations?: number
  }
}

export function ProfileRewards({ rewards }: ProfileRewardsProps) {
  if (!rewards) {
    return null
  }

  const hasUnlimited = rewards.unlimitedUntil && new Date(rewards.unlimitedUntil) > new Date()
  const hasSongGenerations = rewards.songGenerations && rewards.songGenerations > 0
  const hasVideoGenerations = rewards.videoGenerations && rewards.videoGenerations > 0

  if (!hasUnlimited && !hasSongGenerations && !hasVideoGenerations) {
    return null
  }

  // Calculate days remaining for unlimited subscription
  const daysRemaining = hasUnlimited
    ? Math.ceil((new Date(rewards.unlimitedUntil!).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24))
    : 0

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg">Your Rewards</CardTitle>
        <CardDescription>Active rewards and benefits</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {hasUnlimited && (
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Sparkles className="h-4 w-4 text-primary" />
                <span className="font-medium">Unlimited Access</span>
              </div>
              <span className="text-sm text-muted-foreground">{daysRemaining} days left</span>
            </div>
            <Progress value={(daysRemaining / 30) * 100} className="h-2" />
          </div>
        )}

        {hasSongGenerations && (
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Music className="h-4 w-4 text-primary" />
                <span className="font-medium">Song Generations</span>
              </div>
              <span className="text-sm text-muted-foreground">{rewards.songGenerations} remaining</span>
            </div>
            <Progress value={(rewards.songGenerations! / 100) * 100} className="h-2" />
          </div>
        )}

        {hasVideoGenerations && (
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Film className="h-4 w-4 text-primary" />
                <span className="font-medium">Video Generations</span>
              </div>
              <span className="text-sm text-muted-foreground">{rewards.videoGenerations} remaining</span>
            </div>
            <Progress value={(rewards.videoGenerations! / 50) * 100} className="h-2" />
          </div>
        )}
      </CardContent>
    </Card>
  )
}
