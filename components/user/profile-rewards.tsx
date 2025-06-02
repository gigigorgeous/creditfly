"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Gift, Clock, Music, Film } from "lucide-react"

interface ProfileRewardsProps {
  rewards: {
    unlimitedUntil?: string
    songGenerations?: number
    videoGenerations?: number
  }
}

export function ProfileRewards({ rewards }: ProfileRewardsProps) {
  const hasActiveRewards = rewards.unlimitedUntil || rewards.songGenerations || rewards.videoGenerations

  if (!hasActiveRewards) return null

  const isUnlimitedActive = rewards.unlimitedUntil && new Date(rewards.unlimitedUntil) > new Date()

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Gift className="h-5 w-5" />
          Active Rewards
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {isUnlimitedActive && (
            <div className="flex items-center justify-between p-3 rounded-lg border bg-gradient-to-r from-purple-50 to-pink-50 dark:from-purple-950/20 dark:to-pink-950/20">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-full bg-gradient-to-r from-purple-500 to-pink-500 text-white">
                  <Clock className="h-4 w-4" />
                </div>
                <div>
                  <h4 className="font-medium text-sm">Unlimited Access</h4>
                  <p className="text-xs text-muted-foreground">
                    Valid until {new Date(rewards.unlimitedUntil).toLocaleDateString()}
                  </p>
                </div>
              </div>
              <Badge variant="secondary" className="bg-gradient-to-r from-purple-500 to-pink-500 text-white">
                Premium
              </Badge>
            </div>
          )}

          {rewards.songGenerations && rewards.songGenerations > 0 && (
            <div className="flex items-center justify-between p-3 rounded-lg border bg-blue-50 dark:bg-blue-950/20">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-full bg-blue-500 text-white">
                  <Music className="h-4 w-4" />
                </div>
                <div>
                  <h4 className="font-medium text-sm">Bonus Song Generations</h4>
                  <p className="text-xs text-muted-foreground">Extra credits for music creation</p>
                </div>
              </div>
              <Badge variant="outline" className="border-blue-500 text-blue-600">
                {rewards.songGenerations} left
              </Badge>
            </div>
          )}

          {rewards.videoGenerations && rewards.videoGenerations > 0 && (
            <div className="flex items-center justify-between p-3 rounded-lg border bg-green-50 dark:bg-green-950/20">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-full bg-green-500 text-white">
                  <Film className="h-4 w-4" />
                </div>
                <div>
                  <h4 className="font-medium text-sm">Bonus Video Generations</h4>
                  <p className="text-xs text-muted-foreground">Extra credits for video creation</p>
                </div>
              </div>
              <Badge variant="outline" className="border-green-500 text-green-600">
                {rewards.videoGenerations} left
              </Badge>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  )
}
