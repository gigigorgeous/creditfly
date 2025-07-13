"use client"

import { Label } from "@/components/ui/label"

import type React from "react"

import { useState, useEffect, useCallback } from "react"
import { createClient } from "@/supabase/client"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Loader2, Music } from "lucide-react"
import { ScrollArea } from "@/components/ui/scroll-area"

interface MusicGeneration {
  id: string
  prompt: string
  audio_url: string
  created_at: string
}

export default function MusicGenerator({ userId }: { userId: string }) {
  const supabase = createClient()
  const [prompt, setPrompt] = useState("")
  const [loading, setLoading] = useState(false)
  const [generatedMusic, setGeneratedMusic] = useState<MusicGeneration[]>([])
  const [error, setError] = useState<string | null>(null)

  const fetchGeneratedMusic = useCallback(async () => {
    try {
      const { data, error } = await supabase
        .from("music_generations")
        .select("*")
        .eq("user_id", userId)
        .order("created_at", { ascending: false })

      if (error) throw error
      setGeneratedMusic(data || [])
    } catch (err) {
      console.error("Error fetching generated music:", err)
      setError("Failed to load your generated music.")
    }
  }, [userId, supabase])

  useEffect(() => {
    fetchGeneratedMusic()
  }, [fetchGeneratedMusic])

  const handleGenerateMusic = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    if (!prompt.trim()) {
      setError("Please enter a prompt.")
      return
    }

    setLoading(true)
    setError(null)

    try {
      const response = await fetch("/api/generate-music", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ prompt }),
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || "Failed to generate music.")
      }

      const data = await response.json()
      setGeneratedMusic((prev) => [
        {
          id: data.id,
          prompt: prompt,
          audio_url: data.audioUrl,
          created_at: new Date().toISOString(),
        },
        ...prev,
      ])
      setPrompt("")
    } catch (err: any) {
      setError(err.message || "An unexpected error occurred.")
      console.error("Music generation error:", err)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      <Card>
        <CardHeader>
          <CardTitle>Generate New Music</CardTitle>
          <CardDescription>Enter a prompt to create your unique music track.</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleGenerateMusic} className="space-y-4">
            <div>
              <Label htmlFor="music-prompt">Music Prompt</Label>
              <Textarea
                id="music-prompt"
                placeholder="e.g., 'Upbeat synthwave track with a driving bassline and ethereal pads'"
                value={prompt}
                onChange={(e) => setPrompt(e.target.value)}
                rows={5}
                className="resize-y"
                disabled={loading}
              />
            </div>
            {error && <p className="text-red-500 text-sm">{error}</p>}
            <Button type="submit" className="w-full" disabled={loading}>
              {loading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Generating...
                </>
              ) : (
                <>
                  <Music className="mr-2 h-4 w-4" />
                  Generate Music
                </>
              )}
            </Button>
          </form>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Your Generated Tracks</CardTitle>
          <CardDescription>Listen to your past creations.</CardDescription>
        </CardHeader>
        <CardContent>
          {generatedMusic.length === 0 && !loading ? (
            <p className="text-muted-foreground text-center py-8">No music generated yet. Start creating!</p>
          ) : (
            <ScrollArea className="h-[400px] pr-4">
              <div className="space-y-4">
                {generatedMusic.map((track) => (
                  <div key={track.id} className="flex flex-col gap-2 p-3 border rounded-md bg-muted/50">
                    <p className="text-sm font-medium">{track.prompt}</p>
                    {track.audio_url ? (
                      <audio controls src={track.audio_url} className="w-full">
                        Your browser does not support the audio element.
                      </audio>
                    ) : (
                      <p className="text-sm text-muted-foreground">Audio not available.</p>
                    )}
                    <p className="text-xs text-muted-foreground">
                      Generated on: {new Date(track.created_at).toLocaleString()}
                    </p>
                  </div>
                ))}
              </div>
            </ScrollArea>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
