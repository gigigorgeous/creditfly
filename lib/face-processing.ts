// Face processing helper functions

export interface FaceProcessingOptions {
  sourceImage: File | Blob
  targetImage?: File | Blob
  mode: "enhance" | "swap"
  enhancementLevel?: number
}

export interface FaceProcessingResult {
  resultImageUrl: string
  sourceImageUrl: string
  targetImageUrl?: string
  processingMode: string
}

/**
 * Processes a face image using the face processing API
 *
 * @param options The face processing options
 * @returns The result of the face processing operation
 */
export async function processFace(options: FaceProcessingOptions): Promise<FaceProcessingResult> {
  // Create form data
  const formData = new FormData()
  formData.append("sourceImage", options.sourceImage)
  formData.append("mode", options.mode)

  if (options.enhancementLevel !== undefined) {
    formData.append("enhancementLevel", options.enhancementLevel.toString())
  }

  if (options.targetImage) {
    formData.append("targetImage", options.targetImage)
  }

  // Call the face processing API
  const response = await fetch("/api/face-processing", {
    method: "POST",
    body: formData,
  })

  if (!response.ok) {
    const error = await response.json()
    throw new Error(error.message || "Failed to process face")
  }

  return await response.json()
}

/**
 * Apply face swapping to a video
 *
 * @param sourceVideo The source video file
 * @param personaId The ID of the persona to use for face swapping
 * @returns The URL of the processed video
 */
export async function processVideo(
  sourceVideo: File,
  personaId: string,
): Promise<{
  videoUrl: string
  thumbnailUrl: string
  title: string
}> {
  // Create form data
  const formData = new FormData()
  formData.append("sourceVideo", sourceVideo)
  formData.append("personaId", personaId)

  // Call the video processing API
  const response = await fetch("/api/video-face-processing", {
    method: "POST",
    body: formData,
  })

  if (!response.ok) {
    const error = await response.json()
    throw new Error(error.message || "Failed to process video")
  }

  return await response.json()
}
