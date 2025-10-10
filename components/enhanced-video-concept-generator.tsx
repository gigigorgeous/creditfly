"use client"

import * as React from "react"
import { Textarea } from "@/components/ui/textarea"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Video, Copy, RefreshCw, Download, Camera } from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import { Badge } from "@/components/ui/badge"

export function EnhancedVideoConceptGenerator() {
  const [prompt, setPrompt] = React.useState("")
  const [selectedStyle, setSelectedStyle] = React.useState<string>("")
  const [selectedDuration, setSelectedDuration] = React.useState<string>("")
  const [selectedBudget, setSelectedBudget] = React.useState<string>("")
  const [concept, setConcept] = React.useState("")
  const [isLoading, setIsLoading] = React.useState(false)
  const [error, setError] = React.useState<string | null>(null)
  const { toast } = useToast()

  const styles = [
    "Cinematic",
    "Animated",
    "Performance",
    "Narrative",
    "Abstract",
    "Documentary",
    "Retro",
    "Futuristic",
    "Minimalist",
    "Surreal",
  ]

  const durations = ["30 seconds", "1 minute", "2-3 minutes", "3-4 minutes", "4+ minutes"]
  const budgets = ["Low Budget", "Medium Budget", "High Budget", "No Budget Constraints"]

  const handleGenerateConcept = async () => {
    setIsLoading(true)
    setError(null)
    setConcept("")

    try {
      const response = await fetch("/api/generate-video-concept", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          prompt,
          style: selectedStyle,
          duration: selectedDuration,
          budget: selectedBudget,
        }),
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || "Failed to generate video concept")
      }

      const data = await response.json()
      setConcept(data.concept)

      toast({
        title: "Video Concept Generated!",
        description: "Your music video concept is ready.",
      })
    } catch (err: any) {
      setError(err.message)
      toast({
        title: "Error generating video concept",
        description: err.message,
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  const copyToClipboard = () => {
    navigator.clipboard.writeText(concept)
    toast({
      title: "Concept Copied!",
      description: "The generated video concept has been copied to your clipboard.",
    })
  }

  const downloadConcept = () => {
    const blob = new Blob([concept], { type: "text/plain" })
    const url = URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url
    a.download = "video-concept.txt"
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)

    toast({
      title: "Concept Downloaded!",
      description: "Your video concept has been saved as a text file.",
    })
  }

  return (
    <Card className="w-full max-w-4xl mx-auto bg-gray-800 text-gray-50 border-gray-700">
      <CardHeader>
        <CardTitle className="text-2xl font-bold flex items-center gap-2">
          <Video className="w-6 h-6 text-purple-400" />
          Enhanced AI Video Concept Generator
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Main Prompt */}
        <div>
          <label htmlFor="video-prompt" className="block text-sm font-medium text-gray-300 mb-2">
            Describe your song or video idea:
          </label>
          <Textarea
            id="video-prompt"
            placeholder="e.g., A futuristic city at night with neon lights, a journey through different dimensions, a dance-off in an abandoned warehouse, an emotional story about lost love"
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            className="bg-gray-900 border-gray-700 text-gray-50 placeholder:text-gray-500 focus-visible:ring-purple-500"
            rows={3}
            disabled={isLoading}
          />
        </div>

        {/* Style Selection */}
        <div>
          <label className="block text-sm font-medium text-gray-300 mb-2">Visual Style (Optional):</label>
          <div className="flex flex-wrap gap-2">
            {styles.map((style) => (
              <Badge
                key={style}
                variant={selectedStyle === style ? "default" : "outline"}
                className={`cursor-pointer ${
                  selectedStyle === style ? "bg-purple-600 text-white" : "bg-gray-700 text-gray-300 hover:bg-gray-600"
                }`}
                onClick={() => setSelectedStyle(selectedStyle === style ? "" : style)}
              >
                {style}
              </Badge>
            ))}
          </div>
        </div>

        {/* Duration and Budget */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">Duration:</label>
            <Select value={selectedDuration} onValueChange={setSelectedDuration} disabled={isLoading}>
              <SelectTrigger className="bg-gray-900 border-gray-700 text-gray-50">
                <SelectValue placeholder="Select duration" />
              </SelectTrigger>
              <SelectContent className="bg-gray-800 border-gray-700 text-gray-50">
                {durations.map((duration) => (
                  <SelectItem key={duration} value={duration}>
                    {duration}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">Budget Level:</label>
            <Select value={selectedBudget} onValueChange={setSelectedBudget} disabled={isLoading}>
              <SelectTrigger className="bg-gray-900 border-gray-700 text-gray-50">
                <SelectValue placeholder="Select budget" />
              </SelectTrigger>
              <SelectContent className="bg-gray-800 border-gray-700 text-gray-50">
                {budgets.map((budget) => (
                  <SelectItem key={budget} value={budget}>
                    {budget}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Generate Button */}
        <Button
          onClick={handleGenerateConcept}
          disabled={isLoading || !prompt.trim()}
          className="w-full bg-gradient-to-r from-purple-600 to-blue-500 hover:from-purple-700 hover:to-blue-600 text-white"
        >
          {isLoading ? (
            <>
              <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
              Generating Video Concept...
            </>
          ) : (
            <>
              <Camera className="mr-2 h-4 w-4" />
              Generate Video Concept
            </>
          )}
        </Button>

        {/* Error Display */}
        {error && (
          <div className="p-4 bg-red-900/20 border border-red-700 rounded-lg">
            <p className="text-red-400 text-sm">{error}</p>
          </div>
        )}

        {/* Generated Concept */}
        {concept && (
          <div className="relative p-6 bg-gray-900 rounded-lg border border-gray-700">
            <div className="flex justify-between items-center mb-4">
              <h3 className="font-semibold text-lg text-purple-300">Generated Video Concept:</h3>
              <div className="flex gap-2">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={copyToClipboard}
                  className="text-gray-400 hover:text-gray-50"
                >
                  <Copy className="w-4 h-4 mr-1" />
                  Copy
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={downloadConcept}
                  className="text-gray-400 hover:text-gray-50"
                >
                  <Download className="w-4 h-4 mr-1" />
                  Download
                </Button>
              </div>
            </div>
            <pre className="whitespace-pre-wrap text-sm text-gray-200 font-mono max-h-96 overflow-y-auto leading-relaxed">
              {concept}
            </pre>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
