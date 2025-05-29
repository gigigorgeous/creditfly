"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Award, X } from "lucide-react"
import SpinWheel from "./spin-wheel"
import { useToast } from "@/hooks/use-toast"

interface RewardNotificationProps {
  songPlays: Record<string, number>
  userId?: string | null
}

function RewardNotification({ songPlays, userId }: RewardNotificationProps) {
  const [showNotification, setShowNotification] = useState(false)
  const [showSpinWheel, setShowSpinWheel] = useState(false)
  const [rewardedSongId, setRewardedSongId] = useState<string | null>(null)
  const { toast } = useToast()

  // Check if any song has reached the threshold
  useEffect(() => {
    if (!userId) return // Only show for logged in users

    // Find the first song that has more than 250 plays and hasn't been rewarded yet
    const eligibleSongId = Object.entries(songPlays).find(
      ([id, plays]) => plays >= 250 && !localStorage.getItem(`rewarded-${id}`),
    )?.[0]

    if (eligibleSongId) {
      setRewardedSongId(eligibleSongId)
      setShowNotification(true)
    }
  }, [songPlays, userId])

  const handleDismiss = () => {
    setShowNotification(false)
  }

  const handleSpinWheel = () => {
    setShowNotification(false)
    setShowSpinWheel(true)
  }

  const handleRewardClaimed = (rewardId: string) => {
    if (rewardedSongId) {
      // Mark this song as rewarded
      localStorage.setItem(`rewarded-${rewardedSongId}`, "true")

      // Show toast based on the reward
      switch (rewardId) {
        case "unlimited":
          toast({
            title: "Unlimited Access Activated!",
            description: "You now have unlimited access for 30 days!",
          })
          break
        case "songs":
          toast({
            title: "100 Song Generations Added!",
            description: "You can now generate up to 100 additional songs!",
          })
          break
        case "videos":
          toast({
            title: "50 Video Generations Added!",
            description: "You can now generate up to 50 additional music videos!",
          })
          break
        case "badge":
          toast({
            title: "'Almost Famous' Badge Added!",
            description: "Your profile now shows the 'Almost Famous' badge for 3 months!",
          })
          break
      }
    }
  }

  if (!showNotification && !showSpinWheel) {
    return null
  }

  return (
    <>
      {showNotification && (
        <div className="fixed bottom-4 right-4 z-50 max-w-sm">
          <Card className="border-primary/20 bg-primary/5">
            <CardHeader className="pb-2">
              <div className="flex justify-between items-start">
                <CardTitle className="text-lg flex items-center gap-2">
                  <Award className="h-5 w-5 text-primary" />
                  <span>Reward Unlocked!</span>
                </CardTitle>
                <Button variant="ghost" size="icon" className="h-8 w-8" onClick={handleDismiss}>
                  <X className="h-4 w-4" />
                </Button>
              </div>
              <CardDescription>Congratulations! One of your songs has reached 250+ plays.</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-sm">
                You've qualified for a special reward. Spin the wheel for a chance to win amazing prizes!
              </p>
            </CardContent>
            <CardFooter>
              <Button className="w-full" onClick={handleSpinWheel}>
                Spin the Wheel
              </Button>
            </CardFooter>
          </Card>
        </div>
      )}

      {showSpinWheel && <SpinWheel onRewardClaimed={handleRewardClaimed} onClose={() => setShowSpinWheel(false)} />}
    </>
  )
}

export default RewardNotification
