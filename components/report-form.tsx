"use client"

import type React from "react"
import { useState, useRef } from "react"
import { useRouter } from "next/navigation"
import Image from "next/image"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Spinner } from "@/components/ui/spinner"
import { createClient } from "@/lib/supabase/client"
import { getCurrentLocation, formatCoordinates } from "@/lib/utils/geolocation"
import { useToast } from "@/hooks/use-toast"
import { Upload, MapPin, X } from "lucide-react"

export function ReportForm() {
  const [description, setDescription] = useState("")
  const [image, setImage] = useState<File | null>(null)
  const [imagePreview, setImagePreview] = useState<string | null>(null)
  const [latitude, setLatitude] = useState<number | null>(null)
  const [longitude, setLongitude] = useState<number | null>(null)
  const [isLoadingLocation, setIsLoadingLocation] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const router = useRouter()
  const { toast } = useToast()
  const supabase = createClient()
  const isMobile = typeof navigator !== "undefined" && /Android|iPhone|iPad|iPod/i.test(navigator.userAgent)

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      setImage(file)
      setImagePreview(URL.createObjectURL(file))
    }
  }

  const handleGetLocation = async () => {
    setIsLoadingLocation(true)
    try {
      const { latitude: lat, longitude: lon } = await getCurrentLocation()
      setLatitude(lat)
      setLongitude(lon)
      toast({ title: "Location Captured", description: `${formatCoordinates(lat, lon)}` })
    } catch (error) {
      toast({ title: "Location Error", description: "Unable to get your location. Please enable geolocation in your browser.", variant: "destructive" })
    } finally {
      setIsLoadingLocation(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!description.trim()) {
      toast({ title: "Missing Description", description: "Please provide a description of the waste hotspot.", variant: "destructive" })
      return
    }
    if (latitude === null || longitude === null) {
      toast({ title: "Missing Location", description: "Please capture your location before submitting.", variant: "destructive" })
      return
    }
    setIsSubmitting(true)
    try {
      const { data: authData } = await supabase.auth.getUser()
      if (!authData.user) { router.push("/auth/login"); return }
      let imageUrl: string | null = null
      if (image) {
        const fileName = `${Date.now()}-${image.name.replace(/\s+/g, "-")}`
        const { error: uploadError } = await supabase.storage.from("waste-images").upload(fileName, image)
        if (uploadError) throw new Error(`Image upload failed: ${uploadError.message}`)
        const { data: publicUrlData } = supabase.storage.from("waste-images").getPublicUrl(fileName)
        imageUrl = publicUrlData.publicUrl
      }
      const { error: insertError } = await supabase.from("waste_reports").insert([{ user_id: authData.user.id, image_url: imageUrl, description, latitude, longitude, status: "open" }])
      if (insertError) throw new Error(`Failed to create report: ${insertError.message}`)
      toast({ title: "Report Submitted!", description: "Thank you for helping keep our community clean." })
      setDescription(""); setImage(null); setImagePreview(null); setLatitude(null); setLongitude(null)
      setTimeout(() => { router.push("/reports") }, 1500)
    } catch (error) {
      toast({ title: "Submission Error", description: error instanceof Error ? error.message : "An unexpected error occurred.", variant: "destructive" })
    } finally { setIsSubmitting(false) }
  }

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle>Report a Waste Hotspot</CardTitle>
        <CardDescription>Help us keep our community clean. Share details about waste you've spotted.</CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-2">
            <Label>Images</Label>
            <div onClick={() => fileInputRef.current?.click()} className="border-2 border-dashed border-border rounded-lg p-8 text-center cursor-pointer hover:border-primary hover:bg-primary/5 transition-colors">
              <input ref={fileInputRef} type="file" accept="image/*" {...(isMobile ? { capture: "environment" } : {})} onChange={handleImageChange} disabled={isSubmitting} className="hidden" />
              {imagePreview ? (
                <div className="space-y-4">
                  <div className="relative w-full h-40">
                    <Image src={imagePreview || "/placeholder.svg"} alt="Preview" fill className="object-contain" crossOrigin="anonymous" />
                  </div>
                  <Button type="button" variant="ghost" size="sm" onClick={(e) => { e.stopPropagation(); setImage(null); setImagePreview(null) }}>
                    <X className="w-4 h-4 mr-2" /> Remove Image
                  </Button>
                </div>
              ) : (
                <div className="space-y-2">
                  <Upload className="w-8 h-8 mx-auto text-muted-foreground" />
                  <p className="font-medium">Click to upload or drag and drop</p>
                  <p className="text-sm text-muted-foreground">PNG, JPG, GIF up to 10MB</p>
                </div>
              )}
            </div>
          </div>
          <div className="space-y-2">
            <Label htmlFor="description">Description (Optional)</Label>
            <Textarea id="description" placeholder="Describe the waste hotspot. Include type of waste, volume, and any relevant details..." value={description} onChange={(e) => setDescription(e.target.value)} disabled={isSubmitting} rows={4} className="resize-none" />
          </div>
          <div className="space-y-2">
            <Label>Location</Label>
            {latitude !== null && longitude !== null ? (
              <div className="flex items-center gap-2 p-3 bg-primary/5 rounded-lg border border-primary/20">
                <MapPin className="w-5 h-5 text-primary flex-shrink-0" />
                <span className="text-sm font-medium text-foreground">{formatCoordinates(latitude, longitude)}</span>
              </div>
            ) : (
              <Button type="button" variant="outline" onClick={handleGetLocation} disabled={isLoadingLocation || isSubmitting} className="w-full bg-transparent">
                {isLoadingLocation && <Spinner className="mr-2 h-4 w-4" />}
                {isLoadingLocation ? "Getting Location..." : "Capture My Location"}
              </Button>
            )}
          </div>
          <Button type="submit" className="w-full" disabled={isSubmitting}>
            {isSubmitting && <Spinner className="mr-2 h-4 w-4" />}
            {isSubmitting ? "Submitting..." : "Submit Report"}
          </Button>
        </form>
      </CardContent>
    </Card>
  )
}
