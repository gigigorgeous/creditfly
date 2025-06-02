"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import {
  FolderOpen,
  File,
  Music,
  Video,
  ImageIcon,
  Download,
  Trash2,
  Search,
  HardDrive,
  MoreVertical,
  Eye,
  Copy,
} from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"

interface FileItem {
  id: string
  name: string
  type: "audio" | "video" | "image" | "other"
  size: number
  url: string
  blobUrl?: string
  uploadedAt: string
  mimeType: string
}

interface FileManagerProps {
  userId?: string
}

export function FileManager({ userId }: FileManagerProps) {
  const [files, setFiles] = useState<FileItem[]>([])
  const [filteredFiles, setFilteredFiles] = useState<FileItem[]>([])
  const [searchQuery, setSearchQuery] = useState("")
  const [selectedType, setSelectedType] = useState<string>("all")
  const [isLoading, setIsLoading] = useState(true)
  const [storageStats, setStorageStats] = useState({
    totalFiles: 0,
    totalSize: 0,
    formattedSize: "0 B",
    usagePercentage: 0,
  })
  const { toast } = useToast()

  useEffect(() => {
    const fetchFiles = async () => {
      try {
        setIsLoading(true)

        const response = await fetch(`/api/files${userId ? `?userId=${userId}` : ""}`)

        if (response.ok) {
          const data = await response.json()
          setFiles(data.files || [])
          setStorageStats(data.stats || storageStats)
        } else {
          // Demo data
          const demoFiles: FileItem[] = [
            {
              id: "file-1",
              name: "sunset-dreams.mp3",
              type: "audio",
              size: 5242880, // 5MB
              url: "https://example.blob.vercel-storage.com/music/sunset-dreams.mp3",
              uploadedAt: "2024-01-15T10:30:00Z",
              mimeType: "audio/mpeg",
            },
            {
              id: "file-2",
              name: "electric-nights-video.mp4",
              type: "video",
              size: 15728640, // 15MB
              url: "https://example.blob.vercel-storage.com/videos/electric-nights.mp4",
              uploadedAt: "2024-01-14T15:45:00Z",
              mimeType: "video/mp4",
            },
            {
              id: "file-3",
              name: "album-cover.jpg",
              type: "image",
              size: 1048576, // 1MB
              url: "https://example.blob.vercel-storage.com/images/album-cover.jpg",
              uploadedAt: "2024-01-13T09:20:00Z",
              mimeType: "image/jpeg",
            },
          ]
          setFiles(demoFiles)
          setStorageStats({
            totalFiles: 3,
            totalSize: 21019136,
            formattedSize: "20.0 MB",
            usagePercentage: 2.0,
          })
        }
      } catch (error) {
        console.error("Error fetching files:", error)
        toast({
          title: "Error",
          description: "Failed to load files",
          variant: "destructive",
        })
      } finally {
        setIsLoading(false)
      }
    }

    fetchFiles()
  }, [userId, toast])

  useEffect(() => {
    let filtered = files

    if (searchQuery) {
      filtered = filtered.filter((file) => file.name.toLowerCase().includes(searchQuery.toLowerCase()))
    }

    if (selectedType !== "all") {
      filtered = filtered.filter((file) => file.type === selectedType)
    }

    setFilteredFiles(filtered)
  }, [files, searchQuery, selectedType])

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return "0 B"
    const k = 1024
    const sizes = ["B", "KB", "MB", "GB"]
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return Number.parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i]
  }

  const getFileIcon = (type: string) => {
    switch (type) {
      case "audio":
        return <Music className="h-4 w-4" />
      case "video":
        return <Video className="h-4 w-4" />
      case "image":
        return <ImageIcon className="h-4 w-4" />
      default:
        return <File className="h-4 w-4" />
    }
  }

  const getFileTypeColor = (type: string) => {
    switch (type) {
      case "audio":
        return "bg-blue-100 text-blue-800"
      case "video":
        return "bg-purple-100 text-purple-800"
      case "image":
        return "bg-green-100 text-green-800"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  const handleDownload = async (file: FileItem) => {
    try {
      const response = await fetch(file.url)
      if (response.ok) {
        const blob = await response.blob()
        const url = window.URL.createObjectURL(blob)
        const a = document.createElement("a")
        a.href = url
        a.download = file.name
        document.body.appendChild(a)
        a.click()
        window.URL.revokeObjectURL(url)
        document.body.removeChild(a)

        toast({
          title: "Download Started",
          description: `Downloading "${file.name}"`,
        })
      }
    } catch (error) {
      toast({
        title: "Download failed",
        description: "Unable to download file. Please try again.",
        variant: "destructive",
      })
    }
  }

  const handleDelete = async (file: FileItem) => {
    try {
      const response = await fetch(`/api/files/${file.id}`, {
        method: "DELETE",
      })

      if (response.ok) {
        setFiles((prev) => prev.filter((f) => f.id !== file.id))
        toast({
          title: "File deleted",
          description: `"${file.name}" has been deleted`,
        })
      }
    } catch (error) {
      toast({
        title: "Delete failed",
        description: "Unable to delete file. Please try again.",
        variant: "destructive",
      })
    }
  }

  const handleCopyUrl = async (file: FileItem) => {
    try {
      await navigator.clipboard.writeText(file.url)
      toast({
        title: "URL copied",
        description: "File URL copied to clipboard",
      })
    } catch (error) {
      toast({
        title: "Copy failed",
        description: "Unable to copy URL to clipboard",
        variant: "destructive",
      })
    }
  }

  const fileTypes = ["all", "audio", "video", "image", "other"]
  const fileTypeCounts = fileTypes.reduce(
    (acc, type) => {
      acc[type] = type === "all" ? files.length : files.filter((f) => f.type === type).length
      return acc
    },
    {} as Record<string, number>,
  )

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center space-y-4">
          <HardDrive className="h-12 w-12 animate-pulse text-primary mx-auto" />
          <p>Loading file manager...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Storage Overview */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Storage Used</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{storageStats.formattedSize}</div>
            <Progress value={storageStats.usagePercentage} className="mt-2" />
            <p className="text-xs text-muted-foreground mt-1">{storageStats.usagePercentage.toFixed(1)}% of 1GB used</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Total Files</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{storageStats.totalFiles}</div>
            <p className="text-xs text-muted-foreground">Across all types</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">File Types</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-1">
              <div className="flex justify-between text-sm">
                <span>Audio</span>
                <span>{fileTypeCounts.audio}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span>Video</span>
                <span>{fileTypeCounts.video}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span>Images</span>
                <span>{fileTypeCounts.image}</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* File Controls */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
          <Input
            placeholder="Search files..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </div>
        <div className="flex gap-2">
          <select
            value={selectedType}
            onChange={(e) => setSelectedType(e.target.value)}
            className="px-3 py-2 border rounded-md bg-background"
          >
            {fileTypes.map((type) => (
              <option key={type} value={type}>
                {type === "all"
                  ? `All Files (${fileTypeCounts.all})`
                  : `${type.charAt(0).toUpperCase() + type.slice(1)} (${fileTypeCounts[type]})`}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* File List */}
      <Card>
        <CardHeader>
          <CardTitle>Files</CardTitle>
          <CardDescription>Manage your uploaded files and media</CardDescription>
        </CardHeader>
        <CardContent>
          {filteredFiles.length === 0 ? (
            <div className="text-center py-8">
              <FolderOpen className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-medium mb-2">No files found</h3>
              <p className="text-muted-foreground">
                {searchQuery || selectedType !== "all"
                  ? "Try adjusting your search or filters"
                  : "Upload some files to get started"}
              </p>
            </div>
          ) : (
            <div className="space-y-2">
              {filteredFiles.map((file) => (
                <div key={file.id} className="flex items-center gap-4 p-3 border rounded-lg hover:bg-muted/50">
                  <div className={`p-2 rounded ${getFileTypeColor(file.type)}`}>{getFileIcon(file.type)}</div>

                  <div className="flex-1 min-w-0">
                    <h4 className="font-medium truncate">{file.name}</h4>
                    <div className="flex items-center gap-4 text-sm text-muted-foreground">
                      <span>{formatFileSize(file.size)}</span>
                      <span>•</span>
                      <span>{new Date(file.uploadedAt).toLocaleDateString()}</span>
                      <span>•</span>
                      <Badge variant="outline" className="text-xs">
                        {file.type}
                      </Badge>
                    </div>
                  </div>

                  <div className="flex items-center gap-1">
                    <Button variant="ghost" size="icon" onClick={() => window.open(file.url, "_blank")}>
                      <Eye className="h-4 w-4" />
                    </Button>
                    <Button variant="ghost" size="icon" onClick={() => handleDownload(file)}>
                      <Download className="h-4 w-4" />
                    </Button>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon">
                          <MoreVertical className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem onClick={() => window.open(file.url, "_blank")}>
                          <Eye className="h-4 w-4 mr-2" />
                          View
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => handleDownload(file)}>
                          <Download className="h-4 w-4 mr-2" />
                          Download
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => handleCopyUrl(file)}>
                          <Copy className="h-4 w-4 mr-2" />
                          Copy URL
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem onClick={() => handleDelete(file)} className="text-destructive">
                          <Trash2 className="h-4 w-4 mr-2" />
                          Delete
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
