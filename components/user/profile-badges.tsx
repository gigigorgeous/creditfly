"use client"

import { Badge } from "@/components/ui/badge"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import { Award, Crown, Star, Sparkles } from "lucide-react"

interface ProfileBadgesProps {
  badges?: string[]
}

export function ProfileBadges({ badges = [] }: ProfileBadgesProps) {
  // Define badge data
  const badgeData: Record<string, { icon: JSX.Element; label: string; description: string; color: string }> = {
    "almost-famous": {
      icon: <Award className="h-4 w-4" />,
      label: "Almost Famous",
      description: "Reached 250+ plays in 30 days",
      color: "bg-yellow-500/20 text-yellow-600 dark:text-yellow-400",
    },
    "top-creator": {
      icon: <Crown className="h-4 w-4" />,
      label: "Top Creator",
      description: "Ranked in the top 10 creators",
      color: "bg-purple-500/20 text-purple-600 dark:text-purple-400",
    },
    trending: {
      icon: <Star className="h-4 w-4" />,
      label: "Trending",
      description: "Had content in the trending section",
      color: "bg-blue-500/20 text-blue-600 dark:text-blue-400",
    },
    premium: {
      icon: <Sparkles className="h-4 w-4" />,
      label: "Premium",
      description: "Premium subscription active",
      color: "bg-green-500/20 text-green-600 dark:text-green-400",
    },
  }

  if (badges.length === 0) {
    return null
  }

  return (
    <TooltipProvider>
      <div className="flex flex-wrap gap-2">
        {badges.map((badge) => {
          const badgeInfo = badgeData[badge] || {
            icon: <Award className="h-4 w-4" />,
            label: badge,
            description: "Special badge",
            color: "bg-gray-500/20 text-gray-600 dark:text-gray-400",
          }

          return (
            <Tooltip key={badge}>
              <TooltipTrigger asChild>
                <Badge variant="outline" className={`${badgeInfo.color} flex items-center gap-1 px-2 py-1`}>
                  {badgeInfo.icon}
                  <span>{badgeInfo.label}</span>
                </Badge>
              </TooltipTrigger>
              <TooltipContent>
                <p>{badgeInfo.description}</p>
              </TooltipContent>
            </Tooltip>
          )
        })}
      </div>
    </TooltipProvider>
  )
}
