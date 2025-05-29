import { v4 as uuidv4 } from "uuid"

// Types for our music generation functions
export interface MusicGenerationOptions {
  title?: string
  lyrics?: string
  genre?: string
  mood?: string
  style?: string
  voiceType?: string
  duration?: number
  userId?: string
}

export interface GeneratedMusic {
  id: string
  title: string
  audioUrl: string
  genre: string
  mood: string
  duration: number
  createdAt: string
  musicDescription: any
  aiGenerated: boolean
}

// Function to create a fallback music description
export function createFallbackMusicDescription(genre: string, mood: string, style: string) {
  return {
    musicDescription: `A ${genre} song with a ${mood} mood in ${style} style. The track has a smooth rhythm with dynamic progression and emotional depth.`,
    structure: ["intro", "verse", "chorus", "verse", "chorus", "bridge", "chorus", "outro"],
    tempo: 120,
    key: "C major",
    instrumentation: ["piano", "guitar", "drums", "bass", "synth"],
    theme: "Summer vibes and positive energy",
    melody: "Catchy and uplifting melody with memorable hooks",
    harmony: "Rich chord progressions with occasional tension and resolution",
    rhythm: "Steady beat with syncopated elements to add interest",
  }
}

// Function to get genre-specific audio URLs (fallback)
export function getGenreBasedAudioUrl(genre: string, mood: string): string {
  // Map genres to sample audio files from external sources
  const genreAudioMap: Record<string, string> = {
    Pop: "https://samplelib.com/lib/preview/mp3/sample-15s.mp3",
    Rock: "https://samplelib.com/lib/preview/mp3/sample-12s.mp3",
    Classical: "https://samplelib.com/lib/preview/mp3/sample-9s.mp3",
    Electronic: "https://samplelib.com/lib/preview/mp3/sample-3s.mp3",
    Jazz: "https://samplelib.com/lib/preview/mp3/sample-6s.mp3",
    "Hip-Hop": "https://samplelib.com/lib/preview/mp3/sample-15s.mp3",
    Ambient: "https://samplelib.com/lib/preview/mp3/sample-9s.mp3",
    // Add more genres as needed
  }

  // If we have a specific audio for this genre, use it
  if (genreAudioMap[genre]) {
    return genreAudioMap[genre]
  }

  // Otherwise, select based on mood
  if (mood === "Happy" || mood === "Energetic" || mood === "Playful") {
    return "https://samplelib.com/lib/preview/mp3/sample-15s.mp3"
  } else if (mood === "Sad" || mood === "Melancholic") {
    return "https://samplelib.com/lib/preview/mp3/sample-9s.mp3"
  } else if (mood === "Intense" || mood === "Epic") {
    return "https://samplelib.com/lib/preview/mp3/sample-12s.mp3"
  } else if (mood === "Calm" || mood === "Mysterious") {
    return "https://samplelib.com/lib/preview/mp3/sample-6s.mp3"
  } else {
    // Default audio
    return "https://samplelib.com/lib/preview/mp3/sample-3s.mp3"
  }
}

