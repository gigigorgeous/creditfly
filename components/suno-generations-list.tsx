"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { RefreshCw, Music, AlertCircle } from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import { AudioPlayer } from "./audio-player"

interface SunoGeneration {
  id: string
  status: "queued" | "in_progress" | "complete" | "failed"
  title: string
  audioUrl?: string
  createdAt: string
  updatedAt: string
  error?: string
}

export function SunoGenerationsList() {
  const [generations, setGenerations] = useState<SunoGeneration[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const { toast } = useToast()

  const fetchGenerations = async () => {
    setIsLoading(true)
    try {
      const response = await fetch("/api/suno-generations?limit=10")

      if (!response.ok) {
        throw new Error("Failed to fetch generations")
      }

      const data = await response.json()
      setGenerations(data.generations)
    } catch (error) {
      console.error("Error fetching generations:", error)
      toast({
        title: "Error",
        description: "Failed to load your music generations",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    fetchGenerations()
  }, [])

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleString()
  }

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <div>
          <CardTitle>Your Music Generations</CardTitle>
          <CardDescription>Recent tracks created with Suno AI</CardDescription>
        </div>
        <Button variant="outline" size="icon" onClick={fetchGenerations} disabled={isLoading}>
          <RefreshCw className={`h-4 w-4 ${isLoading ? "animate-spin" : ""}`} />
        </Button>
      </CardHeader>
      <CardContent>
        {generations.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            {isLoading ? "Loading generations..." : "No generations found. Create your first track!"}
          </div>
        ) : (
          <div className="space-y-4">
            {generations.map((generation) => (
              <div key={generation.id} className="border rounded-md p-4">
                <div className="flex items-center justify-between mb-2">
                  <h3 className="font-medium">{generation.title}</h3>
                  <div className="flex items-center">
                    {generation.status === "complete" && (
                      <span className="text-xs bg-green-100 text-green-800 px-2 py-1 rounded-full">Complete</span>
                    )}
                    {generation.status === "in_progress" && (
                      <span className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded-full">In Progress</span>
                    )}
                    {generation.status === "queued" && (
                      <span className="text-xs bg-yellow-100 text-yellow-800 px-2 py-1 rounded-full">Queued</span>
                    )}
                    {generation.status === "failed" && (
                      <span className="text-xs bg-red-100 text-red-800 px-2 py-1 rounded-full">Failed</span>
                    )}
                  </div>
                </div>

                <div className="text-xs text-muted-foreground mb-2">Created: {formatDate(generation.createdAt)}</div>

                {generation.audioUrl ? (
                  <AudioPlayer audioUrl={generation.audioUrl} title={generation.title} />
                ) : generation.status === "failed" ? (
                  <div className="flex items-center text-sm text-destructive">
                    <AlertCircle className="h-4 w-4 mr-1" />
                    {generation.error || "Generation failed"}
                  </div>
                ) : (
                  <div className="flex items-center text-sm text-muted-foreground">
                    <Music className="h-4 w-4 mr-1" />
                    Waiting for audio...
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  )
}
