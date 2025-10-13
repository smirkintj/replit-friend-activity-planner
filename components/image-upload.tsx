"use client"

import type React from "react"
import { useState, useRef } from "react"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Button } from "@/components/ui/button"
import { Loader2, Upload, Crop } from "lucide-react"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
import { Slider } from "@/components/ui/slider"

interface ImageUploadProps {
  currentImageUrl?: string
  onImageUploaded: (url: string) => void
  fallbackText?: string
}

export function ImageUpload({ currentImageUrl, onImageUploaded, fallbackText = "?" }: ImageUploadProps) {
  const [uploading, setUploading] = useState(false)
  const [previewUrl, setPreviewUrl] = useState(currentImageUrl || "")
  const [showCropDialog, setShowCropDialog] = useState(false)
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const [imageSrc, setImageSrc] = useState<string>("")
  const [zoom, setZoom] = useState(1)
  const [position, setPosition] = useState({ x: 0, y: 0 })
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const imageRef = useRef<HTMLImageElement>(null)
  const isDragging = useRef(false)
  const dragStart = useRef({ x: 0, y: 0 })

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    setSelectedFile(file)
    const reader = new FileReader()
    reader.onload = (event) => {
      setImageSrc(event.target?.result as string)
      setShowCropDialog(true)
      setZoom(1)
      setPosition({ x: 0, y: 0 })
    }
    reader.readAsDataURL(file)
  }

  const handleMouseDown = (e: React.MouseEvent) => {
    isDragging.current = true
    dragStart.current = { x: e.clientX - position.x, y: e.clientY - position.y }
  }

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDragging.current) return
    setPosition({
      x: e.clientX - dragStart.current.x,
      y: e.clientY - dragStart.current.y,
    })
  }

  const handleMouseUp = () => {
    isDragging.current = false
  }

  const handleCropAndUpload = async () => {
    if (!canvasRef.current || !imageRef.current) return

    setUploading(true)

    try {
      const canvas = canvasRef.current
      const ctx = canvas.getContext("2d")
      if (!ctx) {
        throw new Error("Could not get canvas context")
      }

      const size = 400
      canvas.width = size
      canvas.height = size

      const img = imageRef.current
      const scale = zoom
      const offsetX = position.x
      const offsetY = position.y

      ctx.fillStyle = "#ffffff"
      ctx.fillRect(0, 0, size, size)

      ctx.save()
      ctx.translate(size / 2, size / 2)
      ctx.scale(scale, scale)
      ctx.translate(-size / 2 + offsetX / scale, -size / 2 + offsetY / scale)
      ctx.drawImage(img, 0, 0, size, size)
      ctx.restore()

      console.log("[v0] Canvas prepared, converting to blob")

      const blob = await new Promise<Blob>((resolve, reject) => {
        canvas.toBlob(
          (b) => {
            if (b) {
              resolve(b)
            } else {
              reject(new Error("Failed to convert canvas to blob"))
            }
          },
          "image/jpeg",
          0.9,
        )
      })

      console.log("[v0] Blob created, size:", blob.size)

      // Upload to Vercel Blob
      const formData = new FormData()
      formData.append("file", blob, selectedFile?.name || "cropped-image.jpg")

      console.log("[v0] Uploading to /api/upload")

      const response = await fetch("/api/upload", {
        method: "POST",
        body: formData,
      })

      console.log("[v0] Upload response status:", response.status)

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ error: "Unknown error" }))
        console.error("[v0] Upload failed:", errorData)
        throw new Error(errorData.error || `Upload failed with status ${response.status}`)
      }

      const data = await response.json()
      console.log("[v0] Upload successful:", data.url)

      setPreviewUrl(data.url)
      onImageUploaded(data.url)
      setShowCropDialog(false)
    } catch (error) {
      console.error("[v0] Upload error:", error)
      const errorMessage = error instanceof Error ? error.message : "Unknown error occurred"
      alert(`Failed to upload image: ${errorMessage}. Please try again.`)
    } finally {
      setUploading(false)
    }
  }

  return (
    <>
      <div className="space-y-3">
        <Label>Profile Image</Label>
        <div className="flex items-center gap-4">
          <Avatar className="h-20 w-20 border-2 border-border">
            <AvatarImage src={previewUrl || "/placeholder.svg"} alt="Preview" />
            <AvatarFallback>{fallbackText}</AvatarFallback>
          </Avatar>
          <div className="flex-1">
            <Input
              type="file"
              accept="image/*"
              onChange={handleFileChange}
              disabled={uploading}
              className="cursor-pointer"
            />
            <p className="text-xs text-muted-foreground mt-1">Upload and crop your image</p>
          </div>
          {uploading && <Loader2 className="h-4 w-4 animate-spin" />}
        </div>
      </div>

      <Dialog open={showCropDialog} onOpenChange={setShowCropDialog}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Crop className="h-5 w-5" />
              Crop & Resize Image
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div
              className="relative w-full h-80 bg-muted rounded-lg overflow-hidden cursor-move"
              onMouseDown={handleMouseDown}
              onMouseMove={handleMouseMove}
              onMouseUp={handleMouseUp}
              onMouseLeave={handleMouseUp}
            >
              {imageSrc && (
                <img
                  ref={imageRef}
                  src={imageSrc || "/placeholder.svg"}
                  alt="Crop preview"
                  className="absolute pointer-events-none"
                  style={{
                    transform: `translate(${position.x}px, ${position.y}px) scale(${zoom})`,
                    transformOrigin: "center",
                    width: "400px",
                    height: "400px",
                    objectFit: "contain", // Changed from "cover" to "contain" to prevent stretching
                  }}
                />
              )}
              <div className="absolute inset-0 border-2 border-dashed border-primary/50 pointer-events-none" />
            </div>
            <div className="space-y-2">
              <Label>Zoom: {zoom.toFixed(1)}x</Label>
              <Slider value={[zoom]} onValueChange={(v) => setZoom(v[0])} min={0.5} max={3} step={0.1} />
            </div>
            <p className="text-xs text-muted-foreground">Drag to reposition, use slider to zoom</p>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowCropDialog(false)} disabled={uploading}>
              Cancel
            </Button>
            <Button onClick={handleCropAndUpload} disabled={uploading}>
              {uploading ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Uploading...
                </>
              ) : (
                <>
                  <Upload className="h-4 w-4 mr-2" />
                  Upload
                </>
              )}
            </Button>
          </DialogFooter>
          <canvas ref={canvasRef} className="hidden" />
        </DialogContent>
      </Dialog>
    </>
  )
}
