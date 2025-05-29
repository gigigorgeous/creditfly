"use client"

import { useState, useEffect } from "react"

interface UserMusicTrack {
  id: number
  title: string
  genre: string
  mood?: string
  duration_milliseconds: number
  audio_url: string
  status: string
  created_at: string
}

export function useUserMusic() {
  const [userMusic, setUserMusic] = useState<UserMusicTrack[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchUserMusic = async () => {
    try {
      setLoading(true)
      setError(null)

      const response = await fetch("/api/user-music")
      const result = await response.json()

      if (result.success && Array.isArray(result.data)) {
        setUserMusic(result.data)
      } else {
        setUserMusic([])
        setError(result.message || "Failed to fetch user music")
      }
    } catch (err) {
      console.error("Error fetching user music:", err)
      setError("Network error while fetching music")
      setUserMusic([]) // Ensure it's always an array
    } finally {
      setLoading(false)
    }
  }

  const saveUserMusic = async (musicData: Partial<UserMusicTrack>) => {
    try {
      const response = await fetch("/api/user-music", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(musicData),
      })

      const result = await response.json()

      if (result.success) {
        // Refresh the music list
        await fetchUserMusic()
        return result.data
      } else {
        throw new Error(result.message || "Failed to save music")
      }
    } catch (err) {
      console.error("Error saving user music:", err)
      throw err
    }
  }

  useEffect(() => {
    fetchUserMusic()
  }, [])

  return {
    userMusic,
    loading,
    error,
    refetch: fetchUserMusic,
    saveMusic: saveUserMusic,
  }
}
