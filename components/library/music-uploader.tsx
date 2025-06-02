"use client"

import type React from "react"

import { useState, useCallback } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { Upload, X, FileAudio, Loader2, CheckCircle } from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import { useAuth } from "@/context/auth-context"
import type { GeneratedMusic } from "../music-video-creator"

interface MusicUploaderProps {
  onClose: () => void
  onUploadComplete: (track: GeneratedMusic) => void
}

const GENRES = [
  "Pop",
  "Rock",
  "Classical",
  "Electronic",
  "Jazz",
  "Hip-Hop",
  "Ambient",
  "World",
  "Country",
  "R&B",
  "Trap",
  "Dubstep",
  "Techno",
  "House",
  "Drum & Bass",
  "Reggae",
  "Funk",
  "Soul",
  "Blues",
  "Metal",
  "Punk",
  "Folk",
  "Indie",
  "Latin",
  "Afrobeat",
  "K-Pop",
  "J-Pop",
  "Disco",
  "Synthwave",
  "Lo-Fi",
]

const MOODS = [
  "Happy",
  "Sad",
  "Energetic",
  "Calm",
  "Romantic",
  "Mysterious",
  "Epic",
  "Playful",
  "Melancholic",
  "Intense",
]

export function MusicUploader({ onClose, onUploadComplete }: MusicUploaderProps) {
  const [file, setFile] = useState<File | null>(null)
  const [title, setTitle] = useState("")
  const [description, setDescription] = useState("")
  const [genre, setGenre] = useState("")
  const [mood, setMood] = useState("")
  const [isUploading, setIsUploading] = useState(false)
  const [uploadProgress, setUploadProgress] = useState(0)
  const [dragActive, setDragActive] = useState(false)
  const { toast } = useToast()
  const { user } = useAuth()

  const handleDrag = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true)
    } else if (e.type === "dragleave") {
      setDragActive(false)
    }
  }, [])

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault()
      e.stopPropagation()
      setDragActive(false)

      const files = Array.from(e.dataTransfer.files)
      const audioFile = files.find((file) => file.type.startsWith("audio/"))

      if (audioFile) {
        setFile(audioFile)
        if (!title) {
          setTitle(audioFile.name.replace(/\.[^/.]+$/, ""))
        }
      } else {
        toast({
          title: "Invalid file type",
          description: "Please upload an audio file (MP3, WAV, etc.)",
          variant: "destructive",
        })
      }
    },
    [title, toast],
  )

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0]
    if (selectedFile && selectedFile.type.startsWith("audio/")) {
      setFile(selectedFile)
      if (!title) {
        setTitle(selectedFile.name.replace(/\.[^/.]+$/, ""))
      }
    } else {
      toast({
        title: "Invalid file type",
        description: "Please upload an audio file (MP3, WAV, etc.)",
        variant: "destructive",
      })
    }
  }

  const handleUpload = async () => {
    if (!file || !title.trim()) {
      toast({
        title: "Missing information",
        description: "Please select a file and enter a title",
        variant: "destructive",
      })
      return
    }

    try {
      setIsUploading(true)
      setUploadProgress(0)

      // Create form data
      const formData = new FormData()
      formData.append("file", file)
      formData.append("type", "audio")
      formData.append("id", `upload-${Date.now()}`)
      formData.append("userId", user?.id || "anonymous")

      // Simulate upload progress
      const progressInterval = setInterval(() => {
        setUploadProgress((prev) => {
          if (prev >= 90) {
            clearInterval(progressInterval)
            return prev
          }
          return prev + Math.random() * 10
        })
      }, 200)

      // Upload file
      const uploadResponse = await fetch("/api/upload", {
        method: "POST",
        body: formData,
      })

      clearInterval(progressInterval)
      setUploadProgress(100)

      if (!uploadResponse.ok) {
        throw new Error("Upload failed")
      }

      const uploadResult = await uploadResponse.json()

      // Create music metadata
      const musicData: GeneratedMusic = {
        id: uploadResult.fileId,
        title: title.trim(),
        audioUrl: uploadResult.url,
        blobUrl: uploadResult.url,
        genre: genre || "Unknown",
        mood: mood || "Unknown",
        duration: 0, // Will be calculated on the server
        createdAt: new Date(),
        musicDescription: {
          musicDescription: description || `User uploaded ${genre || "music"} track`,
          structure: ["intro", "main", "outro"],
          tempo: 120,
          key: "Unknown",
          instrumentation: ["unknown"],
        },
        aiGenerated: false,
        plays: 0,
        likes: 0,
      }

      // Save music metadata
      const saveResponse = await fetch("/api/music/save", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          music: musicData,
          userId: user?.id,
        }),
      })

      if (!saveResponse.ok) {
        throw new Error("Failed to save music metadata")
      }

      const saveResult = await saveResponse.json()
      const finalMusicData = { ...musicData, id: saveResult.id }

      onUploadComplete(finalMusicData)

      toast({
        title: "Upload successful!",
        description: `"${title}" has been added to your library`,
      })
    } catch (error) {
      console.error("Upload error:", error)
      toast({
        title: "Upload failed",
        description: "There was an error uploading your file. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsUploading(false)
      setUploadProgress(0)
    }
  }

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return "0 B"
    const k = 1024
    const sizes = ["B", "KB", "MB", "GB"]
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return Number.parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i]
  }

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <Card className="w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Upload Music</CardTitle>
              <CardDescription>Add your own music files to your library</CardDescription>
            </div>
            <Button variant="ghost" size="icon" onClick={onClose}>
              <X className="h-4 w-4" />
            </Button>
          </div>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* File Upload Area */}
          <div
            className={`border-2 border-dashed rounded-lg p-8 text-center transition-colors ${
              dragActive
                ? "border-primary bg-primary/5"
                : file
                  ? "border-green-500 bg-green-50"
                  : "border-muted-foreground/25 hover:border-primary/50"
            }`}
            onDragEnter={handleDrag}
            onDragLeave={handleDrag}
            onDragOver={handleDrag}
            onDrop={handleDrop}
          >
            {file ? (
              <div className="space-y-4">
                <CheckCircle className="h-12 w-12 text-green-500 mx-auto" />
                <div>
                  <h3 className="font-medium">{file.name}</h3>
                  <p className="text-sm text-muted-foreground">
                    {formatFileSize(file.size)} • {file.type}
                  </p>
                </div>
                <Button variant="outline" onClick={() => setFile(null)}>
                  Choose Different File
                </Button>
              </div>
            ) : (
              <div className="space-y-4">
                <Upload className="h-12 w-12 text-muted-foreground mx-auto" />
                <div>
                  <h3 className="font-medium">Drop your audio file here</h3>
                  <p className="text-sm text-muted-foreground">or click to browse (MP3, WAV, FLAC, etc.)</p>
                </div>
                <input type="file" accept="audio/*" onChange={handleFileSelect} className="hidden" id="file-upload" />
                <Button asChild>
                  <label htmlFor="file-upload" className="cursor-pointer">
                    <FileAudio className="h-4 w-4 mr-2" />
                    Choose File
                  </label>
                </Button>
              </div>
            )}
          </div>

          {/* Upload Progress */}
          {isUploading && (
            <div className="space-y-2">
              <div className="flex items-center justify-between text-sm">
                <span>Uploading...</span>
                <span>{Math.round(uploadProgress)}%</span>
              </div>
              <Progress value={uploadProgress} />
            </div>
          )}

          {/* Metadata Form */}
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="title">Title *</Label>
              <Input
                id="title"
                placeholder="Enter track title"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                disabled={isUploading}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                placeholder="Describe your track (optional)"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                disabled={isUploading}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="genre">Genre</Label>
                <Select value={genre} onValueChange={setGenre} disabled={isUploading}>
                  <SelectTrigger id="genre">
                    <SelectValue placeholder="Select genre" />
                  </SelectTrigger>
                  <SelectContent>
                    {GENRES.map((g) => (
                      <SelectItem key={g} value={g}>
                        {g}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="mood">Mood</Label>
                <Select value={mood} onValueChange={setMood} disabled={isUploading}>
                  <SelectTrigger id="mood">
                    <SelectValue placeholder="Select mood" />
                  </SelectTrigger>
                  <SelectContent>
                    {MOODS.map((m) => (
                      <SelectItem key={m} value={m}>
                        {m}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex justify-end gap-2 pt-4 border-t">
            <Button variant="outline" onClick={onClose} disabled={isUploading}>
              Cancel
            </Button>
            <Button onClick={handleUpload} disabled={!file || !title.trim() || isUploading}>
              {isUploading ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Uploading...
                </>
              ) : (
                <>
                  <Upload className="h-4 w-4 mr-2" />
                  Upload Music
                </>
              )}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
