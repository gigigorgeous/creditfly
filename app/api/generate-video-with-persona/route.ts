import { NextResponse } from "next/server"
import { v4 as uuidv4 } from "uuid"

// Fallback function to simulate AI response when no API key is available
function simulateVideoWithPersonaDescription(
  videoStyle: string,
  colorTheme: string,
  musicGenre: string,
  musicMood: string,
  personaName: string,
  personaStyle: string,
) {
  const scenes = [
    {
      timeStart: "0:00",
      timeEnd: "0:30",
      description: `Opening scene featuring ${personaName} in a dramatic entrance`,
    },
    {
      timeStart: "0:30",
      timeEnd: "1:00",
      description: `${personaName} performing on stage with dynamic lighting effects`,
    },
    {
      timeStart: "1:00",
      timeEnd: "1:30",
      description: `Close-up shots of ${personaName} with emotional expressions matching the music`,
    },
    {
      timeStart: "1:30",
      timeEnd: "2:00",
      description: `${personaName} in a finale pose with spectacular visual effects`,
    },
  ]

  return {
    videoDescription: `A ${videoStyle} music video featuring ${personaName} as a ${personaStyle} performing a ${musicGenre} song with ${musicMood} mood. The video showcases the artist in various settings with ${colorTheme} color themes.`,
    scenes: scenes,
    visualStyle: `${videoStyle} with dynamic elements responding to the music's rhythm and energy. The visuals incorporate the persona's style and image throughout the video.`,
    personaIntegration: `${personaName} appears throughout the video as the main performer, with their likeness integrated seamlessly into the ${videoStyle} style.`,
  }
}

export async function POST(request: Request) {
  try {
    const {
      title,
      description,
      videoStyle,
      colorTheme,
      musicId,
      musicTitle,
      musicGenre,
      musicMood,
      personaId,
      personaName,
      personaStyle,
      personaImages,
    } = await request.json()

    let videoDescription
    let aiSdkEnabled = false

    // Check if OpenAI API key is available and try to import AI SDK
    if (process.env.OPENAI_API_KEY) {
      try {
        // Dynamic import of AI SDK
        const ai = await import("ai")
        const aiSdk = await import("@ai-sdk/openai")

        // Generate video description using AI
        const videoPrompt = `
          Create a detailed video generation prompt for a music video featuring a custom celebrity persona with the following details:
          Title: ${title || `${personaName} - ${musicTitle}`}
          Style: ${videoStyle || "Abstract Animation"}
          Color Theme: ${colorTheme || "Vibrant"}
          Music Genre: ${musicGenre || "Pop"}
          Music Mood: ${musicMood || "Energetic"}
          Persona Name: ${personaName || "Artist"}
          Persona Style: ${personaStyle || "Pop Star"}
          ${description ? `Additional description: ${description}` : ""}
          
          Format the response as a JSON object with the following structure:
          {
            "videoDescription": "detailed description of the video",
            "scenes": [
              {"timeStart": "0:00", "timeEnd": "0:30", "description": "scene description featuring the persona"},
              {"timeStart": "0:30", "timeEnd": "1:00", "description": "scene description featuring the persona"}
            ],
            "visualStyle": "detailed description of visual style",
            "personaIntegration": "description of how the persona is integrated into the video"
          }
        `

        const { text: videoDescriptionText } = await ai.generateText({
          model: aiSdk.openai("gpt-4o"),
          prompt: videoPrompt,
        })

        try {
          videoDescription = JSON.parse(videoDescriptionText)
          aiSdkEnabled = true
        } catch (e) {
          // If parsing fails, use fallback
          videoDescription = simulateVideoWithPersonaDescription(
            videoStyle,
            colorTheme,
            musicGenre,
            musicMood,
            personaName,
            personaStyle,
          )
        }
      } catch (error) {
        console.error("Error using AI SDK:", error)
        videoDescription = simulateVideoWithPersonaDescription(
          videoStyle,
          colorTheme,
          musicGenre,
          musicMood,
          personaName,
          personaStyle,
        )
      }
    }

    // Use fallback if AI SDK is not available or failed
    if (!aiSdkEnabled) {
      videoDescription = simulateVideoWithPersonaDescription(
        videoStyle,
        colorTheme,
        musicGenre,
        musicMood,
        personaName,
        personaStyle,
      )
    }

    // Create a unique ID for the video
    const videoId = uuidv4()

    // Return the generated video metadata
    return NextResponse.json({
      id: videoId,
      title: title || `${personaName} - ${musicTitle}`,
      videoUrl: `/api/stream-video/${videoId}`, // This would be our streaming endpoint
      thumbnailUrl: `/api/video-thumbnail/${videoId}`,
      musicId: musicId,
      personaId: personaId,
      style: videoStyle || "Abstract Animation",
      createdAt: new Date().toISOString(),
      videoDescription: videoDescription,
    })
  } catch (error) {
    console.error("Error generating video with persona:", error)
    return NextResponse.json({ error: "Failed to generate video with persona" }, { status: 500 })
  }
}
