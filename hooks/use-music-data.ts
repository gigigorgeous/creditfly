"use client"

import { useState, useEffect } from "react"

export interface MusicTrack {
  id: string
  title: string
  artist?: string
  audioUrl: string
  duration?: number
  genre?: string
  mood?: string
  bpm?: number
  key?: string
  createdAt: string
  provider: "suno" | "udio" | "musicgen" | "basic"
  status: "queued" | "in_progress" | "complete" | "failed"
  thumbnailUrl?: string
  waveformUrl?: string
  lyrics?: string
  tags?: string[]
}

export function useMusicData() {
  const [tracks, setTracks] = useState<MusicTrack[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchTracks = async () => {
    setIsLoading(true)
    setError(null)

    try {
      const controller = new AbortController()
      const timeoutId = setTimeout(() => controller.abort(), 10000)

      // Fetch from multiple sources with error handling and timeout
      const [musicLabResponse, sunoResponse] = await Promise.allSettled([
        fetch("/api/music/list", { signal: controller.signal }).catch(() => ({ ok: false })),
        fetch("/api/suno-generations?limit=50", { signal: controller.signal }).catch(() => ({ ok: false })),
      ])

      clearTimeout(timeoutId)

      const allTracks: MusicTrack[] = []

      // Add Music Lab tracks if successful
      if (musicLabResponse.status === "fulfilled" && musicLabResponse.value.ok) {
        try {
          const musicLabData = await musicLabResponse.value.json()
          if (musicLabData.tracks) {
            allTracks.push(...musicLabData.tracks)
          }
        } catch (err) {
          console.error("Error parsing Music Lab response:", err)
        }
      }

      // Add legacy Suno tracks if successful
      if (sunoResponse.status === "fulfilled" && sunoResponse.value.ok) {
        try {
          const sunoData = await sunoResponse.value.json()
          if (sunoData.generations) {
            const legacyTracks = sunoData.generations
              .filter((gen: any) => gen.status === "complete" && gen.audioUrl)
              .map((gen: any) => ({
                id: gen.id,
                title: gen.title,
                audioUrl: gen.audioUrl,
                duration: gen.duration,
                genre: gen.genre,
                createdAt: gen.created_at || gen.createdAt,
                provider: "suno" as const,
                status: "complete" as const,
                thumbnailUrl: gen.thumbnailUrl,
                lyrics: gen.lyrics,
                tags: gen.tags,
              }))
            allTracks.push(...legacyTracks)
          }
        } catch (err) {
          console.error("Error parsing Suno response:", err)
        }
      }

      // Remove duplicates and sort by creation date
      const uniqueTracks = allTracks
        .filter((track, index, self) => index === self.findIndex((t) => t.id === track.id))
        .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())

      setTracks(uniqueTracks)

      // Set informative error message if both sources failed
      if (uniqueTracks.length === 0) {
        if (musicLabResponse.status === "rejected" && sunoResponse.status === "rejected") {
          setError("Unable to load tracks. Music services are temporarily unavailable.")
        } else if (musicLabResponse.status === "rejected") {
          setError("Music Lab is temporarily unavailable.")
        } else if (sunoResponse.status === "rejected") {
          setError("Suno service is temporarily unavailable.")
        }
      }
    } catch (err) {
      console.error("Error fetching tracks:", err)

      if (err instanceof Error && err.name === "AbortError") {
        setError("Request timed out. Music services may be slow or unavailable.")
      } else {
        setError(err instanceof Error ? err.message : "Failed to fetch tracks")
      }

      setTracks([])
    } finally {
      setIsLoading(false)
    }
  }

  const refreshTracks = () => {
    fetchTracks()
  }

  const addTrack = (track: MusicTrack) => {
    setTracks((prev) => [track, ...prev])
  }

  const updateTrack = (trackId: string, updates: Partial<MusicTrack>) => {
    setTracks((prev) => prev.map((track) => (track.id === trackId ? { ...track, ...updates } : track)))
  }

  const removeTrack = (trackId: string) => {
    setTracks((prev) => prev.filter((track) => track.id !== trackId))
  }

  useEffect(() => {
    fetchTracks()
  }, [])

  return {
    tracks,
    isLoading,
    error,
    refreshTracks,
    addTrack,
    updateTrack,
    removeTrack,
  }
}
