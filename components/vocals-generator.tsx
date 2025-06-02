"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Loader2, Mic } from "lucide-react"
import { useToast } from "@/hooks/use-toast"

const VOICE_TYPES = ["Male Deep", "Male Tenor", "Female Alto", "Female Soprano", "Robotic", "Whisper", "Choir"]

export function VocalsGenerator() {
  const [lyrics, setLyrics] = useState("")
  const [voiceType, setVoiceType] = useState("")
  const [isGenerating, setIsGenerating] = useState(false)
  const { toast } = useToast()

  const handleGenerate = async () => {
    if (!lyrics.trim()) {
      toast({
        title: "Lyrics required",
        description: "Please enter lyrics for the vocals",
        variant: "destructive",
      })
      return
    }

    setIsGenerating(true)

    // Simulate generation
    setTimeout(() => {
      setIsGenerating(false)
      toast({
        title: "Vocals generated!",
        description: "Your vocal track has been created successfully.",
      })
    }, 4000)
  }

  return (
    <div className="container py-6 space-y-6">
      <div className="flex flex-col space-y-2">
        <h2 className="text-2xl font-bold tracking-tight">Vocals Generator</h2>
        <p className="text-muted-foreground">Generate AI vocals from lyrics</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Vocal Settings</CardTitle>
          <CardDescription>Configure your vocal generation</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="lyrics">Lyrics</Label>
            <Textarea
              id="lyrics"
              placeholder="Enter the lyrics you want to be sung..."
              value={lyrics}
              onChange={(e) => setLyrics(e.target.value)}
              className="min-h-[150px]"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="voice-type">Voice Type</Label>
            <Select value={voiceType} onValueChange={setVoiceType}>
              <SelectTrigger>
                <SelectValue placeholder="Select voice type" />
              </SelectTrigger>
              <SelectContent>
                {VOICE_TYPES.map((voice) => (
                  <SelectItem key={voice} value={voice}>
                    {voice}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <Button onClick={handleGenerate} disabled={isGenerating} className="w-full">
            {isGenerating ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Generating Vocals...
              </>
            ) : (
              <>
                <Mic className="mr-2 h-4 w-4" />
                Generate Vocals
              </>
            )}
          </Button>
        </CardContent>
      </Card>
    </div>
  )
}
