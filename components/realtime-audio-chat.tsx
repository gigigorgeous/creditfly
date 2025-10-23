"use client"

import { useState, useEffect, useRef } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Mic, MicOff, Loader2 } from "lucide-react"
import { useToast } from "@/hooks/use-toast"

export function RealtimeAudioChat() {
  const [isConnecting, setIsConnecting] = useState(false)
  const [isConnected, setIsConnected] = useState(false)
  const [isMicActive, setIsMicActive] = useState(false)
  const [transcript, setTranscript] = useState<string[]>([])

  const peerConnectionRef = useRef<RTCPeerConnection | null>(null)
  const dataChannelRef = useRef<RTCDataChannel | null>(null)
  const audioElementRef = useRef<HTMLAudioElement | null>(null)
  const mediaStreamRef = useRef<MediaStream | null>(null)

  const { toast } = useToast()

  const initializeConnection = async () => {
    try {
      setIsConnecting(true)

      // Get session token from our API
      const tokenResponse = await fetch("/api/realtime-session")
      if (!tokenResponse.ok) {
        throw new Error("Failed to get session token")
      }

      const data = await tokenResponse.json()
      const ephemeralKey = data.client_secret?.value

      if (!ephemeralKey) {
        throw new Error("No ephemeral key received")
      }

      // Create a peer connection
      const pc = new RTCPeerConnection()
      peerConnectionRef.current = pc

      // Set up audio element if it doesn't exist
      if (!audioElementRef.current) {
        const audioEl = new Audio()
        audioEl.autoplay = true
        audioElementRef.current = audioEl
      }

      // Set up to play remote audio from the model
      pc.ontrack = (e) => {
        if (audioElementRef.current) {
          audioElementRef.current.srcObject = e.streams[0]
        }
      }

      // Set up data channel for sending and receiving events
      const dc = pc.createDataChannel("oai-events")
      dataChannelRef.current = dc

      dc.addEventListener("message", (e) => {
        try {
          const data = JSON.parse(e.data)
          if (data.type === "transcript") {
            setTranscript((prev) => [...prev, `You: ${data.text}`])
          } else if (data.type === "assistant_response") {
            setTranscript((prev) => [...prev, `AI: ${data.text}`])
          }
          console.log("Received data:", data)
        } catch (error) {
          console.error("Error parsing data channel message:", error)
        }
      })

      // Start the session using the Session Description Protocol (SDP)
      const offer = await pc.createOffer()
      await pc.setLocalDescription(offer)

      const baseUrl = "https://api.openai.com/v1/realtime"
      const model = "gpt-4o-realtime-preview-2024-12-17"

      const sdpResponse = await fetch(`${baseUrl}?model=${model}`, {
        method: "POST",
        body: offer.sdp,
        headers: {
          Authorization: `Bearer ${ephemeralKey}`,
          "Content-Type": "application/sdp",
          "OpenAI-Beta": "realtime=v1",
        },
      })

      if (!sdpResponse.ok) {
        throw new Error(`SDP response error: ${sdpResponse.status}`)
      }

      const answer = {
        type: "answer",
        sdp: await sdpResponse.text(),
      }

      await pc.setRemoteDescription(answer as RTCSessionDescriptionInit)
      setIsConnected(true)

      toast({
        title: "Connected!",
        description: "You're now connected to the AI assistant. Click the microphone to start speaking.",
      })
    } catch (error) {
      console.error("Error initializing connection:", error)
      toast({
        title: "Connection Failed",
        description: error instanceof Error ? error.message : "Failed to connect to the AI assistant",
        variant: "destructive",
      })
    } finally {
      setIsConnecting(false)
    }
  }

  const toggleMicrophone = async () => {
    if (isMicActive) {
      // Turn off microphone
      if (mediaStreamRef.current) {
        mediaStreamRef.current.getTracks().forEach((track) => track.stop())
        mediaStreamRef.current = null
      }
      setIsMicActive(false)
    } else {
      // Turn on microphone
      try {
        if (!peerConnectionRef.current) {
          toast({
            title: "Not Connected",
            description: "Please connect to the AI assistant first",
            variant: "destructive",
          })
          return
        }

        const ms = await navigator.mediaDevices.getUserMedia({
          audio: true,
        })

        mediaStreamRef.current = ms

        // Add local audio track for microphone input
        ms.getTracks().forEach((track) => {
          if (peerConnectionRef.current) {
            peerConnectionRef.current.addTrack(track, ms)
          }
        })

        setIsMicActive(true)

        toast({
          title: "Microphone Active",
          description: "The AI assistant can now hear you",
        })
      } catch (error) {
        console.error("Error accessing microphone:", error)
        toast({
          title: "Microphone Error",
          description: "Failed to access your microphone",
          variant: "destructive",
        })
      }
    }
  }

  const disconnectSession = () => {
    // Clean up resources
    if (mediaStreamRef.current) {
      mediaStreamRef.current.getTracks().forEach((track) => track.stop())
      mediaStreamRef.current = null
    }

    if (dataChannelRef.current) {
      dataChannelRef.current.close()
      dataChannelRef.current = null
    }

    if (peerConnectionRef.current) {
      peerConnectionRef.current.close()
      peerConnectionRef.current = null
    }

    if (audioElementRef.current) {
      audioElementRef.current.srcObject = null
    }

    setIsConnected(false)
    setIsMicActive(false)
    setTranscript([])
  }

  // Clean up on component unmount
  useEffect(() => {
    return () => {
      disconnectSession()
    }
  }, [])

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle>Realtime AI Voice Chat</CardTitle>
        <CardDescription>Have a conversation with an AI assistant in real-time</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex justify-center mb-4">
          {!isConnected ? (
            <Button onClick={initializeConnection} disabled={isConnecting} className="w-full">
              {isConnecting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Connecting...
                </>
              ) : (
                "Connect to AI Assistant"
              )}
            </Button>
          ) : (
            <Button onClick={toggleMicrophone} variant={isMicActive ? "destructive" : "default"} className="w-full">
              {isMicActive ? (
                <>
                  <MicOff className="mr-2 h-4 w-4" />
                  Stop Microphone
                </>
              ) : (
                <>
                  <Mic className="mr-2 h-4 w-4" />
                  Start Microphone
                </>
              )}
            </Button>
          )}
        </div>

        <div className="bg-muted p-4 rounded-md h-64 overflow-y-auto">
          {transcript.length > 0 ? (
            transcript.map((line, index) => (
              <div key={index} className="mb-2">
                <p className="text-sm">{line}</p>
              </div>
            ))
          ) : (
            <div className="flex items-center justify-center h-full text-muted-foreground">
              {isConnected
                ? "Start speaking to see the conversation here"
                : "Connect to the AI assistant to start a conversation"}
            </div>
          )}
        </div>
      </CardContent>
      <CardFooter>
        {isConnected && (
          <Button onClick={disconnectSession} variant="outline" className="w-full">
            Disconnect
          </Button>
        )}
      </CardFooter>
    </Card>
  )
}
