"use client"

import * as React from "react"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { PlayCircle, PauseCircle, Volume2, Download } from "lucide-react"
import { WaveformDisplay } from "./waveform-display"
import { useToast } from "@/hooks/use-toast"

interface MusicPlayerCardProps {
  src?: string
  audioUrl?: string
  title: string
  artist: string
  genre: string
  duration: string
  bpm: number
  keySignature: string
}

const formatTime = (seconds: number) => {
  const minutes = Math.floor(seconds / 60)
  const remainingSeconds = Math.floor(seconds % 60)
  return `${minutes}:${remainingSeconds < 10 ? "0" : ""}${remainingSeconds}`
}

export const MusicPlayerCard: React.FC<MusicPlayerCardProps> = ({
  src,
  audioUrl,
  title,
  artist,
  genre,
  duration,
  bpm,
  keySignature,
}) => {
  const { toast } = useToast()
  const audioRef = React.useRef<HTMLAudioElement | null>(null)
  const [isPlaying, setIsPlaying] = React.useState(false)
  const [currentTime, setCurrentTime] = React.useState(0)
  const [totalDuration, setTotalDuration] = React.useState(0)
  const [isLoaded, setIsLoaded] = React.useState(false)
  const [error, setError] = React.useState<string | null>(null)
  const [progress, setProgress] = React.useState(0)

  const audioSource = audioUrl || src

  React.useEffect(() => {
    if (!audioSource) {
      setError("No audio source provided")
      return
    }

    const audio = new Audio()
    audio.crossOrigin = "anonymous"

    const handleLoadedMetadata = () => {
      setTotalDuration(audio.duration)
      setIsLoaded(true)
      setError(null)
      audioRef.current = audio
    }

    const handleTimeUpdate = () => {
      setCurrentTime(audio.currentTime)
      setProgress((audio.currentTime / audio.duration) * 100)
    }

    const handleEnded = () => {
      setIsPlaying(false)
      setCurrentTime(0)
      setProgress(0)
    }

    const handleError = (e: any) => {
      console.error("Audio loading error:", e)
      setError("Failed to load audio")
      setIsLoaded(false)
    }

    const handleCanPlay = () => {
      setIsLoaded(true)
      setError(null)
    }

    audio.addEventListener("loadedmetadata", handleLoadedMetadata)
    audio.addEventListener("timeupdate", handleTimeUpdate)
    audio.addEventListener("ended", handleEnded)
    audio.addEventListener("error", handleError)
    audio.addEventListener("canplay", handleCanPlay)

    audio.src = audioSource
    audio.load()

    return () => {
      audio.removeEventListener("loadedmetadata", handleLoadedMetadata)
      audio.removeEventListener("timeupdate", handleTimeUpdate)
      audio.removeEventListener("ended", handleEnded)
      audio.removeEventListener("error", handleError)
      audio.removeEventListener("canplay", handleCanPlay)
      audio.pause()
      audio.src = ""
    }
  }, [audioSource])

  React.useEffect(() => {
    if (isPlaying) {
      if (audioRef.current && !error) {
        audioRef.current.play().catch((e) => {
          console.error("Error playing audio:", e)
          setError("Playback failed")
          setIsPlaying(false)
          toast({
            title: "Playback Error",
            description: "Unable to play audio. Please try again.",
            variant: "destructive",
          })
        })
      }
    } else {
      if (audioRef.current) {
        audioRef.current.pause()
      }
    }
  }, [isPlaying, error, toast])

  const togglePlayPause = () => {
    if (!isLoaded) {
      toast({
        title: "Audio Not Ready",
        description: "Please wait for the audio to load.",
        variant: "destructive",
      })
      return
    }
    setIsPlaying((prev) => !prev)
  }

  const handleProgressClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!isLoaded || totalDuration === 0) return

    const rect = e.currentTarget.getBoundingClientRect()
    const clickX = e.clientX - rect.left
    const newProgress = (clickX / rect.width) * 100
    const newTime = (newProgress / 100) * totalDuration

    setCurrentTime(newTime)
    setProgress(newProgress)

    if (audioRef.current && !error) {
      audioRef.current.currentTime = newTime
    }
  }

  const handleDownload = async () => {
    if (!audioSource) return

    try {
      const response = await fetch(audioSource)
      const blob = await response.blob()
      const url = URL.createObjectURL(blob)
      const a = document.createElement("a")
      a.href = url
      a.download = `${title.replace(/[^a-z0-9]/gi, "_")}.mp3`
      document.body.appendChild(a)
      a.click()
      document.body.removeChild(a)
      URL.revokeObjectURL(url)

      toast({
        title: "Download Started",
        description: "Your music file is being downloaded.",
      })
    } catch (error) {
      toast({
        title: "Download Failed",
        description: "Unable to download the audio file.",
        variant: "destructive",
      })
    }
  }

  return (
    <Card className="relative w-full max-w-4xl bg-gradient-to-br from-gray-800 to-gray-900 rounded-2xl overflow-hidden shadow-2xl border border-gray-700">
      <div className="relative p-6">
        {/* Waveform Display */}
        <WaveformDisplay audioElement={audioRef.current} />

        {/* Progress Bar */}
        <div className="mt-6">
          <div
            className="w-full h-2 bg-gray-700 rounded-full cursor-pointer hover:h-3 transition-all"
            onClick={handleProgressClick}
          >
            <div
              className="h-full bg-gradient-to-r from-purple-500 to-blue-500 rounded-full transition-all duration-100"
              style={{ width: `${progress}%` }}
            />
          </div>
          <div className="flex justify-between text-xs text-gray-400 mt-2">
            <span>{formatTime(currentTime)}</span>
            <span>{duration}</span>
          </div>
        </div>

        {/* Controls and Info */}
        <div className="flex items-center justify-between mt-6">
          <div className="flex items-center gap-4">
            <Button
              variant="ghost"
              size="icon"
              className="rounded-full w-14 h-14 bg-purple-600 hover:bg-purple-700 text-white shadow-lg"
              onClick={togglePlayPause}
              disabled={!isLoaded}
              aria-label={isPlaying ? "Pause" : "Play"}
            >
              {isPlaying ? <PauseCircle className="w-8 h-8" /> : <PlayCircle className="w-8 h-8" />}
            </Button>
            <div className="text-white">
              <div className="font-bold text-lg">{title}</div>
              <div className="text-sm text-gray-300 flex items-center gap-2">
                {error ? (
                  <span className="text-yellow-400 flex items-center gap-1">
                    <Volume2 className="w-3 h-3" />
                    {error}
                  </span>
                ) : (
                  <>
                    <span>{artist}</span>
                    <span>•</span>
                    <span>{genre}</span>
                  </>
                )}
              </div>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2 text-white text-sm font-mono">
              <span className="px-3 py-1 bg-purple-600/30 rounded-lg border border-purple-500/50">{bpm} BPM</span>
              <span className="px-3 py-1 bg-blue-600/30 rounded-lg border border-blue-500/50">{keySignature}</span>
            </div>
            <Button
              variant="ghost"
              size="icon"
              className="text-gray-400 hover:text-white"
              onClick={handleDownload}
              disabled={!isLoaded || !!error}
              aria-label="Download"
            >
              <Download className="w-5 h-5" />
            </Button>
          </div>
        </div>
      </div>
    </Card>
  )
}
