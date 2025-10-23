"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Loader2, Upload, User } from "lucide-react"
import { useToast } from "@/hooks/use-toast"

interface CharacterAIDeepfakeProps {
  onCharacterGenerated: (characterUrl: string) => void
}

export function CharacterAIDeepfake({ onCharacterGenerated }: CharacterAIDeepfakeProps) {
  const [characterImage, setCharacterImage] = useState<File | null>(null)
  const [characterImagePreview, setCharacterImagePreview] = useState<string | null>(null)
  const [celebrityReference, setCelebrityReference] = useState("")
  const [characterStyle, setCharacterStyle] = useState("realistic")
  const [isGenerating, setIsGenerating] = useState(false)
  const [generatedCharacterUrl, setGeneratedCharacterUrl] = useState<string | null>(null)

  const { toast } = useToast()

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      setCharacterImage(file)
      const reader = new FileReader()
      reader.onload = () => {
        setCharacterImagePreview(reader.result as string)
      }
      reader.readAsDataURL(file)
    }
  }

  const handleGenerateCharacter = async () => {
    if (!characterImage && !celebrityReference) {
      toast({
        title: "Input Required",
        description: "Please upload an image or enter a celebrity reference.",
        variant: "destructive",
      })
      return
    }

    setIsGenerating(true)

    try {
      // Create form data for file upload
      const formData = new FormData()
      formData.append("characterStyle", characterStyle)
      formData.append("celebrityReference", celebrityReference)

      if (characterImage) {
        formData.append("characterImage", characterImage)
      }

      // In a real app, you would send this to your API
      // For now, we'll simulate a response after a delay
      setTimeout(() => {
        // Mock character URL
        const mockCharacterUrl = "/characters/sample-character.mp4"
        setGeneratedCharacterUrl(mockCharacterUrl)
        onCharacterGenerated(mockCharacterUrl)
        setIsGenerating(false)

        toast({
          title: "Character Generated!",
          description: "Your AI character is ready to use in your music video.",
        })
      }, 3000)
    } catch (error) {
      console.error("Error generating character:", error)
      toast({
        title: "Generation Failed",
        description: "There was an error generating your character. Please try again.",
        variant: "destructive",
      })
      setIsGenerating(false)
    }
  }

  return (
    <Card className="bg-gray-900 border-gray-800">
      <CardHeader>
        <CardTitle>AI Character Generator</CardTitle>
        <CardDescription className="text-gray-400">
          Create a realistic AI character or deepfake for your music video
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <label className="text-sm font-medium">Character Style</label>
          <Select value={characterStyle} onValueChange={setCharacterStyle}>
            <SelectTrigger className="bg-gray-800 border-gray-700">
              <SelectValue placeholder="Select character style" />
            </SelectTrigger>
            <SelectContent className="bg-gray-800 border-gray-700">
              <SelectItem value="realistic">Realistic</SelectItem>
              <SelectItem value="stylized">Stylized</SelectItem>
              <SelectItem value="anime">Anime</SelectItem>
              <SelectItem value="3d">3D Character</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <label className="text-sm font-medium">Celebrity Reference (Optional)</label>
          <Input
            placeholder="e.g., Taylor Swift, Drake, etc."
            value={celebrityReference}
            onChange={(e) => setCelebrityReference(e.target.value)}
            className="bg-gray-800 border-gray-700"
          />
          <p className="text-xs text-gray-500">Enter a celebrity name to create a deepfake character</p>
        </div>

        <div className="space-y-2">
          <label className="text-sm font-medium">Upload Face Image (Optional)</label>
          <div className="flex items-center justify-center border-2 border-dashed border-gray-700 rounded-lg p-6 bg-gray-800">
            {characterImagePreview ? (
              <div className="text-center">
                <img
                  src={characterImagePreview || "/placeholder.svg"}
                  alt="Character preview"
                  className="max-h-64 mx-auto mb-4 rounded"
                />
                <Button
                  variant="outline"
                  onClick={() => {
                    setCharacterImage(null)
                    setCharacterImagePreview(null)
                  }}
                  className="bg-gray-700"
                >
                  Remove Image
                </Button>
              </div>
            ) : (
              <div className="text-center">
                <User className="h-12 w-12 text-gray-500 mx-auto mb-2" />
                <p className="text-sm text-gray-400 mb-2">Upload a face image to create a custom character</p>
                <label className="cursor-pointer">
                  <Button variant="outline" className="bg-gray-700">
                    <Upload className="h-4 w-4 mr-2" />
                    Select Image
                  </Button>
                  <input type="file" accept="image/*" className="hidden" onChange={handleImageUpload} />
                </label>
              </div>
            )}
          </div>
        </div>

        {generatedCharacterUrl && (
          <div className="mt-4 p-4 bg-gray-800 rounded-lg">
            <h3 className="font-medium mb-2">Generated Character</h3>
            <video src={generatedCharacterUrl} autoPlay loop muted className="w-full rounded-lg" />
          </div>
        )}
      </CardContent>
      <CardFooter>
        <Button
          onClick={handleGenerateCharacter}
          disabled={isGenerating}
          className="w-full bg-purple-700 hover:bg-purple-600 text-white"
        >
          {isGenerating ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Generating Character...
            </>
          ) : (
            "Generate AI Character"
          )}
        </Button>
      </CardFooter>
    </Card>
  )
}
