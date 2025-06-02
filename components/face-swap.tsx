"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Loader2, Camera, Upload } from "lucide-react"
import { useToast } from "@/hooks/use-toast"

export function FaceSwap() {
  const [sourceImage, setSourceImage] = useState<File | null>(null)
  const [targetImage, setTargetImage] = useState<File | null>(null)
  const [isProcessing, setIsProcessing] = useState(false)
  const { toast } = useToast()

  const handleFileUpload = (file: File, type: "source" | "target") => {
    if (type === "source") {
      setSourceImage(file)
    } else {
      setTargetImage(file)
    }
  }

  const handleSwap = async () => {
    if (!sourceImage || !targetImage) {
      toast({
        title: "Images required",
        description: "Please upload both source and target images",
        variant: "destructive",
      })
      return
    }

    setIsProcessing(true)

    // Simulate processing
    setTimeout(() => {
      setIsProcessing(false)
      toast({
        title: "Face swap completed!",
        description: "Your face swap has been processed successfully.",
      })
    }, 5000)
  }

  return (
    <div className="container py-6 space-y-6">
      <div className="flex flex-col space-y-2">
        <h2 className="text-2xl font-bold tracking-tight">Face Swap</h2>
        <p className="text-muted-foreground">Swap faces between images using AI</p>
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Source Image</CardTitle>
            <CardDescription>Upload the face you want to use</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="border-2 border-dashed border-muted-foreground/25 rounded-lg p-6 text-center">
              <Upload className="mx-auto h-12 w-12 text-muted-foreground/50 mb-4" />
              <Label htmlFor="source-upload" className="cursor-pointer">
                <span className="text-sm font-medium">Click to upload source image</span>
                <input
                  id="source-upload"
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={(e) => e.target.files?.[0] && handleFileUpload(e.target.files[0], "source")}
                />
              </Label>
              {sourceImage && <p className="text-sm text-muted-foreground mt-2">{sourceImage.name}</p>}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Target Image</CardTitle>
            <CardDescription>Upload the image where you want to place the face</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="border-2 border-dashed border-muted-foreground/25 rounded-lg p-6 text-center">
              <Upload className="mx-auto h-12 w-12 text-muted-foreground/50 mb-4" />
              <Label htmlFor="target-upload" className="cursor-pointer">
                <span className="text-sm font-medium">Click to upload target image</span>
                <input
                  id="target-upload"
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={(e) => e.target.files?.[0] && handleFileUpload(e.target.files[0], "target")}
                />
              </Label>
              {targetImage && <p className="text-sm text-muted-foreground mt-2">{targetImage.name}</p>}
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardContent className="pt-6">
          <Button onClick={handleSwap} disabled={isProcessing} className="w-full" size="lg">
            {isProcessing ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Processing Face Swap...
              </>
            ) : (
              <>
                <Camera className="mr-2 h-4 w-4" />
                Start Face Swap
              </>
            )}
          </Button>
        </CardContent>
      </Card>
    </div>
  )
}
