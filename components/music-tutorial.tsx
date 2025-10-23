"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { X, ChevronLeft, ChevronRight, Music, Wand2, Settings, Play, Video, Share2 } from "lucide-react"

interface MusicTutorialProps {
  onClose: () => void
}

const tutorialSteps = [
  {
    title: "Welcome to AI Music Studio",
    description: "Create professional music with AI in minutes. This quick tutorial will show you how to get started.",
    icon: Music,
    color: "text-purple-400",
  },
  {
    title: "Choose Your Style",
    description:
      "Select from 50+ genres and 20+ moods. You can pick multiple genres to create unique fusion styles. Try combining genres like 'Jazz' and 'Electronic' for something new!",
    icon: Wand2,
    color: "text-blue-400",
  },
  {
    title: "Describe Your Music",
    description:
      "Write a prompt describing the music you want. Be specific! For example: 'Upbeat summer pop song with catchy hooks and beach vibes'. You can also add custom lyrics if you want vocals.",
    icon: Settings,
    color: "text-green-400",
  },
  {
    title: "Adjust Advanced Settings",
    description:
      "Fine-tune your music with tempo (BPM), duration, instruments, and more. Toggle instrumental mode if you want music without vocals.",
    icon: Settings,
    color: "text-yellow-400",
  },
  {
    title: "Generate and Preview",
    description:
      "Click 'Generate Music' and wait for your track to be created. You'll see a progress indicator. Once complete, you can play it with the audio player and visualizer.",
    icon: Play,
    color: "text-pink-400",
  },
  {
    title: "Create Music Videos",
    description:
      "Enable the video generator to create stunning music videos for your tracks. Choose from multiple visual styles like Cinematic, Anime, or Cyberpunk. You can even add face-swapping effects!",
    icon: Video,
    color: "text-red-400",
  },
  {
    title: "Share Your Creations",
    description:
      "Download your music and videos, or share them directly. All your creations are saved in your library for easy access.",
    icon: Share2,
    color: "text-cyan-400",
  },
]

export function MusicTutorial({ onClose }: MusicTutorialProps) {
  const [currentStep, setCurrentStep] = useState(0)

  const handleNext = () => {
    if (currentStep < tutorialSteps.length - 1) {
      setCurrentStep(currentStep + 1)
    } else {
      onClose()
    }
  }

  const handlePrev = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1)
    }
  }

  const currentTutorial = tutorialSteps[currentStep]
  const Icon = currentTutorial.icon

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
      <Card className="w-full max-w-2xl border-purple-500/30 bg-black/90 backdrop-blur-md">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className={`p-3 rounded-full bg-purple-950/50 ${currentTutorial.color}`}>
                <Icon className="h-6 w-6" />
              </div>
              <div>
                <CardTitle className="text-white">{currentTutorial.title}</CardTitle>
                <CardDescription className="text-gray-400">
                  Step {currentStep + 1} of {tutorialSteps.length}
                </CardDescription>
              </div>
            </div>
            <Button variant="ghost" size="icon" onClick={onClose} className="text-gray-400 hover:text-white">
              <X className="h-5 w-5" />
            </Button>
          </div>
        </CardHeader>
        <CardContent className="space-y-6">
          <p className="text-gray-300 text-lg leading-relaxed">{currentTutorial.description}</p>

          {/* Progress indicator */}
          <div className="flex items-center space-x-2">
            {tutorialSteps.map((_, index) => (
              <div
                key={index}
                className={`h-2 flex-1 rounded-full transition-all ${
                  index === currentStep ? "bg-purple-500" : index < currentStep ? "bg-purple-700" : "bg-gray-700"
                }`}
              />
            ))}
          </div>

          {/* Navigation buttons */}
          <div className="flex items-center justify-between pt-4">
            <Button
              variant="outline"
              onClick={handlePrev}
              disabled={currentStep === 0}
              className="border-purple-500/50 text-purple-300 bg-transparent hover:bg-purple-500/20"
            >
              <ChevronLeft className="h-4 w-4 mr-2" />
              Previous
            </Button>

            <div className="flex items-center space-x-2">
              {tutorialSteps.map((_, index) => (
                <button
                  key={index}
                  onClick={() => setCurrentStep(index)}
                  className={`h-2 w-2 rounded-full transition-all ${
                    index === currentStep ? "bg-purple-500 w-8" : "bg-gray-600 hover:bg-gray-500"
                  }`}
                  aria-label={`Go to step ${index + 1}`}
                />
              ))}
            </div>

            <Button
              onClick={handleNext}
              className="bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700"
            >
              {currentStep === tutorialSteps.length - 1 ? (
                "Get Started"
              ) : (
                <>
                  Next
                  <ChevronRight className="h-4 w-4 ml-2" />
                </>
              )}
            </Button>
          </div>

          {/* Tips section */}
          {currentStep === 2 && (
            <div className="bg-blue-950/30 border border-blue-600/30 p-4 rounded-lg">
              <p className="text-sm font-semibold text-blue-400 mb-2">💡 Pro Tips:</p>
              <ul className="text-xs text-blue-300 space-y-1 list-disc list-inside">
                <li>Be specific about the mood and energy level you want</li>
                <li>Mention specific instruments if you have preferences</li>
                <li>Add context like "for a workout playlist" or "relaxing evening music"</li>
                <li>Use descriptive adjectives: energetic, mellow, intense, dreamy, etc.</li>
              </ul>
            </div>
          )}

          {currentStep === 5 && (
            <div className="bg-yellow-950/30 border border-yellow-600/30 p-4 rounded-lg">
              <p className="text-sm font-semibold text-yellow-400 mb-2">⚠️ Important Note:</p>
              <p className="text-xs text-yellow-300">
                When using face-swapping features, always obtain consent from the person whose likeness you're using.
                Clearly label all AI-generated content as synthetic when sharing online. Use this technology responsibly
                and ethically.
              </p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
