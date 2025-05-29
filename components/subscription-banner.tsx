"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { AlertCircle, X } from "lucide-react"
import { Alert, AlertDescription } from "@/components/ui/alert"
import Link from "next/link"

export function SubscriptionBanner() {
  const [isVisible, setIsVisible] = useState(true)

  if (!isVisible) return null

  return (
    <Alert className="relative border-primary/20 bg-primary/5 text-primary">
      <AlertCircle className="h-4 w-4" />
      <AlertDescription className="flex items-center justify-between w-full">
        <div className="flex-1 text-sm">
          <span className="font-medium">Free tier: </span>
          <span className="hidden sm:inline">
            Generate up to 6 songs or videos for free. Upgrade for unlimited access.
          </span>
          <span className="sm:hidden">6 free generations. Upgrade for more.</span>
        </div>
        <div className="flex items-center gap-2">
          <Button size="sm" variant="outline" className="border-primary text-primary hover:bg-primary/10" asChild>
            <Link href="/upgrade">Upgrade $6/week</Link>
          </Button>
          <Button
            size="icon"
            variant="ghost"
            className="h-6 w-6 text-primary hover:bg-primary/10"
            onClick={() => setIsVisible(false)}
          >
            <X className="h-4 w-4" />
            <span className="sr-only">Dismiss</span>
          </Button>
        </div>
      </AlertDescription>
    </Alert>
  )
}
