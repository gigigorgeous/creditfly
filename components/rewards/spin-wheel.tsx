"use client"

import { useState, useRef } from "react"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { useToast } from "@/hooks/use-toast"
import { Award, Gift, Sparkles, Loader2 } from "lucide-react"
import confetti from "canvas-confetti"

// Define the possible rewards
const REWARDS = [
  {
    id: "unlimited",
    name: "Free Month Subscription",
    description: "Unlimited content generation for 30 days",
    color: "#FF5733",
    icon: <Sparkles className="h-6 w-6" />,
  },
  {
    id: "songs",
    name: "100 Song Generations",
    description: "Generate up to 100 songs for free",
    color: "#33FF57",
    icon: <Award className="h-6 w-6" />,
  },
  {
    id: "videos",
    name: "50 Video Generations",
    description: "Generate up to 50 music videos for free",
    color: "#3357FF",
    icon: <Gift className="h-6 w-6" />,
  },
  {
    id: "badge",
    name: "'Almost Famous' Badge",
    description: "Show off your popularity for 3 months",
    color: "#F3FF33",
    icon: <Award className="h-6 w-6" />,
  },
  {
    id: "unlimited",
    name: "Free Month Subscription",
    description: "Unlimited content generation for 30 days",
    color: "#FF5733",
    icon: <Sparkles className="h-6 w-6" />,
  },
  {
    id: "songs",
    name: "100 Song Generations",
    description: "Generate up to 100 songs for free",
    color: "#33FF57",
    icon: <Award className="h-6 w-6" />,
  },
  {
    id: "videos",
    name: "50 Video Generations",
    description: "Generate up to 50 music videos for free",
    color: "#3357FF",
    icon: <Gift className="h-6 w-6" />,
  },
  {
    id: "badge",
    name: "'Almost Famous' Badge",
    description: "Show off your popularity for 3 months",
    color: "#F3FF33",
    icon: <Award className="h-6 w-6" />,
  },
]

interface SpinWheelProps {
  onRewardClaimed: (rewardId: string) => void
  onClose: () => void
}

function SpinWheel({ onRewardClaimed, onClose }: SpinWheelProps) {
  const [isSpinning, setIsSpinning] = useState(false)
  const [rotation, setRotation] = useState(0)
  const [selectedReward, setSelectedReward] = useState<(typeof REWARDS)[0] | null>(null)
  const [showResult, setShowResult] = useState(false)
  const wheelRef = useRef<HTMLDivElement>(null)
  const { toast } = useToast()

  const spinWheel = () => {
    if (isSpinning) return

    setIsSpinning(true)
    setShowResult(false)

    // Calculate a random rotation (between 5 and 10 full rotations)
    const baseRotation = 1800 + Math.random() * 1800 // 5-10 full rotations (360 * 5 = 1800, 360 * 10 = 3600)

    // Determine which reward to land on (for demo purposes, we'll pick randomly)
    const rewardIndex = Math.floor(Math.random() * REWARDS.length)
    const segmentAngle = 360 / REWARDS.length

    // Calculate the exact rotation to land on the selected reward
    // We add a small random offset within the segment to make it look more natural
    const offset = Math.random() * (segmentAngle * 0.8) - segmentAngle * 0.4
    const targetRotation = baseRotation + rewardIndex * segmentAngle + offset

    // Set the rotation
    setRotation(targetRotation)

    // After the animation completes, show the result
    setTimeout(() => {
      setIsSpinning(false)
      setSelectedReward(REWARDS[rewardIndex])
      setShowResult(true)

      // Trigger confetti effect
      confetti({
        particleCount: 100,
        spread: 70,
        origin: { y: 0.6 },
      })
    }, 5000) // Match this with the CSS transition duration
  }

  const claimReward = () => {
    if (!selectedReward) return

    onRewardClaimed(selectedReward.id)

    toast({
      title: "Reward Claimed!",
      description: `You've claimed: ${selectedReward.name}`,
    })

    setShowResult(false)
    onClose()
  }

  return (
    <Dialog open={true} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Spin the Wheel of Rewards!</DialogTitle>
          <DialogDescription>
            Congratulations on reaching 250+ plays! Spin the wheel to win awesome rewards.
          </DialogDescription>
        </DialogHeader>

        <div className="flex flex-col items-center justify-center py-4">
          {/* Wheel container */}
          <div className="relative w-64 h-64 mb-6">
            {/* Wheel marker (pointer) */}
            <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 w-0 h-0 border-l-[10px] border-r-[10px] border-t-[20px] border-l-transparent border-r-transparent border-t-primary z-10" />

            {/* Wheel */}
            <div
              ref={wheelRef}
              className="w-full h-full rounded-full overflow-hidden border-4 border-primary/20 transition-transform duration-5000 ease-out"
              style={{ transform: `rotate(${rotation}deg)` }}
            >
              {/* Wheel segments */}
              {REWARDS.map((reward, index) => {
                const segmentAngle = 360 / REWARDS.length
                const rotation = index * segmentAngle

                return (
                  <div
                    key={index}
                    className="absolute top-0 left-0 w-full h-full origin-center"
                    style={{ transform: `rotate(${rotation}deg)` }}
                  >
                    <div
                      className="absolute top-0 left-0 w-1/2 h-full origin-right flex items-center justify-center"
                      style={{ backgroundColor: reward.color }}
                    >
                      <div
                        className="absolute top-1/2 left-1/2 -translate-y-1/2 -translate-x-1/2 text-white font-bold text-xs w-12 h-12 flex items-center justify-center"
                        style={{ transform: `rotate(${-rotation - segmentAngle / 2}deg)` }}
                      >
                        {reward.icon}
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>
          </div>

          <Button onClick={spinWheel} disabled={isSpinning} size="lg" className="w-40">
            {isSpinning ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Spinning...
              </>
            ) : (
              "Spin the Wheel!"
            )}
          </Button>
        </div>

        {/* Result dialog */}
        {showResult && selectedReward && (
          <div className="mt-4 p-4 bg-primary/10 rounded-lg text-center">
            <h3 className="text-lg font-bold mb-2">Congratulations!</h3>
            <div className="flex justify-center mb-2">
              <div className="w-12 h-12 rounded-full bg-primary/20 flex items-center justify-center text-primary">
                {selectedReward.icon}
              </div>
            </div>
            <p className="font-medium">{selectedReward.name}</p>
            <p className="text-sm text-muted-foreground mb-4">{selectedReward.description}</p>
            <Button onClick={claimReward}>Claim Your Reward</Button>
          </div>
        )}

        <DialogFooter className="sm:justify-center">
          {!showResult && (
            <Button variant="outline" onClick={onClose} disabled={isSpinning}>
              Maybe Later
            </Button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

export default SpinWheel
