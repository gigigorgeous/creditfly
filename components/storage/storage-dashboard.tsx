"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { HardDrive, Music, Video, ImageIcon, Database, Cloud } from "lucide-react"

interface StorageStats {
  blob: {
    totalFiles: number
    totalSize: number
    formattedSize: string
    files: Array<{
      url: string
      pathname: string
      size: number
      uploadedAt: string
    }>
  }
  redis: {
    totalFiles: number
    totalSize: number
    formattedSize: string
    audioFiles: number
    videoFiles: number
    imageFiles: number
  }
  music: {
    totalTracks: number
    totalDuration: number
    formattedDuration: string
    averageDuration: number
  }
  summary: {
    totalFiles: number
    totalSize: number
    formattedSize: string
    storageProviders: string[]
  }
}

export function StorageDashboard() {
  const [stats, setStats] = useState<StorageStats | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const response = await fetch("/api/storage/stats")
        if (response.ok) {
          const data = await response.json()
          setStats(data)
        }
      } catch (error) {
        console.error("Error fetching storage stats:", error)
      } finally {
        setIsLoading(false)
      }
    }

    fetchStats()
  }, [])

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center space-y-4">
          <HardDrive className="h-12 w-12 animate-pulse text-primary mx-auto" />
          <p>Loading storage statistics...</p>
        </div>
      </div>
    )
  }

  if (!stats) {
    return (
      <Card>
        <CardContent className="flex items-center justify-center p-8">
          <p>Failed to load storage statistics</p>
        </CardContent>
      </Card>
    )
  }

  // Calculate storage usage percentage (assuming 1GB limit for demo)
  const storageLimit = 1024 * 1024 * 1024 // 1GB
  const usagePercentage = (stats.summary.totalSize / storageLimit) * 100

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Files</CardTitle>
            <HardDrive className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.summary.totalFiles}</div>
            <p className="text-xs text-muted-foreground">Across all storage providers</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Storage Used</CardTitle>
            <Cloud className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.summary.formattedSize}</div>
            <Progress value={usagePercentage} className="mt-2" />
            <p className="text-xs text-muted-foreground mt-1">{usagePercentage.toFixed(1)}% of 1GB used</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Music Tracks</CardTitle>
            <Music className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.music.totalTracks}</div>
            <p className="text-xs text-muted-foreground">{stats.music.formattedDuration} total duration</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Avg Track Length</CardTitle>
            <Database className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {Math.floor(stats.music.averageDuration / 60)}:
              {(stats.music.averageDuration % 60).toString().padStart(2, "0")}
            </div>
            <p className="text-xs text-muted-foreground">Minutes:Seconds</p>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="overview" className="w-full">
        <TabsList>
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="blob">Blob Storage</TabsTrigger>
          <TabsTrigger value="files">File Types</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Card>
              <CardHeader>
                <CardTitle>Storage Providers</CardTitle>
                <CardDescription>Active storage solutions</CardDescription>
              </CardHeader>
              <CardContent className="space-y-2">
                {stats.summary.storageProviders.map((provider) => (
                  <div key={provider} className="flex items-center justify-between">
                    <span>{provider}</span>
                    <Badge variant="outline">Active</Badge>
                  </div>
                ))}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>File Distribution</CardTitle>
                <CardDescription>Files by type</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Music className="h-4 w-4" />
                    <span>Audio Files</span>
                  </div>
                  <span className="font-medium">{stats.redis.audioFiles}</span>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Video className="h-4 w-4" />
                    <span>Video Files</span>
                  </div>
                  <span className="font-medium">{stats.redis.videoFiles}</span>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <ImageIcon className="h-4 w-4" />
                    <span>Image Files</span>
                  </div>
                  <span className="font-medium">{stats.redis.imageFiles}</span>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="blob" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Vercel Blob Storage</CardTitle>
              <CardDescription>Files stored in Vercel Blob</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="text-muted-foreground">Total Files:</span>
                    <span className="ml-2 font-medium">{stats.blob.totalFiles}</span>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Total Size:</span>
                    <span className="ml-2 font-medium">{stats.blob.formattedSize}</span>
                  </div>
                </div>

                {stats.blob.files.length > 0 && (
                  <div className="space-y-2">
                    <h4 className="font-medium">Recent Files</h4>
                    <div className="space-y-1 max-h-40 overflow-y-auto">
                      {stats.blob.files.slice(0, 10).map((file, index) => (
                        <div key={index} className="flex items-center justify-between text-sm p-2 bg-muted rounded">
                          <span className="truncate">{file.pathname}</span>
                          <span className="text-muted-foreground">{(file.size / 1024).toFixed(1)} KB</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="files" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Music className="h-5 w-5" />
                  Audio Files
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold">{stats.redis.audioFiles}</div>
                <p className="text-sm text-muted-foreground">Music tracks and audio</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Video className="h-5 w-5" />
                  Video Files
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold">{stats.redis.videoFiles}</div>
                <p className="text-sm text-muted-foreground">Generated videos</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <ImageIcon className="h-5 w-5" />
                  Image Files
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold">{stats.redis.imageFiles}</div>
                <p className="text-sm text-muted-foreground">Thumbnails and covers</p>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  )
}
