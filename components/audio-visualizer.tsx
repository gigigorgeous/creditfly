"use client"

import { useEffect, useRef, useState } from "react"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Label } from "@/components/ui/label"

interface AudioVisualizerProps {
  audioUrl: string
}

type VisualizerMode = "bars" | "wave" | "circular"

export function AudioVisualizer({ audioUrl }: AudioVisualizerProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const audioContextRef = useRef<AudioContext | null>(null)
  const analyserRef = useRef<AnalyserNode | null>(null)
  const sourceRef = useRef<MediaElementAudioSourceNode | null>(null)
  const audioElementRef = useRef<HTMLAudioElement | null>(null)
  const animationFrameRef = useRef<number | null>(null)
  const [mode, setMode] = useState<VisualizerMode>("bars")
  const [isInitialized, setIsInitialized] = useState(false)

  useEffect(() => {
    return () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current)
      }
      if (audioContextRef.current) {
        audioContextRef.current.close()
      }
    }
  }, [])

  const initializeAudio = async () => {
    if (isInitialized || !audioUrl) return

    try {
      // Create audio element
      const audio = new Audio(audioUrl)
      audio.crossOrigin = "anonymous"
      audioElementRef.current = audio

      // Create audio context
      const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)()
      audioContextRef.current = audioContext

      // Create analyser
      const analyser = audioContext.createAnalyser()
      analyser.fftSize = 256
      analyserRef.current = analyser

      // Create source and connect
      const source = audioContext.createMediaElementSource(audio)
      sourceRef.current = source
      source.connect(analyser)
      analyser.connect(audioContext.destination)

      setIsInitialized(true)
      draw()
    } catch (error) {
      console.error("Error initializing audio visualizer:", error)
    }
  }

  const draw = () => {
    if (!canvasRef.current || !analyserRef.current) return

    const canvas = canvasRef.current
    const ctx = canvas.getContext("2d")
    if (!ctx) return

    const analyser = analyserRef.current
    const bufferLength = analyser.frequencyBinCount
    const dataArray = new Uint8Array(bufferLength)

    const drawFrame = () => {
      animationFrameRef.current = requestAnimationFrame(drawFrame)

      analyser.getByteFrequencyData(dataArray)

      ctx.fillStyle = "rgb(0, 0, 0)"
      ctx.fillRect(0, 0, canvas.width, canvas.height)

      if (mode === "bars") {
        drawBars(ctx, canvas, dataArray, bufferLength)
      } else if (mode === "wave") {
        drawWave(ctx, canvas, dataArray, bufferLength)
      } else if (mode === "circular") {
        drawCircular(ctx, canvas, dataArray, bufferLength)
      }
    }

    drawFrame()
  }

  const drawBars = (
    ctx: CanvasRenderingContext2D,
    canvas: HTMLCanvasElement,
    dataArray: Uint8Array,
    bufferLength: number,
  ) => {
    const barWidth = (canvas.width / bufferLength) * 2.5
    let x = 0

    for (let i = 0; i < bufferLength; i++) {
      const barHeight = (dataArray[i] / 255) * canvas.height * 0.8

      const gradient = ctx.createLinearGradient(0, canvas.height, 0, canvas.height - barHeight)
      gradient.addColorStop(0, "rgb(147, 51, 234)")
      gradient.addColorStop(0.5, "rgb(168, 85, 247)")
      gradient.addColorStop(1, "rgb(192, 132, 252)")

      ctx.fillStyle = gradient
      ctx.fillRect(x, canvas.height - barHeight, barWidth, barHeight)

      x += barWidth + 1
    }
  }

  const drawWave = (
    ctx: CanvasRenderingContext2D,
    canvas: HTMLCanvasElement,
    dataArray: Uint8Array,
    bufferLength: number,
  ) => {
    ctx.lineWidth = 2
    ctx.strokeStyle = "rgb(147, 51, 234)"
    ctx.beginPath()

    const sliceWidth = canvas.width / bufferLength
    let x = 0

    for (let i = 0; i < bufferLength; i++) {
      const v = dataArray[i] / 128.0
      const y = (v * canvas.height) / 2

      if (i === 0) {
        ctx.moveTo(x, y)
      } else {
        ctx.lineTo(x, y)
      }

      x += sliceWidth
    }

    ctx.lineTo(canvas.width, canvas.height / 2)
    ctx.stroke()
  }

  const drawCircular = (
    ctx: CanvasRenderingContext2D,
    canvas: HTMLCanvasElement,
    dataArray: Uint8Array,
    bufferLength: number,
  ) => {
    const centerX = canvas.width / 2
    const centerY = canvas.height / 2
    const radius = Math.min(canvas.width, canvas.height) / 4

    for (let i = 0; i < bufferLength; i++) {
      const barHeight = (dataArray[i] / 255) * 100
      const angle = (i / bufferLength) * Math.PI * 2

      const x1 = centerX + Math.cos(angle) * radius
      const y1 = centerY + Math.sin(angle) * radius
      const x2 = centerX + Math.cos(angle) * (radius + barHeight)
      const y2 = centerY + Math.sin(angle) * (radius + barHeight)

      const gradient = ctx.createLinearGradient(x1, y1, x2, y2)
      gradient.addColorStop(0, "rgb(147, 51, 234)")
      gradient.addColorStop(1, "rgb(192, 132, 252)")

      ctx.strokeStyle = gradient
      ctx.lineWidth = 3
      ctx.beginPath()
      ctx.moveTo(x1, y1)
      ctx.lineTo(x2, y2)
      ctx.stroke()
    }
  }

  useEffect(() => {
    if (isInitialized) {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current)
      }
      draw()
    }
  }, [mode, isInitialized])

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <Label className="text-gray-300">Visualizer Mode</Label>
        <Select value={mode} onValueChange={(value: VisualizerMode) => setMode(value)}>
          <SelectTrigger className="w-[180px] bg-purple-950/50 border-purple-500/30 text-white">
            <SelectValue />
          </SelectTrigger>
          <SelectContent className="bg-purple-950 border-purple-500/30">
            <SelectItem value="bars" className="text-white">
              Bars
            </SelectItem>
            <SelectItem value="wave" className="text-white">
              Wave
            </SelectItem>
            <SelectItem value="circular" className="text-white">
              Circular
            </SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div
        className="relative rounded-lg overflow-hidden bg-black border border-purple-500/30 cursor-pointer"
        onClick={initializeAudio}
      >
        <canvas ref={canvasRef} width={800} height={200} className="w-full h-[200px]" />
        {!isInitialized && (
          <div className="absolute inset-0 flex items-center justify-center bg-black/50 backdrop-blur-sm">
            <p className="text-purple-300 text-sm">Click to activate visualizer</p>
          </div>
        )}
      </div>
    </div>
  )
}
