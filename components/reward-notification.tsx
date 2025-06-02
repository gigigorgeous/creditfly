"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Gift, X, Star, Trophy, Music } from "lucide-react"
import { useAuth } from "@/context/auth-context"
import { useToast } from "@/hooks/use-toast"

interface RewardNotificationProps {
  onClose?: () => void
}

export function RewardNotification({ onClose }: RewardNotificationProps) {
  const [isVisible, setIsVisible] = useState(false)
  const [rewardData, setRewardData] = useState<any>(null)
  const [isClaiming, setIsClaiming] = useState(false)
  const { user } = useAuth()
  const { toast } = useToast()

  useEffect(() => {
    if (!user?.id) return

    const checkRewardEligibility = async () => {
      try {
        const response = await fetch(`/api/check-rewards?userId=${user.id}`)
        if (response.ok) {
          const data = await response.json()
          if (data.isEligible && data.canClaimAgain) {
            setRewardData(data)
            setIsVisible(true)
          }
        }
      } catch (error) {
        console.error("Error checking reward eligibility:", error)
      }
    }

    // Check eligibility when component mounts
    checkRewardEligibility()

    // Check periodically (every 5 minutes)
    const interval = setInterval(checkRewardEligibility, 5 * 60 * 1000)

    return () => clearInterval(interval)
  }, [user?.id])

  const handleClaimReward = async () => {
    if (!user?.id || !rewardData) return

    setIsClaiming(true)
    try {
      const response = await fetch("/api/claim-reward", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          userId: user.id,
          rewardId: "music_listener_250",
        }),
      })

      if (response.ok) {
        toast({
          title: "Reward Claimed! 🎉",
          description: "You've earned premium features for being an active listener!",
        })
        handleClose()
      } else {
        throw new Error("Failed to claim reward")
      }
    } catch (error) {
      console.error("Error claiming reward:", error)
      toast({
        title: "Claim Failed",
        description: "There was an error claiming your reward. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsClaiming(false)
    }
  }

  const handleClose = () => {
    setIsVisible(false)
    onClose?.()
  }

  if (!isVisible || !rewardData) return null

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <Card className="w-full max-w-md border-2 border-primary/20 shadow-2xl">
        <CardHeader className="text-center relative">
          <Button variant="ghost" size="sm" className="absolute right-2 top-2" onClick={handleClose}>
            <X className="h-4 w-4" />
          </Button>

          <div className="flex justify-center mb-4">
            <div className="relative">
              <Gift className="h-16 w-16 text-primary animate-bounce" />
              <Star className="h-6 w-6 text-yellow-500 absolute -top-1 -right-1 animate-pulse" />
            </div>
          </div>

          <CardTitle className="text-2xl font-bold bg-gradient-to-r from-primary to-purple-600 bg-clip-text text-transparent">
            Congratulations! 🎉
          </CardTitle>
          <CardDescription className="text-lg">You've unlocked a special reward!</CardDescription>
        </CardHeader>

        <CardContent className="space-y-6">
          <div className="text-center space-y-4">
            <div className="flex items-center justify-center gap-2">
              <Music className="h-5 w-5 text-primary" />
              <Badge variant="secondary" className="text-lg px-4 py-2">
                {rewardData.recentPlays} Songs Played
              </Badge>
            </div>

            <div className="p-4 bg-primary/10 rounded-lg border border-primary/20">
              <div className="flex items-center justify-center gap-2 mb-2">
                <Trophy className="h-5 w-5 text-yellow-500" />
                <h3 className="font-semibold">Music Enthusiast Reward</h3>
              </div>
              <p className="text-sm text-muted-foreground">
                You've listened to 250+ songs this month! Claim your reward to unlock:
              </p>
              <ul className="text-sm mt-2 space-y-1">
                <li>• Premium music generation features</li>
                <li>• Extended song duration limits</li>
                <li>• Priority processing queue</li>
                <li>• Exclusive genre options</li>
              </ul>
            </div>
          </div>

          <div className="flex gap-3">
            <Button variant="outline" onClick={handleClose} className="flex-1">
              Maybe Later
            </Button>
            <Button onClick={handleClaimReward} disabled={isClaiming} className="flex-1">
              {isClaiming ? "Claiming..." : "Claim Reward"}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
