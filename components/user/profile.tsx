"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { useToast } from "@/hooks/use-toast"
import { Loader2, Music, Film } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import type { GeneratedMusic, GeneratedVideo } from "../music-video-creator"

// Add imports for the new components
import { ProfileBadges } from "./profile-badges"
import { ProfileRewards } from "./profile-rewards"

// Update the UserProfile interface to include badges and rewards
interface UserProfile {
  id: string
  username: string
  email: string
  profilePicture: string | null
  bio: string
  createdAt: string
  badges?: string[]
  rewards?: {
    unlimitedUntil?: string
    songGenerations?: number
    videoGenerations?: number
  }
}

export default function UserProfilePage() {
  const [profile, setProfile] = useState<UserProfile | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isEditing, setIsEditing] = useState(false)
  const [editedUsername, setEditedUsername] = useState("")
  const [editedBio, setEditedBio] = useState("")
  const [isSaving, setIsSaving] = useState(false)
  const [activeTab, setActiveTab] = useState("music")
  const [userMusic, setUserMusic] = useState<GeneratedMusic[]>([])
  const [userVideos, setUserVideos] = useState<GeneratedVideo[]>([])
  const { toast } = useToast()

  // Fetch user profile
  useEffect(() => {
    const fetchProfile = async () => {
      try {
        // In a real app, this would be an API call
        // For demo purposes, we'll simulate a profile
        await new Promise((resolve) => setTimeout(resolve, 1000)) // Simulate network delay

        // Update the demo profile to include badges and rewards
        const demoProfile: UserProfile = {
          id: "user-123",
          username: "MusicMaestro",
          email: "user@example.com",
          profilePicture: null,
          bio: "Music producer and creator. I love making beats and sharing my creations with the world!",
          createdAt: new Date().toISOString(),
          badges: ["almost-famous", "trending"],
          rewards: {
            unlimitedUntil: new Date(Date.now() + 1000 * 60 * 60 * 24 * 15).toISOString(), // 15 days from now
            songGenerations: 75,
            videoGenerations: 30,
          },
        }

        setProfile(demoProfile)
        setEditedUsername(demoProfile.username)
        setEditedBio(demoProfile.bio)

        // Fetch user content
        fetchUserContent()
      } catch (error) {
        console.error("Error fetching profile:", error)
        toast({
          title: "Error",
          description: "Failed to load profile. Please try again.",
          variant: "destructive",
        })
      } finally {
        setIsLoading(false)
      }
    }

    fetchProfile()
  }, [toast])

  // Fetch user content (music and videos)
  const fetchUserContent = async () => {
    try {
      // In a real app, this would be an API call
      // For demo purposes, we'll simulate content
      await new Promise((resolve) => setTimeout(resolve, 500)) // Simulate network delay

      // Demo music
      const demoMusic: GeneratedMusic[] = [
        {
          id: "music-1",
          title: "Summer Vibes",
          audioUrl: "https://samplelib.com/lib/preview/mp3/sample-15s.mp3",
          genre: "Pop",
          mood: "Happy",
          duration: 180,
          createdAt: new Date(),
        },
        {
          id: "music-2",
          title: "Midnight Dreams",
          audioUrl: "https://samplelib.com/lib/preview/mp3/sample-9s.mp3",
          genre: "Lo-Fi",
          mood: "Calm",
          duration: 210,
          createdAt: new Date(),
        },
      ]

      // Demo videos
      const demoVideos: GeneratedVideo[] = [
        {
          id: "video-1",
          title: "Summer Vibes - Music Video",
          videoUrl: "/api/stream-video/demo1",
          thumbnailUrl: "/api/video-thumbnail/demo1",
          musicId: "music-1",
          style: "Abstract Animation",
          createdAt: new Date(),
        },
      ]

      setUserMusic(demoMusic)
      setUserVideos(demoVideos)
    } catch (error) {
      console.error("Error fetching user content:", error)
    }
  }

  // Handle profile update
  const handleUpdateProfile = async () => {
    if (!profile) return

    setIsSaving(true)

    try {
      // In a real app, this would be an API call
      // For demo purposes, we'll simulate an update
      await new Promise((resolve) => setTimeout(resolve, 1000)) // Simulate network delay

      // Update local state
      setProfile({
        ...profile,
        username: editedUsername,
        bio: editedBio,
      })

      setIsEditing(false)

      toast({
        title: "Profile updated",
        description: "Your profile has been updated successfully.",
      })
    } catch (error) {
      console.error("Error updating profile:", error)
      toast({
        title: "Update failed",
        description: "Failed to update profile. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsSaving(false)
    }
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    )
  }

  if (!profile) {
    return (
      <div className="text-center py-8">
        <p>Failed to load profile. Please try again.</p>
        <Button onClick={() => window.location.reload()} className="mt-4">
          Retry
        </Button>
      </div>
    )
  }

  return (
    <div className="container py-6 space-y-6">
      <Card>
        <CardContent className="p-6">
          <div className="flex flex-col md:flex-row gap-6 items-start">
            <div className="flex flex-col items-center space-y-4">
              <Avatar className="h-24 w-24">
                <AvatarImage src={profile.profilePicture || ""} alt={profile.username} />
                <AvatarFallback className="text-2xl">{profile.username.charAt(0).toUpperCase()}</AvatarFallback>
              </Avatar>

              {!isEditing && (
                <Button variant="outline" onClick={() => setIsEditing(true)}>
                  Edit Profile
                </Button>
              )}
            </div>

            <div className="flex-1 space-y-4">
              {isEditing ? (
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="username">Username</Label>
                    <Input id="username" value={editedUsername} onChange={(e) => setEditedUsername(e.target.value)} />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="bio">Bio</Label>
                    <Textarea id="bio" value={editedBio} onChange={(e) => setEditedBio(e.target.value)} rows={4} />
                  </div>

                  <div className="flex gap-2">
                    <Button onClick={handleUpdateProfile} disabled={isSaving}>
                      {isSaving ? (
                        <>
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          Saving...
                        </>
                      ) : (
                        "Save Changes"
                      )}
                    </Button>
                    <Button variant="outline" onClick={() => setIsEditing(false)}>
                      Cancel
                    </Button>
                  </div>
                </div>
              ) : (
                <>
                  <div>
                    <h2 className="text-2xl font-bold">{profile.username}</h2>
                    <p className="text-muted-foreground">
                      Member since {new Date(profile.createdAt).toLocaleDateString()}
                    </p>
                  </div>

                  <div>
                    <h3 className="text-sm font-medium mb-1">Bio</h3>
                    <p>{profile.bio || "No bio yet."}</p>
                  </div>

                  <div className="flex gap-4">
                    <div>
                      <span className="text-lg font-bold">{userMusic.length}</span>
                      <p className="text-sm text-muted-foreground">Songs</p>
                    </div>
                    <div>
                      <span className="text-lg font-bold">{userVideos.length}</span>
                      <p className="text-sm text-muted-foreground">Videos</p>
                    </div>
                    <div>
                      <span className="text-lg font-bold">0</span>
                      <p className="text-sm text-muted-foreground">Followers</p>
                    </div>
                  </div>
                </>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      {profile.badges && profile.badges.length > 0 && (
        <div className="mt-4">
          <ProfileBadges badges={profile.badges} />
        </div>
      )}

      {profile.rewards && (
        <div className="mt-4">
          <ProfileRewards rewards={profile.rewards} />
        </div>
      )}

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="music" className="flex items-center gap-2">
            <Music className="h-4 w-4" />
            <span>My Music</span>
            <Badge variant="secondary" className="ml-1">
              {userMusic.length}
            </Badge>
          </TabsTrigger>
          <TabsTrigger value="videos" className="flex items-center gap-2">
            <Film className="h-4 w-4" />
            <span>My Videos</span>
            <Badge variant="secondary" className="ml-1">
              {userVideos.length}
            </Badge>
          </TabsTrigger>
        </TabsList>

        <TabsContent value="music" className="mt-6">
          {userMusic.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {userMusic.map((music) => (
                <Card key={music.id}>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-lg">{music.title}</CardTitle>
                    <CardDescription>Created {music.createdAt.toLocaleDateString()}</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="flex gap-2 mb-4">
                      <Badge variant="outline">{music.genre}</Badge>
                      <Badge variant="outline">{music.mood}</Badge>
                      <Badge variant="outline">
                        {`${Math.floor(music.duration / 60)}:${(music.duration % 60).toString().padStart(2, "0")}`}
                      </Badge>
                    </div>
                    <div className="bg-primary/10 rounded-md p-4 flex items-center justify-center cursor-pointer">
                      <Button variant="ghost" size="icon" className="h-12 w-12 text-primary">
                        <Music className="h-12 w-12" />
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            <Card className="flex flex-col items-center justify-center p-6 min-h-[200px]">
              <div className="text-center space-y-4">
                <Music className="h-16 w-16 text-primary/30 mx-auto" />
                <h3 className="text-xl font-medium">No Music Yet</h3>
                <p className="text-muted-foreground max-w-md">
                  You haven't created any music yet. Go to the Music Creator to get started!
                </p>
                <Button variant="default" onClick={() => (window.location.href = "/music")}>
                  Create Music
                </Button>
              </div>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="videos" className="mt-6">
          {userVideos.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {userVideos.map((video) => (
                <Card key={video.id}>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-lg">{video.title}</CardTitle>
                    <CardDescription>Created {video.createdAt.toLocaleDateString()}</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="flex gap-2 mb-4">
                      <Badge variant="outline">{video.style}</Badge>
                    </div>
                    <div className="aspect-video bg-black/20 rounded-md flex items-center justify-center overflow-hidden">
                      <img
                        src={video.thumbnailUrl || "/placeholder.svg"}
                        alt={video.title}
                        className="w-full h-full object-cover"
                      />
                      <Button variant="ghost" size="icon" className="h-16 w-16 text-primary absolute">
                        <Film className="h-16 w-16" />
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            <Card className="flex flex-col items-center justify-center p-6 min-h-[200px]">
              <div className="text-center space-y-4">
                <Film className="h-16 w-16 text-primary/30 mx-auto" />
                <h3 className="text-xl font-medium">No Videos Yet</h3>
                <p className="text-muted-foreground max-w-md">
                  You haven't created any videos yet. Create music first, then generate videos!
                </p>
                <Button variant="default" onClick={() => (window.location.href = "/music")}>
                  Create Music
                </Button>
              </div>
            </Card>
          )}
        </TabsContent>
      </Tabs>
    </div>
  )
}
