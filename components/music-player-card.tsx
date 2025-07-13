"use client"

import * as React from "react"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { PlayCircle, PauseCircle } from "lucide-react"
import { WaveformDisplay } from "./waveform-display"

interface MusicPlayerCardProps {
  src: string
  title: string
  artist: string
  genre: string
  duration: string
  bpm: number
  keySignature: string
}

// Helper function to format time (if needed, though duration is already a string)
const formatTime = (seconds: number) => {
  const minutes = Math.floor(seconds / 60)
  const remainingSeconds = Math.floor(seconds % 60)
  return `${minutes}:${remainingSeconds < 10 ? "0" : ""}${remainingSeconds}`
}

export const MusicPlayerCard: React.FC<MusicPlayerCardProps> = ({
  src,
  title,
  artist,
  genre,
  duration,
  bpm,
  keySignature,
}) => {
  const audioRef = React.useRef<HTMLAudioElement | null>(null)
  const [isPlaying, setIsPlaying] = React.useState(false)
  const [currentTime, setCurrentTime] = React.useState(0)
  const [totalDuration, setTotalDuration] = React.useState(0)
  const [isLoaded, setIsLoaded] = React.useState(false)

  const objectUrlRef = React.useRef<string | null>(null) // To store the object URL

  React.useEffect(() => {
    let currentAudio: HTMLAudioElement | null = null

    const loadAudio = async () => {
      setIsLoaded(false)
      setIsPlaying(false)
      setCurrentTime(0)
      setTotalDuration(0)

      // Revoke previous object URL if it exists
      if (objectUrlRef.current) {
        URL.revokeObjectURL(objectUrlRef.current)
        objectUrlRef.current = null
      }

      try {
        const response = await fetch(src)
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`)
        }
        const blob = await response.blob()
        const url = URL.createObjectURL(blob)
        objectUrlRef.current = url // Store the object URL

        currentAudio = new Audio(url)
        currentAudio.crossOrigin = "anonymous"
        audioRef.current = currentAudio

        currentAudio.onloadedmetadata = () => {
          setTotalDuration(currentAudio!.duration)
          setIsLoaded(true)
        }

        currentAudio.ontimeupdate = () => {
          setCurrentTime(currentAudio!.currentTime)
        }

        currentAudio.onended = () => {
          setIsPlaying(false)
          setCurrentTime(0)
        }

        currentAudio.onerror = (e) => {
          console.error("Error loading audio:", e)
          setIsLoaded(false)
          setIsPlaying(false)
          alert(`Failed to load track: ${title}. Please check the audio file.`)
        }
      } catch (error) {
        console.error("Failed to fetch or create object URL for audio:", error)
        setIsLoaded(false)
        setIsPlaying(false)
        alert(`Failed to load track: ${title}. Error: ${error instanceof Error ? error.message : String(error)}`)
      }
    }

    loadAudio()

    return () => {
      if (currentAudio) {
        currentAudio.pause()
        currentAudio.src = "" // Clear source to release resources
        currentAudio.load()
      }
      if (objectUrlRef.current) {
        URL.revokeObjectURL(objectUrlRef.current)
        objectUrlRef.current = null
      }
    }
  }, [src, title]) // Re-run effect if src or title changes

  React.useEffect(() => {
    const audio = audioRef.current
    if (audio) {
      if (isPlaying) {
        audio.play().catch((e) => console.error("Error playing audio:", e))
      } else {
        audio.pause()
      }
    }
  }, [isPlaying])

  const togglePlayPause = () => {
    setIsPlaying((prev) => !prev)
  }

  return (
    <Card className="relative w-full max-w-xl bg-gray-800 rounded-xl overflow-hidden shadow-lg">
      <div className="relative h-64">
        <WaveformDisplay audioElement={audioRef.current} />
        <div className="absolute bottom-4 left-4 flex items-center gap-2">
          <Button
            variant="ghost"
            size="icon"
            className="rounded-full bg-white/20 hover:bg-white/30 text-white"
            onClick={togglePlayPause}
            disabled={!isLoaded}
            aria-label={isPlaying ? "Pause" : "Play"}
          >
            {isPlaying ? <PauseCircle className="w-8 h-8" /> : <PlayCircle className="w-8 h-8" />}
          </Button>
          <div className="text-white">
            <div className="font-semibold">{title}</div>
            <div className="text-sm text-gray-300">
              {genre} • {duration}
            </div>
          </div>
        </div>
        <div className="absolute bottom-4 right-4 flex items-center gap-2 text-white text-sm font-mono">
          <span className="px-2 py-1 bg-white/20 rounded-md">{bpm} BPM</span>
          <span className="px-2 py-1 bg-white/20 rounded-md">{keySignature}</span>
        </div>
      </div>
    </Card>
  )
}