// Main function to generate music (both description and audio)
export async function generateMusic(options: MusicGenerationOptions): Promise<GeneratedMusic> {
  const { title, genre, mood, duration, userId } = options

  try {
    // Create a fallback music description
    const musicDescription = createFallbackMusicDescription(genre || "Pop", mood || "Happy", "Vocal")

    // Get a suitable audio URL based on genre/mood
    const audioUrl = getGenreBasedAudioUrl(genre || "Pop", mood || "Happy")

    // Create a unique ID for the track
    const trackId = uuidv4()

    // Format the music data
    const musicData: GeneratedMusic = {
      id: trackId,
      title: title || "Untitled Track",
      audioUrl: audioUrl,
      genre: genre || "Pop",
      mood: mood || "Happy",
      duration: duration || 180,
      createdAt: new Date().toISOString(),
      musicDescription: musicDescription,
      aiGenerated: true,
    }

    return musicData
  } catch (error) {
    console.error("Error in music generation:", error)

    // Return a fallback response
    const trackId = uuidv4()
    return {
      id: trackId,
      title: title || "Untitled Track",
      audioUrl: getGenreBasedAudioUrl(genre || "Pop", mood || "Happy"),
      genre: genre || "Pop",
      mood: mood || "Happy",
      duration: duration || 180,
      createdAt: new Date().toISOString(),
      musicDescription: createFallbackMusicDescription(genre || "Pop", mood || "Happy", "Vocal"),
      aiGenerated: true,
    }
  }
}
export async function autonomouslyFixJavascriptError(
  codeWithError: string,
    errorMessage: string
    ): Promise<
      | { fixed: true; correctedCode: string }
        | { fixed: false; error: string }
        > {
          // ... your code ...
          }
          {
            "presets": ["@babel/preset-react", "@babel/preset-typescript"]
              // You might have other presets as well, like '@babel/preset-env'
              }
              var settings = {
                 "url": "https://api.piapi.ai/api/v1/task/",
                    "method": "GET",
                       "timeout": 0,
                          "headers": {
                                "X-API-Key": ""
                                   },
                                   };

                                   $.ajax(settings).done(function (response) {
                                      console.log(response);
                                      });
                                      {
                                        "timestamp": 1724511853,
                                          "data": {
                                              "task_id": "58cb41b7-556d-46c0-b82e-1e116aa1a31a",
                                                  "model": "luma",
                                                      "task_type": "video_generation",
                                                          "status": "completed",
                                                              "config": {
                                                                    "webhook_config": {
                                                                            "endpoint": "https://webhook.site/xxxxx",
                                                                                    "secret": "123456"
                                                                                          }
                                                                                              },
                                                                                                  "input": {
                                                                                                        "aspect_ratio": "16:9",
                                                                                                              "expand_prompt": true,
                                                                                                                    "image_end_url": "https://i.imgur.com/CSmEZud.png",
                                                                                                                          "image_url": "https://i.imgur.com/eJkSUnA.png",
                                                                                                                                "loop": false,
                                                                                                                                      "user_prompt": ""
                                                                                                                                          },
                                                                                                                                              "output": {
                                                                                                                                                    "generation": {
                                                                                                                                                            "id": "ab9124ef-49d4-4da7-bf12-0c3891a3cca8",
                                                                                                                                                                    "prompt": "",
                                                                                                                                                                            "state": "completed",
                                                                                                                                                                                    "created_at": "2024-08-24T15:01:52.727Z",
                                                                                                                                                                                            "video": {
                                                                                                                                                                                                      "url": "https://storage.cdn-luma.com/dream_machine/49995d70-d0f3-4b0d-afb0-ec034107e4e2/watermarked_video08fe0802a4e104f1a80fb6c6c658710ee.mp4",
                                                                                                                                                                                                                "url_no_watermark": "https://img.midjourneyapi.xyz/ephemeral/db7420f9-8a24-48fd-ade5-ede803e835db.mp4",
                                                                                                                                                                                                                          "width": 1168,
                                                                                                                                                                                                                                    "height": 864,
                                                                                                                                                                                                                                              "thumbnail": ""
                                                                                                                                                                                                                                                      },
                                                                                                                                                                                                                                                              "like": null,
                                                                                                                                                                                                                                                                      "estimate_wait_seconds": null
                                                                                                                                                                                                                                                                            }
                                                                                                                                                                                                                                                                                },
                                                                                                                                                                                                                                                                                    "meta": {
                                                                                                                                                                                                                                                                                          "created_at": "2024-08-24T23:01:12.3556324+08:00",
                                                                                                                                                                                                                                                                                                "started_at": "2024-08-24T23:01:36.7432691+08:00",
                                                                                                                                                                                                                                                                                                      "ended_at": "2024-08-24T23:04:13.5301322+08:00",
                                                                                                                                                                                                                                                                                                            "usage": {
                                                                                                                                                                                                                                                                                                                    "type": "luma_quota",
                                                                                                                                                                                                                                                                                                                            "frozen": 30,
                                                                                                                                                                                                                                                                                                                                    "consume": 30
                                                                                                                                                                                                                                                                                                                                          }
                                                                                                                                                                                                                                                                                                                                              },
                                                                                                                                                                                                                                                                                                                                                  "detail": {
                                                                                                                                                                                                                                                                                                                                                        "account_id": 1,
                                                                                                                                                                                                                                                                                                                                                              "is_using_private_pool": false
                                                                                                                                                                                                                                                                                                                                                                  },
                                                                                                                                                                                                                                                                                                                                                                      "logs": [],
                                                                                                                                                                                                                                                                                                                                                                          "error": {
                                                                                                                                                                                                                                                                                                                                                                                "code": 0,
                                                                                                                                                                                                                                                                                                                                                                                      "message": ""
                                                                                                                                                                                                                                                                                                                                                                                          }
                                                                                                                                                                                                                                                                                                                                                                                            }
                                                                                                                                                                                                                                                                                                                                                                                            }

                                                                                                                                                                                                                                                                                                                                                                                            //POST https://api.piapi.ai/api/v1/task 
                                                                                                                                                                                                                                                                                                                                                                                            {
                                                                                                                                                                                                                                                                                                                                                                                                "model": "suno/v3-chorip",
                                                                                                                                                                                                                                                                                                                                                                                                    "task_type": "lyrics",
                                                                                                                                                                                                                                                                                                                                                                                                        "input": {},
                                                                                                                                                                                                                                                                                                                                                                                                            "config": {
                                                                                                                                                                                                                                                                                                                                                                                                                    "webhook_config": {
                                                                                                                                                                                                                                                                                                                                                                                                                                "endpoint": "",
                                                                                                                                                                                                                                                                                                                                                                                                                                            "secret": ""
                                                                                                                                                                                                                                                                                                                                                                                                                                                    }
                                                                                                                                                                                                                                                                                                                                                                                                                                                        }
                                                                                                                                                                                                                                                                                                                                                                                                                                                        }

                                                                                                                                                                                                                                                                                                                                                                                                                                                        {
                                                                                                                                                                                                                                                                                                                                                                                                                                                            "model": "music-u",
                                                                                                                                                                                                                                                                                                                                                                                                                                                                "task_type": "generate_music",
                                                                                                                                                                                                                                                                                                                                                                                                                                                                    "input": {
                                                                                                                                                                                                                                                                                                                                                                                                                                                                            "gpt_description_prompt": "winter snow, Folk music",
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                    "lyrics": "",
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                            "negative_tags": "",
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                    "lyrics_type": "generate",
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                            "seed": -1,
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                    "continue_song_id": "1307fd94-adbc-4787-b8e3-2e89f84ef22b",
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                            "continue_at": 0

                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                },
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                    "config": {
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                            "service_mode": "public",
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                    "webhook_config": {
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                "endpoint": "",
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                            "secret": ""
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                    }
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                        }
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                        }
