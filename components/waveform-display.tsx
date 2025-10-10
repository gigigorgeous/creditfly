"use client"

import type React from "react"
import { useRef, useEffect, useState } from "react"

interface WaveformDisplayProps {
  audioElement: HTMLAudioElement | null
}

export const WaveformDisplay: React.FC<WaveformDisplayProps> = ({ audioElement }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const animationFrameId = useRef<number | null>(null)
  const audioContextRef = useRef<AudioContext | null>(null)
  const analyserRef = useRef<AnalyserNode | null>(null)
  const sourceNodeRef = useRef<MediaElementAudioSourceNode | null>(null)
  const [isVisualizationActive, setIsVisualizationActive] = useState(false)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    const ctx = canvas.getContext("2d")
    if (!ctx) return

    // Mock waveform animation when no audio is available
    const drawMockWaveform = () => {
      if (!ctx || !canvas) return

      ctx.clearRect(0, 0, canvas.width, canvas.height)
      ctx.lineWidth = 2
      ctx.strokeStyle = "rgb(168, 85, 247)"
      ctx.beginPath()

      const time = Date.now() * 0.001
      const amplitude = 30
      const frequency = 0.02

      for (let x = 0; x < canvas.width; x += 2) {
        const y = canvas.height / 2 + Math.sin(x * frequency + time) * amplitude * Math.random()
        if (x === 0) {
          ctx.moveTo(x, y)
        } else {
          ctx.lineTo(x, y)
        }
      }

      ctx.stroke()
      animationFrameId.current = requestAnimationFrame(drawMockWaveform)
    }

    // Real audio visualization
    const drawRealWaveform = () => {
      if (!ctx || !canvas || !analyserRef.current) return

      const bufferLength = analyserRef.current.frequencyBinCount
      const dataArray = new Uint8Array(bufferLength)

      ctx.clearRect(0, 0, canvas.width, canvas.height)
      analyserRef.current.getByteTimeDomainData(dataArray)

      ctx.lineWidth = 2
      ctx.strokeStyle = "rgb(168, 85, 247)"
      ctx.beginPath()

      const sliceWidth = (canvas.width * 1.0) / bufferLength
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

      animationFrameId.current = requestAnimationFrame(drawRealWaveform)
    }

    if (audioElement && !isVisualizationActive) {
      try {
        if (!audioContextRef.current) {
          audioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)()
        }
        const audioContext = audioContextRef.current

        if (!analyserRef.current) {
          analyserRef.current = audioContext.createAnalyser()
          analyserRef.current.fftSize = 2048
        }

        if (!sourceNodeRef.current) {
          sourceNodeRef.current = audioContext.createMediaElementSource(audioElement)
          sourceNodeRef.current.connect(analyserRef.current)
          analyserRef.current.connect(audioContext.destination)
        }

        setIsVisualizationActive(true)

        if (audioContext.state === "running") {
          drawRealWaveform()
        } else {
          const resumeContext = () => {
            if (audioContext.state === "suspended") {
              audioContext.resume().then(() => {
                drawRealWaveform()
              })
            } else {
              drawRealWaveform()
            }
            document.removeEventListener("click", resumeContext)
          }
          document.addEventListener("click", resumeContext)
        }
      } catch (error) {
        console.log("Audio visualization failed, using mock waveform")
        drawMockWaveform()
      }
    } else {
      drawMockWaveform()
    }

    return () => {
      if (animationFrameId.current) {
        cancelAnimationFrame(animationFrameId.current)
      }
    }
  }, [audioElement, isVisualizationActive])

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
    <div className="relative w-full h-32 bg-gray-900 rounded-lg overflow-hidden border border-gray-700">
      <canvas ref={canvasRef} className="absolute inset-0 w-full h-full"></canvas>
      <div className="absolute inset-0 flex items-center justify-center text-gray-500 text-sm pointer-events-none">
        {!audioElement && "Audio Waveform Visualization"}
      </div>
    </div>
  )
}
