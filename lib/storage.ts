// Multi-provider serverless storage system
import { put, del, list } from "@vercel/blob"

// Storage providers configuration
const STORAGE_PROVIDERS = {
  vercel: {
    name: "Vercel Blob",
    upload: async (file: File, path: string) => {
      const blob = await put(path, file, { access: "public" })
      return blob.url
    },
    delete: async (url: string) => {
      await del(url)
    },
  },
  // Add more providers as needed
  cloudinary: {
    name: "Cloudinary",
    upload: async (file: File, path: string) => {
      // Cloudinary upload implementation
      const formData = new FormData()
      formData.append("file", file)
      formData.append("upload_preset", process.env.CLOUDINARY_UPLOAD_PRESET || "")

      const response = await fetch(`https://api.cloudinary.com/v1_1/${process.env.CLOUDINARY_CLOUD_NAME}/auto/upload`, {
        method: "POST",
        body: formData,
      })

      const data = await response.json()
      return data.secure_url
    },
    delete: async (url: string) => {
      // Cloudinary delete implementation
      const publicId = url.split("/").pop()?.split(".")[0]
      if (!publicId) return

      await fetch(`https://api.cloudinary.com/v1_1/${process.env.CLOUDINARY_CLOUD_NAME}/image/destroy`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          public_id: publicId,
          api_key: process.env.CLOUDINARY_API_KEY,
          api_secret: process.env.CLOUDINARY_API_SECRET,
        }),
      })
    },
  },
}

// Storage manager class
export class StorageManager {
  private providers: string[]

  constructor(providers: string[] = ["vercel", "cloudinary"]) {
    this.providers = providers
  }

  async uploadFile(file: File, path: string, options: { backup?: boolean } = {}) {
    const results: { provider: string; url: string; success: boolean }[] = []

    // Upload to primary provider
    const primaryProvider = this.providers[0]
    try {
      const url = await STORAGE_PROVIDERS[primaryProvider as keyof typeof STORAGE_PROVIDERS].upload(file, path)
      results.push({ provider: primaryProvider, url, success: true })

      // If backup is enabled, upload to secondary providers
      if (options.backup && this.providers.length > 1) {
        for (let i = 1; i < this.providers.length; i++) {
          const provider = this.providers[i]
          try {
            const backupUrl = await STORAGE_PROVIDERS[provider as keyof typeof STORAGE_PROVIDERS].upload(file, path)
            results.push({ provider, url: backupUrl, success: true })
          } catch (error) {
            console.error(`Backup upload to ${provider} failed:`, error)
            results.push({ provider, url: "", success: false })
          }
        }
      }

      return {
        success: true,
        primaryUrl: results[0].url,
        backupUrls: results
          .slice(1)
          .filter((r) => r.success)
          .map((r) => r.url),
        results,
      }
    } catch (error) {
      console.error(`Primary upload to ${primaryProvider} failed:`, error)
      return {
        success: false,
        primaryUrl: "",
        backupUrls: [],
        results: [{ provider: primaryProvider, url: "", success: false }],
        error: error instanceof Error ? error.message : "Upload failed",
      }
    }
  }

  async deleteFile(urls: string[]) {
    const results: { url: string; success: boolean }[] = []

    for (const url of urls) {
      // Determine provider from URL
      let provider: string | null = null
      if (url.includes("vercel-storage.com") || url.includes("blob.vercel-storage.com")) {
        provider = "vercel"
      } else if (url.includes("cloudinary.com")) {
        provider = "cloudinary"
      }

      if (provider && STORAGE_PROVIDERS[provider as keyof typeof STORAGE_PROVIDERS]) {
        try {
          await STORAGE_PROVIDERS[provider as keyof typeof STORAGE_PROVIDERS].delete(url)
          results.push({ url, success: true })
        } catch (error) {
          console.error(`Delete from ${provider} failed:`, error)
          results.push({ url, success: false })
        }
      } else {
        results.push({ url, success: false })
      }
    }

    return results
  }

  // Get storage usage statistics
  async getStorageStats() {
    try {
      // For Vercel Blob
      const { blobs } = await list()
      const totalSize = blobs.reduce((acc, blob) => acc + blob.size, 0)
      const totalFiles = blobs.length

      return {
        totalFiles,
        totalSize,
        formattedSize: this.formatBytes(totalSize),
        providers: this.providers,
      }
    } catch (error) {
      console.error("Failed to get storage stats:", error)
      return {
        totalFiles: 0,
        totalSize: 0,
        formattedSize: "0 B",
        providers: this.providers,
      }
    }
  }

  private formatBytes(bytes: number): string {
    if (bytes === 0) return "0 B"
    const k = 1024
    const sizes = ["B", "KB", "MB", "GB", "TB"]
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return Number.parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i]
  }
}

// Default storage manager instance
export const storage = new StorageManager(["vercel", "cloudinary"])

// Helper functions for common operations
export async function uploadAudioFile(file: File, musicId: string) {
  const path = `music/${musicId}/${file.name}`
  return await storage.uploadFile(file, path, { backup: true })
}

export async function uploadVideoFile(file: File, videoId: string) {
  const path = `videos/${videoId}/${file.name}`
  return await storage.uploadFile(file, path, { backup: true })
}

export async function uploadImageFile(file: File, type: "avatar" | "thumbnail" | "cover", id: string) {
  const path = `images/${type}/${id}/${file.name}`
  return await storage.uploadFile(file, path, { backup: true })
}
