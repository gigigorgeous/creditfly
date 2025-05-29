"use client"

import type React from "react"

import { useState, useRef } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Slider } from "@/components/ui/slider"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { useToast } from "@/hooks/use-toast"
import { Loader2, Upload, RefreshCw, Wand2, ImageIcon } from "lucide-react"

interface ProcessedFace {
  sourceImageUrl: string
  targetImageUrl: string | null
  resultImageUrl: string
  processingMode: string
}

export function FaceProcessing() {
  const [sourceImage, setSourceImage] = useState<File | null>(null)
  const [targetImage, setTargetImage] = useState<File | null>(null)
  const [sourcePreview, setSourcePreview] = useState<string | null>(null)
  const [targetPreview, setTargetPreview] = useState<string | null>(null)
  const [processedFace, setProcessedFace] = useState<ProcessedFace | null>(null)
  const [processingMode, setProcessingMode] = useState<string>("enhance")
  const [enhancementLevel, setEnhancementLevel] = useState<number[]>([1.0])
  const [isProcessing, setIsProcessing] = useState(false)
  const [activeTab, setActiveTab] = useState<string>("upload")

  const sourceInputRef = useRef<HTMLInputElement>(null)
  const targetInputRef = useRef<HTMLInputElement>(null)
  const { toast } = useToast()

  const handleSourceImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0]
      setSourceImage(file)

      // Create a preview URL
      const reader = new FileReader()
      reader.onload = (e) => {
        setSourcePreview(e.target?.result as string)
      }
      reader.readAsDataURL(file)
    }
  }

  const handleTargetImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0]
      setTargetImage(file)

      // Create a preview URL
      const reader = new FileReader()
      reader.onload = (e) => {
        setTargetPreview(e.target?.result as string)
      }
      reader.readAsDataURL(file)
    }
  }

  const handleProcessFace = async () => {
    if (!sourceImage) {
      toast({
        title: "Source image required",
        description: "Please upload a source image to process",
        variant: "destructive",
      })
      return
    }

    if (processingMode === "swap" && !targetImage) {
      toast({
        title: "Target image required",
        description: "Please upload a target image for face swapping",
        variant: "destructive",
      })
      return
    }

    setIsProcessing(true)

    try {
      const formData = new FormData()
      formData.append("sourceImage", sourceImage)
      formData.append("mode", processingMode)
      formData.append("enhancementLevel", enhancementLevel[0].toString())

      if (targetImage) {
        formData.append("targetImage", targetImage)
      }

      const response = await fetch("/api/face-processing", {
        method: "POST",
        body: formData,
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.message || "Failed to process face")
      }

      const result = await response.json()
      setProcessedFace(result)
      setActiveTab("result")

      toast({
        title: "Face processed successfully",
        description: processingMode === "enhance" ? "Face enhancement complete" : "Face swap complete",
      })
    } catch (error) {
      console.error("Error processing face:", error)
      toast({
        title: "Processing failed",
        description: error instanceof Error ? error.message : "There was an error processing the face",
        variant: "destructive",
      })
    } finally {
      setIsProcessing(false)
    }
  }

  const handleReset = () => {
    setSourceImage(null)
    setTargetImage(null)
    setSourcePreview(null)
    setTargetPreview(null)
    setProcessedFace(null)
    setActiveTab("upload")
  }

  return (
    <div className="container py-6 space-y-6">
      <div className="flex flex-col space-y-2">
        <h2 className="text-2xl font-bold tracking-tight">Face Processing</h2>
        <p className="text-muted-foreground">Enhance faces or swap them for your music videos</p>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="upload" className="flex items-center gap-2">
            <Upload className="h-4 w-4" />
            <span>Upload</span>
          </TabsTrigger>
          <TabsTrigger value="result" className="flex items-center gap-2" disabled={!processedFace}>
            <ImageIcon className="h-4 w-4" />
            <span>Result</span>
          </TabsTrigger>
        </TabsList>

        <TabsContent value="upload" className="space-y-6 mt-6">
          <Card>
            <CardHeader>
              <CardTitle>Upload Face Images</CardTitle>
              <CardDescription>Upload a face to enhance or two faces to swap</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-4">
                <Label>Processing Mode</Label>
                <Select value={processingMode} onValueChange={setProcessingMode}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select mode" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="enhance">Face Enhancement</SelectItem>
                    <SelectItem value="swap">Face Swap</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-4">
                  <Label htmlFor="sourceImage">Source Face</Label>
                  <div
                    className="border-2 border-dashed rounded-md p-4 text-center cursor-pointer hover:bg-muted/50 transition-colors"
                    onClick={() => sourceInputRef.current?.click()}
                  >
                    {sourcePreview ? (
                      <div className="relative aspect-square max-h-[200px] mx-auto">
                        <img
                          src={sourcePreview || "/placeholder.svg"}
                          alt="Source face preview"
                          className="object-contain max-h-[200px] mx-auto rounded-md"
                        />
                      </div>
                    ) : (
                      <div className="py-8 flex flex-col items-center gap-2">
                        <Upload className="h-8 w-8 text-muted-foreground" />
                        <p className="text-sm text-muted-foreground">Click to upload source face</p>
                      </div>
                    )}
                    <Input
                      ref={sourceInputRef}
                      id="sourceImage"
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={handleSourceImageChange}
                    />
                  </div>
                </div>

                {processingMode === "swap" && (
                  <div className="space-y-4">
                    <Label htmlFor="targetImage">Target Face</Label>
                    <div
                      className="border-2 border-dashed rounded-md p-4 text-center cursor-pointer hover:bg-muted/50 transition-colors"
                      onClick={() => targetInputRef.current?.click()}
                    >
                      {targetPreview ? (
                        <div className="relative aspect-square max-h-[200px] mx-auto">
                          <img
                            src={targetPreview || "/placeholder.svg"}
                            alt="Target face preview"
                            className="object-contain max-h-[200px] mx-auto rounded-md"
                          />
                        </div>
                      ) : (
                        <div className="py-8 flex flex-col items-center gap-2">
                          <Upload className="h-8 w-8 text-muted-foreground" />
                          <p className="text-sm text-muted-foreground">Click to upload target face</p>
                        </div>
                      )}
                      <Input
                        ref={targetInputRef}
                        id="targetImage"
                        type="file"
                        accept="image/*"
                        className="hidden"
                        onChange={handleTargetImageChange}
                      />
                    </div>
                  </div>
                )}
              </div>

              {processingMode === "enhance" && (
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <Label htmlFor="enhancementLevel">Enhancement Level</Label>
                    <span className="text-sm text-muted-foreground">{enhancementLevel[0].toFixed(1)}x</span>
                  </div>
                  <Slider
                    id="enhancementLevel"
                    min={0.5}
                    max={2}
                    step={0.1}
                    value={enhancementLevel}
                    onValueChange={setEnhancementLevel}
                  />
                </div>
              )}
            </CardContent>
            <CardFooter className="flex justify-end gap-2">
              <Button variant="outline" onClick={handleReset} disabled={!sourceImage && !targetImage}>
                <RefreshCw className="h-4 w-4 mr-2" />
                Reset
              </Button>
              <Button
                onClick={handleProcessFace}
                disabled={isProcessing || !sourceImage || (processingMode === "swap" && !targetImage)}
              >
                {isProcessing ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Processing...
                  </>
                ) : (
                  <>
                    <Wand2 className="h-4 w-4 mr-2" />
                    Process Face
                  </>
                )}
              </Button>
            </CardFooter>
          </Card>
        </TabsContent>

        <TabsContent value="result" className="space-y-6 mt-6">
          {processedFace && (
            <Card>
              <CardHeader>
                <CardTitle>Processing Result</CardTitle>
                <CardDescription>
                  {processedFace.processingMode === "enhance" ? "Enhanced face image" : "Face swap result"}
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Source Image</Label>
                    <div className="border rounded-md p-2">
                      <img
                        src={processedFace.sourceImageUrl || "/placeholder.svg"}
                        alt="Source face"
                        className="object-contain max-h-[200px] mx-auto rounded-md"
                      />
                    </div>
                  </div>

                  {processedFace.processingMode === "swap" && processedFace.targetImageUrl && (
                    <div className="space-y-2">
                      <Label>Target Image</Label>
                      <div className="border rounded-md p-2">
                        <img
                          src={processedFace.targetImageUrl || "/placeholder.svg"}
                          alt="Target face"
                          className="object-contain max-h-[200px] mx-auto rounded-md"
                        />
                      </div>
                    </div>
                  )}
                </div>

                <div className="space-y-2">
                  <Label>Result</Label>
                  <div className="border rounded-md p-2">
                    <img
                      src={processedFace.resultImageUrl || "/placeholder.svg"}
                      alt="Processed face result"
                      className="object-contain max-h-[300px] mx-auto rounded-md"
                    />
                  </div>
                </div>
              </CardContent>
              <CardFooter className="flex justify-between">
                <Button variant="outline" onClick={handleReset}>
                  <RefreshCw className="h-4 w-4 mr-2" />
                  Process Another Face
                </Button>
                <Button onClick={() => window.open(processedFace.resultImageUrl, "_blank")}>
                  <ImageIcon className="h-4 w-4 mr-2" />
                  View Full Size
                </Button>
              </CardFooter>
            </Card>
          )}
        </TabsContent>
      </Tabs>
    </div>
  )
}
