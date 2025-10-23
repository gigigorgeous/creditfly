"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Loader2, Volume2 } from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import { AudioPlayer } from "./audio-player"
import { Input } from "@/components/ui/input"

export function EnhancedTextToSpeech() {
  const [text, setText] = useState("")
  const [voice, setVoice] = useState("alloy")
  const [systemPrompt, setSystemPrompt] = useState("You are a helpful assistant that can generate audio from text.")
  const [isGenerating, setIsGenerating] = useState(false)
  const [audioUrl, setAudioUrl] = useState<string | null>(null)
  const [textResponse, setTextResponse] = useState<string | null>(null)
  const { toast } = useToast()

  const handleGenerate = async () => {
    if (!text.trim()) {
      toast({
        title: "Text Required",
        description: "Please enter some text to convert to speech.",
        variant: "destructive",
      })
      return
    }

    setIsGenerating(true)

    try {
      const response = await fetch("/api/enhanced-tts", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          text,
          voice,
          systemPrompt,
        }),
      })

      if (!response.ok) {
        throw new Error("Failed to generate speech")
      }

      const data = await response.json()
      setAudioUrl(data.url)
      setTextResponse(data.textResponse)

      toast({
        title: "Speech Generated!",
        description: "Your text has been converted to enhanced speech.",
      })
    } catch (error) {
      console.error("Error generating speech:", error)
      toast({
        title: "Generation Failed",
        description: "There was an error generating the speech. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsGenerating(false)
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Enhanced Text to Speech</CardTitle>
        <CardDescription>Convert text to natural-sounding speech with GPT-4o</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="voice">Voice</Label>
          <Select value={voice} onValueChange={setVoice}>
            <SelectTrigger id="voice">
              <SelectValue placeholder="Select voice" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="alloy">Alloy</SelectItem>
              <SelectItem value="echo">Echo</SelectItem>
              <SelectItem value="fable">Fable</SelectItem>
              <SelectItem value="onyx">Onyx</SelectItem>
              <SelectItem value="nova">Nova</SelectItem>
              <SelectItem value="shimmer">Shimmer</SelectItem>
              <SelectItem value="verse">Verse</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label htmlFor="systemPrompt">System Prompt (Voice Instructions)</Label>
          <Input
            id="systemPrompt"
            placeholder="E.g., Speak in a British accent and enunciate like you're talking to a child."
            value={systemPrompt}
            onChange={(e) => setSystemPrompt(e.target.value)}
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="text">Text</Label>
          <Textarea
            id="text"
            placeholder="Enter text to convert to speech..."
            value={text}
            onChange={(e) => setText(e.target.value)}
            className="min-h-[150px]"
          />
        </div>

        {audioUrl && (
          <div className="pt-4 space-y-4">
            <AudioPlayer audioUrl={audioUrl} title="Generated Speech" />

            {textResponse && (
              <div className="mt-4 p-4 bg-muted rounded-md">
                <h4 className="text-sm font-medium mb-2">AI Response:</h4>
                <p className="text-sm">{textResponse}</p>
              </div>
            )}
          </div>
        )}
      </CardContent>
      <CardFooter>
        <Button onClick={handleGenerate} disabled={isGenerating} className="w-full">
          {isGenerating ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Generating...
            </>
          ) : (
            <>
              <Volume2 className="mr-2 h-4 w-4" />
              Generate Enhanced Speech
            </>
          )}
        </Button>
      </CardFooter>
    </Card>
  )
}
