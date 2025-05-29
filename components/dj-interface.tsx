"use client"

import { useState, useRef, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Slider } from "@/components/ui/slider"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Card, CardContent } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Play, Pause, SkipForward, SkipBack, Volume2, Disc, AudioWaveformIcon as Waveform, Mic2 } from "lucide-react"

export function DjInterface() {
  const [isPlaying, setIsPlaying] = useState(false)
  const [activeTab, setActiveTab] = useState("fx")
  const canvasRef = useRef<HTMLCanvasElement>(null)

  // Simulate audio visualization
  useEffect(() => {
    if (!canvasRef.current) return

    const canvas = canvasRef.current
    const ctx = canvas.getContext("2d")
    if (!ctx) return

    let animationFrameId: number
    let hue = 0

    const render = () => {
      if (!ctx) return

      // Clear canvas
      ctx.clearRect(0, 0, canvas.width, canvas.height)

      // Only animate if "playing"
      if (isPlaying) {
        const centerX = canvas.width / 2
        const centerY = canvas.height / 2
        const maxRadius = Math.min(centerX, centerY) - 10

        // Draw circular waveform
        ctx.beginPath()
        ctx.arc(centerX, centerY, maxRadius, 0, 2 * Math.PI)
        ctx.strokeStyle = `hsl(${hue}, 70%, 60%)`
        ctx.lineWidth = 3
        ctx.stroke()

        // Draw animated bars
        const barCount = 40
        const angleStep = (2 * Math.PI) / barCount

        for (let i = 0; i < barCount; i++) {
          const angle = i * angleStep
          // Random height for visualization
          const height = Math.random() * 30 + 10

          const innerRadius = maxRadius - 40
          const outerRadius = innerRadius + height

          const startX = centerX + innerRadius * Math.cos(angle)
          const startY = centerY + innerRadius * Math.sin(angle)
          const endX = centerX + outerRadius * Math.cos(angle)
          const endY = centerY + outerRadius * Math.sin(angle)

          ctx.beginPath()
          ctx.moveTo(startX, startY)
          ctx.lineTo(endX, endY)
          ctx.strokeStyle = `hsl(${(hue + i * 5) % 360}, 70%, 60%)`
          ctx.lineWidth = 4
          ctx.stroke()
        }

        hue = (hue + 1) % 360
      } else {
        // Static circle when not playing
        const centerX = canvas.width / 2
        const centerY = canvas.height / 2
        const radius = Math.min(centerX, centerY) - 10

        ctx.beginPath()
        ctx.arc(centerX, centerY, radius, 0, 2 * Math.PI)
        ctx.strokeStyle = "#666"
        ctx.lineWidth = 3
        ctx.stroke()
      }

      animationFrameId = requestAnimationFrame(render)
    }

    render()

    return () => {
      cancelAnimationFrame(animationFrameId)
    }
  }, [isPlaying])

  const togglePlayback = () => {
    setIsPlaying(!isPlaying)
  }

  return (
    <Card className="border-primary/10 bg-primary/5">
      <CardContent className="p-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Left Deck */}
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <div>
                <h3 className="font-medium">Deck A</h3>
                <p className="text-sm text-muted-foreground">128 BPM</p>
              </div>
              <div className="flex gap-2">
                <Button variant="ghost" size="icon" className="h-8 w-8">
                  <SkipBack className="h-4 w-4" />
                </Button>
                <Button variant="ghost" size="icon" className="h-8 w-8" onClick={togglePlayback}>
                  {isPlaying ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4" />}
                </Button>
                <Button variant="ghost" size="icon" className="h-8 w-8">
                  <SkipForward className="h-4 w-4" />
                </Button>
              </div>
            </div>

            <div className="relative">
              <canvas
                ref={canvasRef}
                width={200}
                height={200}
                className="w-full aspect-square rounded-full border-4 border-primary/20"
              />
              <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                <Disc
                  className={`h-16 w-16 text-primary/60 ${isPlaying ? "animate-spin" : ""}`}
                  style={{ animationDuration: "3s" }}
                />
              </div>
            </div>

            <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
              <TabsList className="grid w-full grid-cols-4">
                <TabsTrigger value="fx">FX</TabsTrigger>
                <TabsTrigger value="eq">EQ</TabsTrigger>
                <TabsTrigger value="loop">Loop</TabsTrigger>
                <TabsTrigger value="cue">Cue</TabsTrigger>
              </TabsList>

              <TabsContent value="fx" className="mt-2">
                <div className="grid grid-cols-2 gap-2">
                  <Button variant="outline" size="sm">
                    Reverb
                  </Button>
                  <Button variant="outline" size="sm">
                    Delay
                  </Button>
                  <Button variant="outline" size="sm">
                    Filter
                  </Button>
                  <Button variant="outline" size="sm">
                    Flanger
                  </Button>
                </div>
              </TabsContent>

              <TabsContent value="eq" className="mt-2">
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <span className="text-xs w-8">High</span>
                    <Slider defaultValue={[50]} max={100} step={1} />
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs w-8">Mid</span>
                    <Slider defaultValue={[50]} max={100} step={1} />
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs w-8">Low</span>
                    <Slider defaultValue={[50]} max={100} step={1} />
                  </div>
                </div>
              </TabsContent>

              <TabsContent value="loop" className="mt-2">
                <div className="grid grid-cols-2 gap-2">
                  <Button variant="outline" size="sm">
                    1/4
                  </Button>
                  <Button variant="outline" size="sm">
                    1/2
                  </Button>
                  <Button variant="outline" size="sm">
                    1
                  </Button>
                  <Button variant="outline" size="sm">
                    2
                  </Button>
                </div>
              </TabsContent>

              <TabsContent value="cue" className="mt-2">
                <div className="grid grid-cols-3 gap-2">
                  <Button variant="outline" size="sm">
                    Cue 1
                  </Button>
                  <Button variant="outline" size="sm">
                    Cue 2
                  </Button>
                  <Button variant="outline" size="sm">
                    Cue 3
                  </Button>
                </div>
              </TabsContent>
            </Tabs>
          </div>

          {/* Center Controls */}
          <div className="flex flex-col justify-between">
            <div className="space-y-4">
              <div className="bg-black/20 rounded-md p-3">
                <div className="flex justify-between items-center mb-2">
                  <span className="text-xs text-muted-foreground">MASTER OUTPUT</span>
                  <span className="text-xs font-medium">-3.2 dB</span>
                </div>
                <div className="h-24 bg-black/30 rounded relative overflow-hidden">
                  <div className="absolute inset-0 flex items-center justify-center">
                    <Waveform className="h-12 w-12 text-primary/30" />
                  </div>
                  {isPlaying && (
                    <div className="absolute inset-0">
                      <div className="h-full w-full flex items-end">
                        {Array.from({ length: 30 }).map((_, i) => (
                          <div
                            key={i}
                            className="flex-1 bg-primary/60"
                            style={{
                              height: `${Math.random() * 70 + 10}%`,
                              marginLeft: "1px",
                              marginRight: "1px",
                            }}
                          />
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>

              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs">BPM</span>
                  <span className="text-xs font-medium">128</span>
                </div>
                <Slider defaultValue={[128]} min={60} max={200} step={1} />
              </div>

              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs">Crossfader</span>
                </div>
                <Slider defaultValue={[50]} max={100} step={1} />
              </div>
            </div>

            <div className="space-y-2 mt-4">
              <div className="flex items-center gap-2">
                <Volume2 className="h-4 w-4" />
                <Slider defaultValue={[80]} max={100} step={1} />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <Button variant="default" size="sm" className="w-full">
                  <Mic2 className="h-4 w-4 mr-2" />
                  <span>Voice</span>
                </Button>
                <Select>
                  <SelectTrigger className="h-9">
                    <SelectValue placeholder="Genre" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="pop">Pop</SelectItem>
                    <SelectItem value="hiphop">Hip-Hop</SelectItem>
                    <SelectItem value="rock">Rock</SelectItem>
                    <SelectItem value="electronic">Electronic</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>

          {/* Right Deck - Simplified for mobile view */}
          <div className="space-y-4 hidden md:block">
            <div className="flex justify-between items-center">
              <div>
                <h3 className="font-medium">Deck B</h3>
                <p className="text-sm text-muted-foreground">125 BPM</p>
              </div>
              <div className="flex gap-2">
                <Button variant="ghost" size="icon" className="h-8 w-8">
                  <SkipBack className="h-4 w-4" />
                </Button>
                <Button variant="ghost" size="icon" className="h-8 w-8">
                  <Play className="h-4 w-4" />
                </Button>
                <Button variant="ghost" size="icon" className="h-8 w-8">
                  <SkipForward className="h-4 w-4" />
                </Button>
              </div>
            </div>

            <div className="relative">
              <div className="w-full aspect-square rounded-full border-4 border-primary/20 flex items-center justify-center">
                <Disc className="h-16 w-16 text-primary/60" />
              </div>
            </div>

            <Tabs defaultValue="fx" className="w-full">
              <TabsList className="grid w-full grid-cols-4">
                <TabsTrigger value="fx">FX</TabsTrigger>
                <TabsTrigger value="eq">EQ</TabsTrigger>
                <TabsTrigger value="loop">Loop</TabsTrigger>
                <TabsTrigger value="cue">Cue</TabsTrigger>
              </TabsList>

              <TabsContent value="fx" className="mt-2">
                <div className="grid grid-cols-2 gap-2">
                  <Button variant="outline" size="sm">
                    Reverb
                  </Button>
                  <Button variant="outline" size="sm">
                    Delay
                  </Button>
                  <Button variant="outline" size="sm">
                    Filter
                  </Button>
                  <Button variant="outline" size="sm">
                    Flanger
                  </Button>
                </div>
              </TabsContent>
            </Tabs>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
