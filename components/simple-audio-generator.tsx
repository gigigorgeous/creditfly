"use client"

import { useActionState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { generateAudioAction } from "../app/actions/generate-audio"

export default function SimpleAudioGenerator() {
  const [state, formAction, isPending] = useActionState(generateAudioAction, {
    success: false,
    audioUrl: "",
    error: "",
  })

  return (
    <Card className="w-full max-w-md mx-auto">
      <CardHeader>
        <CardTitle>Generate Audio</CardTitle>
      </CardHeader>
      <CardContent>
        <form action={formAction} className="space-y-4">
          <div>
            <label htmlFor="prompt" className="sr-only">
              Audio Prompt
            </label>
            <Input
              id="prompt"
              name="prompt"
              placeholder="Enter a prompt for audio generation..."
              required
              disabled={isPending}
            />
          </div>
          <Button type="submit" className="w-full" disabled={isPending}>
            {isPending ? "Generating..." : "Generate Audio"}
          </Button>
        </form>

        {state.error && (
          <div className="mt-4 text-red-500 text-sm" role="alert">
            Error: {state.error}
          </div>
        )}

        {state.success && state.audioUrl && (
          <div className="mt-4">
            <h3 className="text-lg font-semibold mb-2">Generated Audio:</h3>
            <audio controls src={state.audioUrl} className="w-full">
              Your browser does not support the audio element.
            </audio>
            <p className="text-sm text-gray-500 mt-2">
              Audio URL:{" "}
              <a href={state.audioUrl} target="_blank" rel="noopener noreferrer" className="underline">
                {state.audioUrl}
              </a>
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
