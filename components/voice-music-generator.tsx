"use client"

import type React from "react"
import { useState, useEffect, useCallback, useRef } from "react"
import { createClient } from "@/supabase/client"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Loader2, Music, Mic, Play, CircleStopIcon as Stop } from "lucide-react"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Label } from "@/components/ui/label"
import * as Tone from "tone"
import nlp from "compromise" // For simple NLP parsing

interface MusicGeneration {
  id: string
  prompt: string
  audio_url: string
  created_at: string
}

// Define simple moods and instruments for direct Tone.js playback
const MOODS = {
  happy: { notes: ["C4", "E4", "G4", "B4"], tempo: 120 },
  sad: { notes: ["C4", "D#4", "G4", "A#4"], tempo: 60 },
  energetic: { notes: ["C5", "E5", "G5", "B5"], tempo: 140 },
  calm: { notes: ["A3", "C4", "E4", "G4"], tempo: 70 },
}

const INSTRUMENTS = {
  synth: () => new Tone.Synth().toDestination(),
  fm: () => new Tone.FMSynth().toDestination(),
  am: () => new Tone.AMSynth().toDestination(),
  membrane: () => new Tone.MembraneSynth().toDestination(),
}

export default function VoiceMusicGenerator({ userId }: { userId: string }) {
  const supabase = createClient()
  const [prompt, setPrompt] = useState("")
  const [transcript, setTranscript] = useState("")
  const [loading, setLoading] = useState(false)
  const [generatedMusic, setGeneratedMusic] = useState<MusicGeneration[]>([])
  const [error, setError] = useState<string | null>(null)
  const [isListening, setIsListening] = useState(false)

  // State for direct Tone.js playback
  const [liveMood, setLiveMood] = useState<string | null>(null)
  const [liveTempo, setLiveTempo] = useState(120)
  const [liveInstrument, setLiveInstrument] = useState("synth")
  const [isLivePlaying, setIsLivePlaying] = useState(false)
  const liveSynthRef = useRef<Tone.Synth | Tone.FMSynth | Tone.AMSynth | Tone.MembraneSynth | null>(null)
  const liveIndexRef = useRef(0)

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

  // --- Voice Recognition Logic ---
  const startListening = () => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition
    if (!SpeechRecognition) {
      alert("Speech Recognition API not supported in this browser.")
      return
    }

    const recognition = new SpeechRecognition()
    recognition.lang = "en-US"
    recognition.interimResults = false
    recognition.maxAlternatives = 1

    recognition.onstart = () => {
      setIsListening(true)
      setTranscript("Listening...")
    }

    recognition.onresult = (event) => {
      const speechResult = event.results[0][0].transcript
      setTranscript(speechResult)
      setPrompt(speechResult) // Set the main prompt for AI generation
      setIsListening(false)
    }

    recognition.onerror = (event) => {
      console.error("Speech recognition error", event.error)
      setTranscript(`Error: ${event.error}`)
      setIsListening(false)
    }

    recognition.onend = () => {
      setIsListening(false)
    }

    recognition.start()
  }

  // --- AI Music Generation Logic ---
  const handleGenerateMusic = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    if (!prompt.trim()) {
      setError("Please enter a prompt or use voice input.")
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
      setPrompt("") // Clear prompt after successful generation
      setTranscript("") // Clear transcript as well
    } catch (err: any) {
      setError(err.message || "An unexpected error occurred.")
      console.error("Music generation error:", err)
    } finally {
      setLoading(false)
    }
  }

  // --- Direct Tone.js Playback Logic (for simple voice commands) ---
  const parseLiveCommand = (text: string) => {
    const doc = nlp(text.toLowerCase())

    const foundMood = Object.keys(MOODS).find((m) => doc.has(m))
    if (foundMood) setLiveMood(foundMood)
    else setLiveMood(null)

    const numbers = doc.numbers().values().toNumber().out("array")
    if (numbers.length > 0) {
      const t = numbers[0]
      if (t >= 40 && t <= 200) setLiveTempo(t)
    }

    const foundInstrument = Object.keys(INSTRUMENTS).find((i) => doc.has(i))
    if (foundInstrument) setLiveInstrument(foundInstrument)
  }

  const startLiveListening = () => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition
    if (!SpeechRecognition) {
      alert("Speech Recognition API not supported in this browser.")
      return
    }

    const recognition = new SpeechRecognition()
    recognition.lang = "en-US"
    recognition.interimResults = false
    recognition.maxAlternatives = 1

    recognition.onstart = () => {
      setIsListening(true)
      setTranscript("Listening for live command...")
    }

    recognition.onresult = (event) => {
      const speechResult = event.results[0][0].transcript
      setTranscript(speechResult)
      parseLiveCommand(speechResult) // Parse for live command
      setIsListening(false)
    }

    recognition.onerror = (event) => {
      console.error("Speech recognition error", event.error)
      setTranscript(`Error: ${event.error}`)
      setIsListening(false)
    }

    recognition.onend = () => {
      setIsListening(false)
    }

    recognition.start()
  }

  const playLiveMelody = async () => {
    if (!liveMood) {
      alert("Please say a mood like happy, sad, energetic, or calm for live playback.")
      return
    }

    if (isLivePlaying) return

    await Tone.start() // Ensure Tone.js context is started
    Tone.Transport.bpm.value = liveTempo
    liveSynthRef.current = INSTRUMENTS[liveInstrument]()
    liveIndexRef.current = 0

    Tone.Transport.cancel()
    Tone.Transport.scheduleRepeat((time) => {
      const notes = MOODS[liveMood!].notes
      liveSynthRef.current!.triggerAttackRelease(notes[liveIndexRef.current % notes.length], "8n", time)
      liveIndexRef.current++
    }, "4n")

    Tone.Transport.start()
    setIsLivePlaying(true)
  }

  const stopLiveMelody = () => {
    Tone.Transport.stop()
    Tone.Transport.cancel()
    if (liveSynthRef.current) liveSynthRef.current.dispose()
    setIsLivePlaying(false)
  }

  // Cleanup Tone.js on component unmount
  useEffect(() => {
    return () => {
      Tone.Transport.stop()
      Tone.Transport.cancel()
      if (liveSynthRef.current) liveSynthRef.current.dispose()
    }
  }, [])

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      <Card>
        <CardHeader>
          <CardTitle>AI Music Generation</CardTitle>
          <CardDescription>Generate unique music from text or voice prompts.</CardDescription>
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
                disabled={loading || isListening}
              />
            </div>
            <div className="flex items-center gap-2">
              <Button
                type="button"
                onClick={startListening}
                disabled={isListening || loading}
                className="flex-shrink-0"
              >
                {isListening ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Listening...
                  </>
                ) : (
                  <>
                    <Mic className="mr-2 h-4 w-4" />
                    Voice Input
                  </>
                )}
              </Button>
              <span className="text-sm text-muted-foreground flex-grow truncate">
                {transcript || "Click 'Voice Input' or type a prompt."}
              </span>
            </div>
            {error && <p className="text-red-500 text-sm">{error}</p>}
            <Button type="submit" className="w-full" disabled={loading || isListening}>
              {loading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Generating...
                </>
              ) : (
                <>
                  <Music className="mr-2 h-4 w-4" />
                  Generate AI Music
                </>
              )}
            </Button>
          </form>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Your Generated Tracks</CardTitle>
          <CardDescription>Listen to your past AI creations.</CardDescription>
        </CardHeader>
        <CardContent>
          {generatedMusic.length === 0 && !loading ? (
            <p className="text-muted-foreground text-center py-8">No AI music generated yet. Start creating!</p>
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

      {/* Optional: Live Melody Generation Card */}
      <Card className="lg:col-span-2">
        <CardHeader>
          <CardTitle>Live Melody Generator (Tone.js)</CardTitle>
          <CardDescription>
            Say "play a happy melody" or "play a sad melody at 70 bpm with fm synth" for instant playback.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center gap-2">
            <Button type="button" onClick={startLiveListening} disabled={isListening || isLivePlaying}>
              {isListening ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Listening...
                </>
              ) : (
                <>
                  <Mic className="mr-2 h-4 w-4" />
                  Live Voice Command
                </>
              )}
            </Button>
            <span className="text-sm text-muted-foreground flex-grow truncate">
              {transcript.includes("Live command") ? transcript : "Say a command like 'play a happy melody'"}
            </span>
          </div>
          <div className="flex gap-2">
            <Button onClick={playLiveMelody} disabled={isLivePlaying || !liveMood}>
              <Play className="mr-2 h-4 w-4" /> Play Live
            </Button>
            <Button onClick={stopLiveMelody} disabled={!isLivePlaying} variant="outline">
              <Stop className="mr-2 h-4 w-4" /> Stop Live
            </Button>
          </div>
          <div className="grid grid-cols-2 gap-4 text-sm">
            <p>
              <strong>Detected Mood:</strong> {liveMood || "None"}
            </p>
            <p>
              <strong>Tempo:</strong> {liveTempo} BPM
            </p>
            <p>
              <strong>Instrument:</strong> {liveInstrument}
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
