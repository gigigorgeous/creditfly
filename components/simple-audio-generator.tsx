"use client"

import { useState, useRef } from "react"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { Slider } from "@/components/ui/slider"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { useToast } from "@/hooks/use-toast"
import { Loader2, Music, Play, Pause, Save, Plus, Trash } from "lucide-react"

interface ToneSettings {
  frequency: number
  duration: number
  amplitude: number
}

export function SimpleAudioGenerator() {
  const [prompt, setPrompt] = useState("")
  const [tones, setTones] = useState<ToneSettings[]>([
    { frequency: 440, duration: 1000, amplitude: -20 },
    { frequency: 660, duration: 1000, amplitude: -20 },
    { frequency: 880, duration: 1000, amplitude: -20 },
  ])
  const [isGenerating, setIsGenerating] = useState(false)
  const [generatedMusic, setGeneratedMusic] = useState<string | null>(null)
  const [generatedVoice, setGeneratedVoice] = useState<string | null>(null)
  const [isMusicPlaying, setIsMusicPlaying] = useState(false)
  const [isVoicePlaying, setIsVoicePlaying] = useState(false)

  const musicAudioRef = useRef<HTMLAudioElement | null>(null)
  const voiceAudioRef = useRef<HTMLAudioElement | null>(null)
  const { toast } = useToast()

  const handleAddTone = () => {
    setTones([...tones, { frequency: 440, duration: 1000, amplitude: -20 }])
  }

  const handleRemoveTone = (index: number) => {
    setTones(tones.filter((_, i) => i !== index))
  }

  const handleToneChange = (index: number, field: keyof ToneSettings, value: number) => {
    const newTones = [...tones]
    newTones[index][field] = value
    setTones(newTones)
  }

  const handleGenerateAudio = async () => {
    if (!prompt.trim()) {
      toast({
        title: "Prompt required",
        description: "Please enter a description for your audio",
        variant: "destructive",
      })
      return
    }

    setIsGenerating(true)

    try {
      const response = await fetch("/api/generate-audio", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          text: prompt,
          frequencies: tones.map((tone) => tone.frequency),
          durations: tones.map((tone) => tone.duration),
          amplitudes: tones.map((tone) => tone.amplitude),
        }),
      })

      // Check if response is OK before trying to parse JSON
      if (!response.ok) {
        const contentType = response.headers.get("content-type")
        if (contentType && contentType.includes("application/json")) {
          const errorData = await response.json()
          throw new Error(errorData.message || `Error ${response.status}: ${response.statusText}`)
        } else {
          throw new Error(`Error ${response.status}: ${response.statusText}`)
        }
      }

      const result = await response.json()
      setGeneratedMusic(result.musicUrl)
      setGeneratedVoice(result.voiceUrl)

      toast({
        title: "Audio Generated!",
        description: "Your music and voice have been generated successfully.",
      })
    } catch (error) {
      console.error("Error generating audio:", error)
      toast({
        title: "Generation Failed",
        description: error instanceof Error ? error.message : "There was an error generating audio",
        variant: "destructive",
      })
    } finally {
      setIsGenerating(false)
    }
  }

  const playMusic = () => {
    if (!generatedMusic) return

    if (!musicAudioRef.current) {
      musicAudioRef.current = new Audio(generatedMusic)
      musicAudioRef.current.onended = () => setIsMusicPlaying(false)
    }

    musicAudioRef.current.play()
    setIsMusicPlaying(true)
  }

  const pauseMusic = () => {
    if (musicAudioRef.current) {
      musicAudioRef.current.pause()
      setIsMusicPlaying(false)
    }
  }

  const playVoice = () => {
    if (!generatedVoice) return

    if (!voiceAudioRef.current) {
      voiceAudioRef.current = new Audio(generatedVoice)
      voiceAudioRef.current.onended = () => setIsVoicePlaying(false)
    }

    voiceAudioRef.current.play()
    setIsVoicePlaying(true)
  }

  const pauseVoice = () => {
    if (voiceAudioRef.current) {
      voiceAudioRef.current.pause()
      setIsVoicePlaying(false)
    }
  }

  const formatFrequency = (freq: number) => {
    if (freq >= 1000) {
      return `${(freq / 1000).toFixed(1)} kHz`
    }
    return `${freq} Hz`
  }

  const formatDuration = (duration: number) => {
    return `${(duration / 1000).toFixed(1)}s`
  }

  return (
    <div className="container py-6 space-y-6">
      <div className="flex flex-col space-y-2">
        <h2 className="text-2xl font-bold tracking-tight">Simple Audio Generator</h2>
        <p className="text-muted-foreground">Generate simple audio effects and sounds</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Audio Description</CardTitle>
          <CardDescription>Describe the audio you want to generate</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <Textarea
            placeholder="Describe the audio you want (e.g., 'Rain sounds for relaxation', 'Upbeat drum loop', 'Nature ambience')"
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            className="min-h-[100px]"
          />
          <Button
            onClick={handleGenerateAudio}
            disabled={isGenerating || !prompt || tones.length === 0}
            className="w-full"
          >
            {isGenerating ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Generating...
              </>
            ) : (
              <>
                <Music className="mr-2 h-4 w-4" />
                Generate Audio
              </>
            )}
          </Button>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Tone Settings</CardTitle>
          <CardDescription>Configure the tones for your audio</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {tones.map((tone, index) => (
            <div key={index} className="p-4 border rounded-md space-y-4">
              <div className="flex justify-between items-center">
                <h3 className="font-medium">Tone {index + 1}</h3>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => handleRemoveTone(index)}
                  disabled={tones.length <= 1}
                >
                  <Trash className="h-4 w-4" />
                </Button>
              </div>

              <div className="space-y-4">
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <Label>Frequency: {formatFrequency(tone.frequency)}</Label>
                  </div>
                  <Slider
                    min={100}
                    max={2000}
                    step={10}
                    value={[tone.frequency]}
                    onValueChange={(value) => handleToneChange(index, "frequency", value[0])}
                  />
                </div>

                <div className="space-y-2">
                  <div className="flex justify-between">
                    <Label>Duration: {formatDuration(tone.duration)}</Label>
                  </div>
                  <Slider
                    min={100}
                    max={3000}
                    step={100}
                    value={[tone.duration]}
                    onValueChange={(value) => handleToneChange(index, "duration", value[0])}
                  />
                </div>

                <div className="space-y-2">
                  <div className="flex justify-between">
                    <Label>Amplitude: {tone.amplitude} dB</Label>
                  </div>
                  <Slider
                    min={-40}
                    max={0}
                    step={1}
                    value={[tone.amplitude]}
                    onValueChange={(value) => handleToneChange(index, "amplitude", value[0])}
                  />
                </div>
              </div>
            </div>
          ))}

          <Button variant="outline" onClick={handleAddTone} className="w-full">
            <Plus className="h-4 w-4 mr-2" />
            Add Tone
          </Button>
        </CardContent>
      </Card>

      {(generatedMusic || generatedVoice) && (
        <Card>
          <CardHeader>
            <CardTitle>Generated Audio</CardTitle>
            <CardDescription>Listen to your generated audio</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {generatedMusic && (
              <div className="space-y-2">
                <Label>Generated Music</Label>
                <div className="flex items-center gap-4 p-4 border rounded-md">
                  <Button variant="outline" size="icon" onClick={isMusicPlaying ? pauseMusic : playMusic}>
                    {isMusicPlaying ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4" />}
                  </Button>
                  <div className="flex-1">
                    <div className="h-4 bg-primary/20 rounded-full overflow-hidden">
                      {isMusicPlaying && (
                        <div className="h-full bg-primary/50 animate-pulse" style={{ width: "100%" }}></div>
                      )}
                    </div>
                  </div>
                  <Button variant="ghost" size="icon" onClick={() => window.open(generatedMusic, "_blank")}>
                    <Save className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            )}

            {generatedVoice && (
              <div className="space-y-2">
                <Label>Generated Voice</Label>
                <div className="flex items-center gap-4 p-4 border rounded-md">
                  <Button variant="outline" size="icon" onClick={isVoicePlaying ? pauseVoice : playVoice}>
                    {isVoicePlaying ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4" />}
                  </Button>
                  <div className="flex-1">
                    <div className="h-4 bg-primary/20 rounded-full overflow-hidden">
                      {isVoicePlaying && (
                        <div className="h-full bg-primary/50 animate-pulse" style={{ width: "100%" }}></div>
                      )}
                    </div>
                  </div>
                  <Button variant="ghost" size="icon" onClick={() => window.open(generatedVoice, "_blank")}>
                    <Save className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  )
}
