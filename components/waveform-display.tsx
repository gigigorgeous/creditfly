"use client"

import type React from "react"
import { useRef, useEffect } from "react"

interface WaveformDisplayProps {
  audioElement: HTMLAudioElement | null
}

export const WaveformDisplay: React.FC<WaveformDisplayProps> = ({ audioElement }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const animationFrameId = useRef<number | null>(null)
  const audioContextRef = useRef<AudioContext | null>(null)
  const analyserRef = useRef<AnalyserNode | null>(null)
  const sourceNodeRef = useRef<MediaElementAudioSourceNode | null>(null)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas || !audioElement) return

    const ctx = canvas.getContext("2d")
    if (!ctx) return

    // Initialize AudioContext and AnalyserNode
    if (!audioContextRef.current) {
      audioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)()
    }
    const audioContext = audioContextRef.current

    if (!analyserRef.current) {
      analyserRef.current = audioContext.createAnalyser()
      analyserRef.current.fftSize = 2048 // Number of samples for FFT
    }
    const analyser = analyserRef.current

    // Connect audio element to analyser
    if (!sourceNodeRef.current) {
      sourceNodeRef.current = audioContext.createMediaElementSource(audioElement)
      sourceNodeRef.current.connect(analyser)
      analyser.connect(audioContext.destination) // Connect analyser to speakers
    }

    const bufferLength = analyser.frequencyBinCount // Half of fftSize
    const dataArray = new Uint8Array(bufferLength)

    const draw = () => {
      if (!ctx || !canvas) return

      // Clear canvas
      ctx.clearRect(0, 0, canvas.width, canvas.height)

      // Get time domain data
      analyser.getByteTimeDomainData(dataArray)

      ctx.lineWidth = 2
      ctx.strokeStyle = "hsl(var(--primary))" // Using shadcn primary color
      ctx.beginPath()

      const sliceWidth = (canvas.width * 1.0) / bufferLength
      let x = 0

      for (let i = 0; i < bufferLength; i++) {
        const v = dataArray[i] / 128.0 // Normalize to 0-2
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

      animationFrameId.current = requestAnimationFrame(draw)
    }

    // Start drawing only if audio context is running
    if (audioContext.state === "running") {
      draw()
    } else {
      // Resume context on user interaction if suspended
      const resumeContext = () => {
        if (audioContext.state === "suspended") {
          audioContext.resume().then(() => {
            console.log("AudioContext resumed!")
            draw()
          })
        } else {
          draw()
        }
        document.removeEventListener("click", resumeContext)
        document.removeEventListener("keydown", resumeContext)
      }
      document.addEventListener("click", resumeContext)
      document.addEventListener("keydown", resumeContext)
    }

    // Cleanup function
    return () => {
      if (animationFrameId.current) {
        cancelAnimationFrame(animationFrameId.current)
      }
      // Do not close AudioContext here if it's shared or might be reused
      // SourceNode and AnalyserNode will be garbage collected if not referenced
    }
  }, [audioElement]) // Re-run effect if audioElement changes

  // Handle canvas resizing
  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    const setCanvasDimensions = () => {
      canvas.width = canvas.offsetWidth
      canvas.height = canvas.offsetHeight
    }

    setCanvasDimensions()
    window.addEventListener("resize", setCanvasDimensions)

    return () => {
      window.removeEventListener("resize", setCanvasDimensions)
    }
  }, [])

  return (
    <div className="relative w-full h-24 bg-gray-900 rounded-md overflow-hidden">
      <canvas ref={canvasRef} className="absolute inset-0 w-full h-full"></canvas>
      {!audioElement && (
        <div className="absolute inset-0 flex items-center justify-center text-gray-500 text-sm">
          Load a track to see waveform
        </div>
      )}
    </div>
  )
}
