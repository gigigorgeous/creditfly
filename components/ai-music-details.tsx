"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible"
import { Badge } from "@/components/ui/badge"
import { ChevronDown, ChevronUp, Music, AudioWaveformIcon as Waveform } from "lucide-react"
import { AudioPlayer } from "./audio-player"

interface AIGeneratedMusic {
  id: string
  title: string
  audioUrl: string
  genre: string
  mood: string
  duration: number
  createdAt: Date
  musicDescription: {
    musicDescription?: string
    structure: string[] | string
    tempo: number
    key: string
    instrumentation: string[] | string[]
    mixingNotes?: string
    theme?: string
    melody?: string
    harmony?: string
    rhythm?: string
  }
  aiGenerated: boolean
}

interface AIMusicDetailsProps {
  music: AIGeneratedMusic
  onSave?: () => void
  onDiscard?: () => void
}

export function AIMusicDetails({ music, onSave, onDiscard }: AIMusicDetailsProps) {
  const [isStructureOpen, setIsStructureOpen] = useState(false)
  const [isInstrumentationOpen, setIsInstrumentationOpen] = useState(false)

  const formatDuration = (seconds: number) => {
    const minutes = Math.floor(seconds / 60)
    const remainingSeconds = seconds % 60
    return `${minutes}:${remainingSeconds.toString().padStart(2, "0")}`
  }

  // Handle different structure formats (array or string)
  const getStructureItems = () => {
    if (Array.isArray(music.musicDescription.structure)) {
      return music.musicDescription.structure
    } else if (typeof music.musicDescription.structure === "string") {
      // Split string by common delimiters
      return music.musicDescription.structure.split(/[-,]|\s+/).filter(Boolean)
    }
    return []
  }

  // Handle different instrumentation formats (array or string)
  const getInstrumentationItems = () => {
    if (Array.isArray(music.musicDescription.instrumentation)) {
      return music.musicDescription.instrumentation
    } else if (typeof music.musicDescription.instrumentation === "string") {
      // Split string by common delimiters
      return music.musicDescription.instrumentation
        .split(/[,;]/)
        .map((item) => item.trim())
        .filter(Boolean)
    }
    return []
  }

  return (
    <Card className="border-primary/20 bg-primary/5">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Music className="h-5 w-5 text-primary" />
          <span>{music.title}</span>
        </CardTitle>
        <CardDescription>
          AI-generated {music.genre} track with {music.mood} mood
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <AudioPlayer audioUrl={music.audioUrl} title={music.title} />

        <div className="flex flex-wrap gap-2">
          <Badge variant="outline">{music.genre}</Badge>
          <Badge variant="outline">{music.mood}</Badge>
          <Badge variant="outline">{formatDuration(music.duration)}</Badge>
          <Badge variant="outline">{music.musicDescription.key}</Badge>
          <Badge variant="outline">{music.musicDescription.tempo} BPM</Badge>
          <Badge variant="secondary">432hz</Badge>
        </div>

        <div className="text-sm text-muted-foreground">{music.musicDescription.musicDescription}</div>

        <Collapsible open={isStructureOpen} onOpenChange={setIsStructureOpen} className="w-full">
          <CollapsibleTrigger asChild>
            <Button variant="ghost" className="flex w-full justify-between p-2 text-sm font-medium">
              <span>Song Structure</span>
              {isStructureOpen ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
            </Button>
          </CollapsibleTrigger>
          <CollapsibleContent className="space-y-2 rounded-md bg-muted/50 p-2">
            <div className="grid grid-cols-2 gap-2">
              {getStructureItems().map((part, index) => (
                <div key={index} className="flex items-center gap-2">
                  <Waveform className="h-4 w-4 text-primary" />
                  <span className="text-sm">{part}</span>
                </div>
              ))}
            </div>
          </CollapsibleContent>
        </Collapsible>

        <Collapsible open={isInstrumentationOpen} onOpenChange={setIsInstrumentationOpen} className="w-full">
          <CollapsibleTrigger asChild>
            <Button variant="ghost" className="flex w-full justify-between p-2 text-sm font-medium">
              <span>Instrumentation</span>
              {isInstrumentationOpen ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
            </Button>
          </CollapsibleTrigger>
          <CollapsibleContent className="space-y-2 rounded-md bg-muted/50 p-2">
            <div className="grid grid-cols-2 gap-2">
              {getInstrumentationItems().map((instrument, index) => (
                <div key={index} className="text-sm">
                  • {instrument}
                </div>
              ))}
            </div>
          </CollapsibleContent>
        </Collapsible>

        {music.musicDescription.theme && (
          <div className="rounded-md bg-muted/50 p-3 mt-2">
            <h4 className="mb-1 text-sm font-medium">Theme</h4>
            <p className="text-sm text-muted-foreground">{music.musicDescription.theme}</p>
          </div>
        )}

        {music.musicDescription.melody && (
          <div className="rounded-md bg-muted/50 p-3 mt-2">
            <h4 className="mb-1 text-sm font-medium">Melody</h4>
            <p className="text-sm text-muted-foreground">{music.musicDescription.melody}</p>
          </div>
        )}

        {music.musicDescription.harmony && (
          <div className="rounded-md bg-muted/50 p-3 mt-2">
            <h4 className="mb-1 text-sm font-medium">Harmony</h4>
            <p className="text-sm text-muted-foreground">{music.musicDescription.harmony}</p>
          </div>
        )}

        {music.musicDescription.rhythm && (
          <div className="rounded-md bg-muted/50 p-3 mt-2">
            <h4 className="mb-1 text-sm font-medium">Rhythm</h4>
            <p className="text-sm text-muted-foreground">{music.musicDescription.rhythm}</p>
          </div>
        )}

        {music.musicDescription.mixingNotes && (
          <div className="rounded-md bg-muted/50 p-3">
            <h4 className="mb-1 text-sm font-medium">Mixing Notes</h4>
            <p className="text-sm text-muted-foreground">{music.musicDescription.mixingNotes}</p>
          </div>
        )}
      </CardContent>

      {(onSave || onDiscard) && (
        <CardFooter className="flex justify-end gap-2">
          {onDiscard && (
            <Button variant="outline" onClick={onDiscard}>
              Discard
            </Button>
          )}
          {onSave && <Button onClick={onSave}>Save to Collection</Button>}
        </CardFooter>
      )}
    </Card>
  )
}
