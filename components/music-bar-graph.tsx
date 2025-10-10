"use client"

import type React from "react"
import { useState, useEffect, useRef } from "react"

export const MusicBarGraph: React.FC = () => {
  const [barHeights, setBarHeights] = useState<number[]>(Array(50).fill(0))
  const animationFrameId = useRef<number | null>(null)

  useEffect(() => {
    const animateBars = () => {
      setBarHeights((prev) => prev.map(() => Math.floor(Math.random() * 80) + 20))
      animationFrameId.current = requestAnimationFrame(animateBars)
    }

    animationFrameId.current = requestAnimationFrame(animateBars)

    return () => {
      if (animationFrameId.current) {
        cancelAnimationFrame(animationFrameId.current)
      }
    }
  }, [])

  return (
    <div className="flex items-end justify-center h-64 w-full max-w-xl gap-1 overflow-hidden rounded-xl bg-gradient-to-b from-gray-900 to-gray-950 p-4 border border-gray-800 shadow-2xl">
      {barHeights.map((height, index) => (
        <div
          key={index}
          className="w-2 bg-gradient-to-t from-purple-600 via-purple-500 to-blue-500 rounded-t-sm transition-all duration-150 ease-out"
          style={{ height: `${height}%` }}
        />
      ))}
    </div>
  )
}
