"use client"

import { useState, useRef, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Slider } from "@/components/ui/slider"
import { Play, Pause, Volume2, VolumeX, SkipBack, SkipForward } from "lucide-react"
import { useAuth } from "@/context/auth-context"

interface AudioPlayerProps {
  audioUrl: string
  title: string
  musicId?: string
  onPlayCountUpdate?: (count: number) => void
}

export function AudioPlayer({ audioUrl, title, musicId, onPlayCountUpdate }: AudioPlayerProps) {
  const [isPlaying, setIsPlaying] = useState(false)
  const [currentTime, setCurrentTime] = useState(0)
  const [duration, setDuration] = useState(0)
  const [volume, setVolume] = useState([75])
  const [isMuted, setIsMuted] = useState(false)
  const [playCount, setPlayCount] = useState(0)
  const [hasTrackedPlay, setHasTrackedPlay] = useState(false)
  const audioRef = useRef<HTMLAudioElement>(null)
  const { user } = useAuth()

  useEffect(() => {
    const audio = audioRef.current
    if (!audio) return

    const updateTime = () => setCurrentTime(audio.currentTime)
    const updateDuration = () => setDuration(audio.duration)
    const handleEnded = () => {
      setIsPlaying(false)
      setCurrentTime(0)
      setHasTrackedPlay(false) // Reset for next play
    }

    const handlePlay = () => setIsPlaying(true)
    const handlePause = () => setIsPlaying(false)

    // Track play when audio starts playing and reaches 30% completion
    const handleTimeUpdate = async () => {
      const audio = audioRef.current
      if (!audio || !musicId || hasTrackedPlay) return

      const playProgress = (audio.currentTime / audio.duration) * 100

      // Track play when user has listened to at least 30% of the song
      if (playProgress >= 30) {
        setHasTrackedPlay(true)

        try {
          // Call API to track the play
          const response = await fetch("/api/track-play", {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              musicId,
              userId: user?.id,
            }),
          })

          if (response.ok) {
            const data = await response.json()
            const newPlayCount = data.playCount || playCount + 1
            setPlayCount(newPlayCount)
            onPlayCountUpdate?.(newPlayCount)
          }
        } catch (error) {
          console.error("Error tracking play:", error)
        }
      }
    }

    audio.addEventListener("timeupdate", updateTime)
    audio.addEventListener("timeupdate", handleTimeUpdate)
    audio.addEventListener("loadedmetadata", updateDuration)
    audio.addEventListener("ended", handleEnded)
    audio.addEventListener("play", handlePlay)
    audio.addEventListener("pause", handlePause)

    return () => {
      audio.removeEventListener("timeupdate", updateTime)
      audio.removeEventListener("timeupdate", handleTimeUpdate)
      audio.removeEventListener("loadedmetadata", updateDuration)
      audio.removeEventListener("ended", handleEnded)
      audio.removeEventListener("play", handlePlay)
      audio.removeEventListener("pause", handlePause)
    }
  }, [musicId, user?.id, hasTrackedPlay, playCount, onPlayCountUpdate])

  useEffect(() => {
    const audio = audioRef.current
    if (audio) {
      audio.volume = isMuted ? 0 : volume[0] / 100
    }
  }, [volume, isMuted])

  const togglePlayPause = () => {
    const audio = audioRef.current
    if (!audio) return

    if (isPlaying) {
      audio.pause()
    } else {
      audio.play().catch((error) => {
        console.error("Error playing audio:", error)
      })
    }
  }

  const handleSeek = (value: number[]) => {
    const audio = audioRef.current
    if (audio) {
      audio.currentTime = value[0]
      setCurrentTime(value[0])
    }
  }

  const handleVolumeChange = (value: number[]) => {
    setVolume(value)
    setIsMuted(false)
  }

  const toggleMute = () => {
    setIsMuted(!isMuted)
  }

  const skipBackward = () => {
    const audio = audioRef.current
    if (audio) {
      audio.currentTime = Math.max(0, audio.currentTime - 10)
    }
  }

  const skipForward = () => {
    const audio = audioRef.current
    if (audio) {
      audio.currentTime = Math.min(duration, audio.currentTime + 10)
    }
  }

  const formatTime = (time: number) => {
    const minutes = Math.floor(time / 60)
    const seconds = Math.floor(time % 60)
    return `${minutes}:${seconds.toString().padStart(2, "0")}`
  }

  return (
    <div className="w-full space-y-4 p-4 bg-card rounded-lg border">
      <audio ref={audioRef} src={audioUrl} preload="metadata" crossOrigin="anonymous" />

      <div className="flex items-center justify-between">
        <div className="flex-1 min-w-0">
          <h3 className="font-medium truncate">{title}</h3>
          {playCount > 0 && (
            <p className="text-sm text-muted-foreground">
              {playCount.toLocaleString()} play{playCount !== 1 ? "s" : ""}
            </p>
          )}
        </div>
      </div>

      <div className="space-y-2">
        <Slider value={[currentTime]} max={duration || 100} step={1} onValueChange={handleSeek} className="w-full" />
        <div className="flex justify-between text-sm text-muted-foreground">
          <span>{formatTime(currentTime)}</span>
          <span>{formatTime(duration)}</span>
        </div>
      </div>

      <div className="flex items-center justify-center gap-2">
        <Button variant="outline" size="sm" onClick={skipBackward}>
          <SkipBack className="h-4 w-4" />
        </Button>

        <Button onClick={togglePlayPause} size="lg" className="h-12 w-12 rounded-full">
          {isPlaying ? <Pause className="h-6 w-6" /> : <Play className="h-6 w-6" />}
        </Button>

        <Button variant="outline" size="sm" onClick={skipForward}>
          <SkipForward className="h-4 w-4" />
        </Button>
      </div>

      <div className="flex items-center gap-2">
        <Button variant="ghost" size="sm" onClick={toggleMute}>
          {isMuted ? <VolumeX className="h-4 w-4" /> : <Volume2 className="h-4 w-4" />}
        </Button>
        <Slider value={volume} max={100} step={1} onValueChange={handleVolumeChange} className="flex-1" />
      </div>
    </div>
  )
}
