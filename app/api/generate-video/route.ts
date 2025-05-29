import { NextResponse } from "next/server"
import { v4 as uuidv4 } from "uuid"

// Fallback function to simulate AI response when no API key is available
function simulateVideoDescription(videoStyle: string, colorTheme: string, musicGenre: string, musicMood: string) {
  const scenes = [
    { timeStart: "0:00", timeEnd: "0:30", description: "Opening scene with abstract visuals that introduce the theme" },
    {
      timeStart: "0:30",
      timeEnd: "1:00",
      description: "Transition to main visual elements with increasing complexity",
    },
    { timeStart: "1:00", timeEnd: "1:30", description: "Peak visual intensity matching the music's climax" },
    { timeStart: "1:30", timeEnd: "2:00", description: "Gradual resolution and return to simpler visuals" },
  ]

  const colorPalettes: Record<string, string[]> = {
    Vibrant: ["#3498db", "#e74c3c", "#2ecc71", "#f39c12"],
    Monochrome: ["#000000", "#333333", "#666666", "#999999", "#ffffff"],
    Pastel: ["#a8e6cf", "#dcedc1", "#ffd3b6", "#ffaaa5", "#ff8b94"],
    Neon: ["#ff00ff", "#00ffff", "#ff9900", "#00ff00", "#ff0000"],
    Earthy: ["#d9a679", "#8f784b", "#6b5b4d", "#4a3f35", "#2d2926"],
    "Cool Blues": ["#001f3f", "#0074d9", "#7fdbff", "#39cccc", "#01ff70"],
    "Warm Sunset": ["#ff7e5f", "#feb47b", "#ffcb8e", "#f8e9a1", "#f76b1c"],
    "Dark Mode": ["#121212", "#1e1e1e", "#2a2a2a", "#3a3a3a", "#0077ff"],
    "High Contrast": ["#000000", "#ffffff", "#ff0000", "#00ff00", "#0000ff"],
    Cyberpunk: ["#ff00ff", "#00ffff", "#ffff00", "#ff0099", "#9900ff"],
  }

  const selectedStyle = videoStyle || "Abstract Animation"
  const selectedColorTheme = colorTheme || "Vibrant"
  const selectedGenre = musicGenre || "Pop"
  const selectedMood = musicMood || "Energetic"

  return {
    videoDescription: `A ${selectedStyle} music video with ${selectedColorTheme} colors for a ${selectedGenre} song with ${selectedMood} mood. The visuals flow and evolve with the music, creating a synchronized audiovisual experience.`,
    scenes: scenes,
    visualStyle: `${selectedStyle} with dynamic elements responding to the music's rhythm and energy. The visuals incorporate flowing patterns and geometric shapes that transform based on the audio.`,
    colorPalette: colorPalettes[selectedColorTheme] || colorPalettes["Vibrant"],
  }
}

export async function POST(request: Request) {
  try {
    const { title, description, videoStyle, colorTheme, musicId, musicTitle, musicGenre, musicMood } =
      await request.json()

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
          Create a detailed video generation prompt for a music video with the following details:
          Title: ${title || `Video for ${musicTitle}`}
          Style: ${videoStyle || "Abstract Animation"}
          Color Theme: ${colorTheme || "Vibrant"}
          Music Genre: ${musicGenre || "Pop"}
          Music Mood: ${musicMood || "Energetic"}
          ${description ? `Additional description: ${description}` : ""}
          
          Format the response as a JSON object with the following structure:
          {
            "videoDescription": "detailed description of the video",
            "scenes": [
              {"timeStart": "0:00", "timeEnd": "0:30", "description": "scene description"},
              {"timeStart": "0:30", "timeEnd": "1:00", "description": "scene description"}
            ],
            "visualStyle": "detailed description of visual style",
            "colorPalette": ["color1", "color2", "color3", "color4"]
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
          videoDescription = simulateVideoDescription(videoStyle, colorTheme, musicGenre, musicMood)
        }
      } catch (error) {
        console.error("Error using AI SDK:", error)
        videoDescription = simulateVideoDescription(videoStyle, colorTheme, musicGenre, musicMood)
      }
    }

    // Use fallback if AI SDK is not available or failed
    if (!aiSdkEnabled) {
      videoDescription = simulateVideoDescription(videoStyle, colorTheme, musicGenre, musicMood)
    }

    // Create a unique ID for the video
    const videoId = uuidv4()

    // Return the generated video metadata
    return NextResponse.json({
      id: videoId,
      title: title || `Video for ${musicTitle}`,
      videoUrl: `/api/stream-video/${videoId}`, // This would be our streaming endpoint
      thumbnailUrl: `/api/video-thumbnail/${videoId}`,
      musicId: musicId,
      style: videoStyle || "Abstract Animation",
      createdAt: new Date().toISOString(),
      videoDescription: videoDescription,
    })
  } catch (error) {
    console.error("Error generating video:", error)
    return NextResponse.json({ error: "Failed to generate video" }, { status: 500 })
  }
}
