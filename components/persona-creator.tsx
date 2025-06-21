"use client"

import { CardFooter } from "@/components/ui/card"

import type React from "react"

import { useState, useRef } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import { Upload, User, Wand2, ImageIcon, Music, Trash2, PlusCircle, Loader2 } from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import { v4 as uuidv4 } from "uuid"
import { useRouter } from "next/navigation"

const PERSONA_STYLES = [
  "Pop Star",
  "Rock Icon",
  "Hip-Hop Artist",
  "Electronic DJ",
  "Classical Virtuoso",
  "Country Singer",
  "R&B Vocalist",
  "Jazz Performer",
  "Indie Artist",
  "K-Pop Idol",
]

export type PersonaImage = {
  id: string
  url: string
  type: "face" | "full-body" | "performance" | "other"
}

export type Persona = {
  id: string
  name: string
  description: string
  style: string
  images: PersonaImage[]
  createdAt: Date
}

interface PersonaCreatorProps {
  onPersonaCreated?: (persona: Persona) => void
  existingPersonas?: Persona[]
}

export function PersonaCreator({ onPersonaCreated, existingPersonas = [] }: PersonaCreatorProps) {
  const [name, setName] = useState("")
  const [description, setDescription] = useState("")
  const [style, setStyle] = useState("")
  const [images, setImages] = useState<PersonaImage[]>([])
  const [activeTab, setActiveTab] = useState("upload")
  const [isGenerating, setIsGenerating] = useState(false)
  const [previewPersona, setPreviewPersona] = useState<Persona | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const { toast } = useToast()
  const router = useRouter()

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files
    if (!files || files.length === 0) return

    const newImages: PersonaImage[] = []

    Array.from(files).forEach((file) => {
      // Create a URL for the uploaded file
      const url = URL.createObjectURL(file)

      newImages.push({
        id: uuidv4(),
        url,
        type: "face", // Default type, can be changed by user later
      })
    })

    setImages((prev) => [...prev, ...newImages])

    // Reset the file input
    if (fileInputRef.current) {
      fileInputRef.current.value = ""
    }
  }

  const handleRemoveImage = (id: string) => {
    setImages((prev) => prev.filter((img) => img.id !== id))
  }

  const handleUpdateImageType = (id: string, type: PersonaImage["type"]) => {
    setImages((prev) => prev.map((img) => (img.id === id ? { ...img, type } : img)))
  }

  const handleGenerate = async () => {
    if (!images || images.length === 0) {
      toast({
        title: "No Images",
        description: "Please upload at least one image to create a persona.",
        variant: "destructive",
      })
      return
    }

    setIsGenerating(true)

    try {
      // In a real implementation, you would call an API to process the images
      // and generate a consistent persona

      // Simulate API call with a delay
      await new Promise((resolve) => setTimeout(resolve, 2000))

      const newPersona: Persona = {
        id: uuidv4(),
        name: name || "Unnamed Persona",
        description: description || `An original ${style || "Pop Star"} persona`,
        style: style || "Pop Star",
        images: images,
        createdAt: new Date(),
      }

      setPreviewPersona(newPersona)

      toast({
        title: "Persona Created!",
        description: `Your ${style || "Pop Star"} persona "${name || "Unnamed Persona"}" is ready.`,
      })
    } catch (error) {
      console.error("Error creating persona:", error)
      toast({
        title: "Creation Failed",
        description: "There was an error creating your persona. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsGenerating(false)
    }
  }

  const handleSavePersona = () => {
    if (previewPersona && onPersonaCreated) {
      onPersonaCreated(previewPersona)

      // Reset form
      setName("")
      setDescription("")
      setStyle("")
      setImages([])
      setPreviewPersona(null)

      toast({
        title: "Persona Saved!",
        description: "Your persona has been added to your collection.",
      })
    }
  }

  const handleCreate = async () => {
    if (!name.trim() || !description.trim()) {
      toast({
        title: "Fields required",
        description: "Please fill in both name and description",
        variant: "destructive",
      })
      return
    }

    setIsGenerating(true)

    try {
      // Simulate creation
      await new Promise((resolve) => setTimeout(resolve, 3000))

      const newPersona: Persona = {
        id: uuidv4(),
        name: name.trim(),
        description: description.trim(),
        style: style || "Pop Star",
        images: [],
        createdAt: new Date(),
      }

      if (onPersonaCreated) {
        onPersonaCreated(newPersona)
      }

      // Reset form
      setName("")
      setDescription("")
      setStyle("")

      toast({
        title: "Persona created!",
        description: `${name} has been created successfully.`,
      })

      // Auto-navigate to video creation
      router.push("/studio?tab=video")
    } catch (error) {
      console.error("Error creating persona:", error)
      toast({
        title: "Creation Failed",
        description: "There was an error creating your persona. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsGenerating(false)
    }
  }

  // Ensure existingPersonas is always an array
  const safeExistingPersonas = Array.isArray(existingPersonas) ? existingPersonas : []

  return (
    <div className="container py-6 space-y-6">
      <div className="flex flex-col space-y-2">
        <h2 className="text-2xl font-bold tracking-tight">Persona Creator</h2>
        <p className="text-muted-foreground">Create your own original celebrity persona using your photos</p>
      </div>

      {previewPersona ? (
        <Card className="border-primary/20 bg-primary/5">
          <CardHeader>
            <CardTitle>Preview Your Generated Persona</CardTitle>
            <CardDescription>Review your persona before saving</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <h3 className="text-lg font-medium mb-2">{previewPersona.name}</h3>
                <p className="text-muted-foreground mb-4">{previewPersona.description}</p>
                <Badge variant="outline">{previewPersona.style}</Badge>
              </div>
              <div className="grid grid-cols-2 gap-2">
                {previewPersona.images &&
                  previewPersona.images.slice(0, 4).map((image) => (
                    <div key={image.id} className="relative aspect-square rounded-md overflow-hidden">
                      <img
                        src={image.url || "/placeholder.svg"}
                        alt={`${previewPersona.name} - ${image.type}`}
                        className="w-full h-full object-cover"
                      />
                      <Badge variant="secondary" className="absolute bottom-1 right-1 text-xs">
                        {image.type}
                      </Badge>
                    </div>
                  ))}
              </div>
            </div>
          </CardContent>
          <CardFooter className="flex justify-end gap-2">
            <Button variant="outline" onClick={() => setPreviewPersona(null)}>
              Edit
            </Button>
            <Button onClick={handleSavePersona}>Save Persona</Button>
          </CardFooter>
        </Card>
      ) : (
        <div className="space-y-6">
          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="upload" className="flex items-center gap-2">
                <Upload className="h-4 w-4" />
                <span>Upload Photos</span>
              </TabsTrigger>
              <TabsTrigger value="details" className="flex items-center gap-2">
                <User className="h-4 w-4" />
                <span>Persona Details</span>
              </TabsTrigger>
            </TabsList>

            <TabsContent value="upload" className="space-y-6 mt-6">
              <Card>
                <CardHeader>
                  <CardTitle>Upload Your Photos</CardTitle>
                  <CardDescription>Upload photos of yourself to create your celebrity persona</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div
                    className="grid place-items-center border-2 border-dashed rounded-lg p-12 cursor-pointer hover:bg-muted/50 transition-colors"
                    onClick={() => fileInputRef.current?.click()}
                  >
                    <div className="flex flex-col items-center gap-2 text-center">
                      <ImageIcon className="h-10 w-10 text-muted-foreground" />
                      <h3 className="font-medium">Click to upload photos</h3>
                      <p className="text-sm text-muted-foreground max-w-xs">
                        Upload clear photos of your face and full body for best results. We recommend at least 3
                        different photos.
                      </p>
                      <Input
                        ref={fileInputRef}
                        type="file"
                        accept="image/*"
                        multiple
                        className="hidden"
                        onChange={handleFileUpload}
                      />
                      <Button variant="secondary" size="sm" className="mt-2">
                        <Upload className="h-4 w-4 mr-2" />
                        <span>Select Files</span>
                      </Button>
                    </div>
                  </div>

                  {images && images.length > 0 && (
                    <div className="space-y-4">
                      <h3 className="font-medium">Uploaded Images ({images.length})</h3>
                      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
                        {images.map((image) => (
                          <div key={image.id} className="relative group">
                            <div className="aspect-square rounded-md overflow-hidden">
                              <img
                                src={image.url || "/placeholder.svg"}
                                alt="Uploaded image"
                                className="w-full h-full object-cover"
                              />
                            </div>
                            <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center justify-center p-2 rounded-md">
                              <Select
                                value={image.type}
                                onValueChange={(value) =>
                                  handleUpdateImageType(image.id, value as PersonaImage["type"])
                                }
                              >
                                <SelectTrigger className="h-8 text-xs bg-black/60 border-0 text-white">
                                  <SelectValue placeholder="Image type" />
                                </SelectTrigger>
                                <SelectContent>
                                  <SelectItem value="face">Face</SelectItem>
                                  <SelectItem value="full-body">Full Body</SelectItem>
                                  <SelectItem value="performance">Performance</SelectItem>
                                  <SelectItem value="other">Other</SelectItem>
                                </SelectContent>
                              </Select>
                              <Button
                                variant="destructive"
                                size="icon"
                                className="h-8 w-8 mt-2"
                                onClick={() => handleRemoveImage(image.id)}
                              >
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </div>
                            <Badge variant="secondary" className="absolute bottom-1 right-1 text-xs">
                              {image.type}
                            </Badge>
                          </div>
                        ))}
                        <div
                          className="aspect-square rounded-md border-2 border-dashed flex items-center justify-center cursor-pointer hover:bg-muted/50 transition-colors"
                          onClick={() => fileInputRef.current?.click()}
                        >
                          <PlusCircle className="h-8 w-8 text-muted-foreground" />
                        </div>
                      </div>
                    </div>
                  )}
                </CardContent>
                <CardFooter className="flex justify-between">
                  <Button
                    variant="outline"
                    onClick={() => setActiveTab("details")}
                    disabled={!images || images.length === 0}
                  >
                    Next: Persona Details
                  </Button>
                </CardFooter>
              </Card>
            </TabsContent>

            <TabsContent value="details" className="space-y-6 mt-6">
              <Card>
                <CardHeader>
                  <CardTitle>Persona Details</CardTitle>
                  <CardDescription>Define your celebrity persona's identity and style</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="name">Persona Name</Label>
                    <Input
                      id="name"
                      placeholder="Enter a stage name for your persona"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="style">Celebrity Style</Label>
                    <Select value={style} onValueChange={setStyle}>
                      <SelectTrigger id="style">
                        <SelectValue placeholder="Select celebrity style" />
                      </SelectTrigger>
                      <SelectContent>
                        {PERSONA_STYLES.map((s) => (
                          <SelectItem key={s} value={s}>
                            {s}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="description">Persona Description</Label>
                    <Textarea
                      id="description"
                      placeholder="Describe your persona's background, style, and personality"
                      value={description}
                      onChange={(e) => setDescription(e.target.value)}
                      className="min-h-[100px]"
                    />
                  </div>
                </CardContent>
                <CardFooter className="flex justify-between">
                  <Button variant="outline" onClick={() => setActiveTab("upload")}>
                    Back to Photos
                  </Button>
                  <Button onClick={handleGenerate} disabled={isGenerating || !images || images.length === 0}>
                    {isGenerating ? (
                      <div className="flex items-center gap-2">
                        <div className="animate-spin h-4 w-4 border-2 border-current border-t-transparent rounded-full"></div>
                        <span>Creating Persona...</span>
                      </div>
                    ) : (
                      <div className="flex items-center gap-2">
                        <Wand2 className="h-4 w-4" />
                        <span>Create Persona</span>
                      </div>
                    )}
                  </Button>
                </CardFooter>
              </Card>
            </TabsContent>
          </Tabs>

          <Card>
            <CardHeader>
              <CardTitle>Create New Persona</CardTitle>
              <CardDescription>Define the characteristics of your AI persona</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="name">Persona Name</Label>
                <Input
                  id="name"
                  placeholder="Enter persona name..."
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  placeholder="Describe the persona's appearance, personality, and characteristics..."
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="min-h-[150px]"
                />
              </div>

              <Button onClick={handleCreate} disabled={isGenerating} className="w-full">
                {isGenerating ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Creating Persona...
                  </>
                ) : (
                  <>
                    <User className="mr-2 h-4 w-4" />
                    Create Persona
                  </>
                )}
              </Button>
            </CardContent>
          </Card>
        </div>
      )}

      {safeExistingPersonas.length > 0 && (
        <div className="space-y-4">
          <h3 className="text-lg font-medium">Your Personas</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {safeExistingPersonas.map((persona) => (
              <Card key={persona.id}>
                <CardHeader className="pb-2">
                  <CardTitle className="text-lg">{persona.name}</CardTitle>
                  <CardDescription>Created {persona.createdAt.toLocaleDateString()}</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 gap-2 mb-4">
                    {persona.images &&
                      persona.images.slice(0, 4).map((image) => (
                        <div key={image.id} className="aspect-square rounded-md overflow-hidden">
                          <img
                            src={image.url || "/placeholder.svg"}
                            alt={`${persona.name} - ${image.type}`}
                            className="w-full h-full object-cover"
                          />
                        </div>
                      ))}
                  </div>
                  <Badge variant="outline">{persona.style}</Badge>
                </CardContent>
                <CardFooter>
                  <Button variant="outline" className="w-full">
                    <Music className="h-4 w-4 mr-2" />
                    <span>Use in Music Video</span>
                  </Button>
                </CardFooter>
              </Card>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
