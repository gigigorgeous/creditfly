"use client"

import { useState, useRef, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Slider } from "@/components/ui/slider"
import { PlayCircle, PauseCircle, Volume2, VolumeX } from "lucide-react"
import { useOptionalAuth } from "@/hooks/use-optional-auth"

interface AudioPlayerProps {
  audioUrl: string
  title: string
  musicId?: string
  onPlayStateChange?: (isPlaying: boolean) => void
  onPlay?: () => void
}

export function AudioPlayer({ audioUrl, title, musicId, onPlayStateChange, onPlay }: AudioPlayerProps) {
  const [isPlaying, setIsPlaying] = useState(false)
  const [duration, setDuration] = useState(0)
  const [currentTime, setCurrentTime] = useState(0)
  const [volume, setVolume] = useState([75])
  const [isMuted, setIsMuted] = useState(false)
  const [playTracked, setPlayTracked] = useState(false)
  const audioRef = useRef<HTMLAudioElement | null>(null)
  const auth = useOptionalAuth()

  useEffect(() => {
    const audio = new Audio(audioUrl)
    audioRef.current = audio

    const setAudioData = () => {
      setDuration(audio.duration)
    }

    const setAudioTime = () => {
      setCurrentTime(audio.currentTime)

      // Track play when 10 seconds have passed or 30% of the song
      if (musicId && !playTracked && audio.currentTime > Math.min(10, audio.duration * 0.3)) {
        trackPlay()
        setPlayTracked(true)
      }
    }

    const handleEnded = () => {
      setIsPlaying(false)
      setCurrentTime(0)
      if (onPlayStateChange) onPlayStateChange(false)
    }

    const handleError = (e: ErrorEvent) => {
      console.error("Audio loading error:", e)
      // Try with a fallback URL if the main one fails
      audio.src = "https://samplelib.com/lib/preview/mp3/sample-3s.mp3"
    }

    // Events
    audio.addEventListener("loadeddata", setAudioData)
    audio.addEventListener("timeupdate", setAudioTime)
    audio.addEventListener("ended", handleEnded)
    audio.addEventListener("error", handleError)

    // Set initial volume
    audio.volume = volume[0] / 100

    return () => {
      audio.pause()
      audio.removeEventListener("loadeddata", setAudioData)
      audio.removeEventListener("timeupdate", setAudioTime)
      audio.removeEventListener("ended", handleEnded)
      audio.removeEventListener("error", handleError)
    }
  }, [audioUrl, onPlayStateChange, musicId, playTracked, onPlay])

  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.volume = isMuted ? 0 : volume[0] / 100
    }
  }, [volume, isMuted])

  // Function to track play in Redis
  const trackPlay = async () => {
    if (!musicId) return

    try {
      // Call API to track play
      await fetch("/api/track-play", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          musicId,
          userId: auth?.user?.id,
        }),
      })
    } catch (error) {
      console.error("Error tracking play:", error)
    }
  }

  const togglePlayPause = () => {
    const prevValue = isPlaying
    setIsPlaying(!prevValue)

    if (!prevValue) {
      audioRef.current?.play()
      if (onPlayStateChange) onPlayStateChange(true)
      if (onPlay) onPlay() // Call onPlay when starting playback
    } else {
      audioRef.current?.pause()
      if (onPlayStateChange) onPlayStateChange(false)
    }
  }

  const toggleMute = () => {
    setIsMuted(!isMuted)
  }

  const handleTimeChange = (value: number[]) => {
    const [newTime] = value
    setCurrentTime(newTime)
    if (audioRef.current) {
      audioRef.current.currentTime = newTime
    }
  }

  const formatTime = (time: number) => {
    if (isNaN(time)) return "0:00"

    const minutes = Math.floor(time / 60)
    const seconds = Math.floor(time % 60)
    return `${minutes}:${seconds.toString().padStart(2, "0")}`
  }

  return (
    <div className="w-full space-y-2">
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" className="h-10 w-10 text-primary" onClick={togglePlayPause}>
          {isPlaying ? <PauseCircle className="h-10 w-10" /> : <PlayCircle className="h-10 w-10" />}
        </Button>

        <div className="flex-1">
          <div className="text-sm font-medium truncate">{title}</div>
          <div className="flex items-center gap-2">
            <span className="text-xs text-muted-foreground">{formatTime(currentTime)}</span>
            <Slider
              value={[currentTime]}
              min={0}
              max={duration || 100}
              step={0.1}
              onValueChange={(value) => handleTimeChange(value)}
              className="flex-1"
            />
            <span className="text-xs text-muted-foreground">{formatTime(duration)}</span>
          </div>
        </div>

        <div className="flex items-center gap-2 min-w-[100px]">
          <Button variant="ghost" size="icon" className="h-8 w-8" onClick={toggleMute}>
            {isMuted ? <VolumeX className="h-4 w-4" /> : <Volume2 className="h-4 w-4" />}
          </Button>
          <Slider value={volume} min={0} max={100} step={1} onValueChange={setVolume} className="w-20" />
        </div>
      </div>
    </div>
  )
}
