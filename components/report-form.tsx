
"use client"

import type React from "react"
import { useState, useRef } from "react"
import { useRouter } from "next/navigation"
import Image from "next/image"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Spinner } from "@/components/ui/spinner"
import { createClient } from "@/lib/supabase/client"
import { useToast } from "@/hooks/use-toast"
import { Upload, X } from "lucide-react"

export function ReportForm() {
  const [description, setDescription] = useState("")
  const [images, setImages] = useState<File[]>([])
  const [imagePreviews, setImagePreviews] = useState<string[]>([])
  const [latitude, setLatitude] = useState<number | null>(null)
  const [longitude, setLongitude] = useState<number | null>(null)
  const [locationAddress, setLocationAddress] = useState<string>("")
  const [isLoadingLocation, setIsLoadingLocation] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const router = useRouter()
  const { toast } = useToast()
  const supabase = createClient()
  const isMobile = typeof navigator !== "undefined" && /Android|iPhone|iPad|iPod/i.test(navigator.userAgent)
  const MAX_IMAGES = 5

  const getCurrentLocation = (): Promise<{ latitude: number; longitude: number }> => {
    return new Promise((resolve, reject) => {
      if (!navigator.geolocation) {
        reject(new Error("Geolocation not supported"))
      } else {
        navigator.geolocation.getCurrentPosition(
          (position) => {
            const lat = position.coords.latitude
            const lon = position.coords.longitude
            
            console.log("Raw GPS data:", { lat, lon })
            console.log("Position object:", position.coords)
            
            resolve({
              latitude: lat,
              longitude: lon,
            })
          },
          (error) => {
            console.error("Geolocation error:", error)
            reject(error)
          },
          { 
            enableHighAccuracy: true, 
            timeout: 15000, 
            maximumAge: 0 
          }
        )
      }
    })
  }

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || [])
    if (files.length + images.length > MAX_IMAGES) {
      toast({
        title: "Too many images",
        description: `You can only upload up to ${MAX_IMAGES} images.`,
        variant: "destructive",
      })
      return
    }
    
    const newImages = [...images, ...files]
    const newPreviews = [...imagePreviews, ...files.map(f => URL.createObjectURL(f))]
    
    setImages(newImages)
    setImagePreviews(newPreviews)
  }

  const removeImage = (index: number) => {
    const newImages = images.filter((_, i) => i !== index)
    const newPreviews = imagePreviews.filter((_, i) => i !== index)
    URL.revokeObjectURL(imagePreviews[index])
    setImages(newImages)
    setImagePreviews(newPreviews)
  }

  const handleGetLocation = async () => {
    setIsLoadingLocation(true)
    try {
      const { latitude: lat, longitude: lon } = await getCurrentLocation()
      
      console.log("Raw coordinates:", { latitude: lat, longitude: lon })
      
      if (lat < -90 || lat > 90 || lon < -180 || lon > 180) {
        throw new Error("Invalid coordinates received")
      }

      setLatitude(lat)
      setLongitude(lon)

      const url = `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lon}&zoom=18&addressdetails=1`
      console.log("Reverse geocoding URL:", url)
      
      const res = await fetch(url, {
        headers: {
          'User-Agent': 'CommunityWasteManagement/1.0'
        }
      })
      
      if (!res.ok) {
        throw new Error("Failed to fetch address")
      }

      const data = await res.json()
      console.log("Reverse geocoding result:", data)
      
      const address = data.display_name || `Lat: ${lat.toFixed(6)}, Lon: ${lon.toFixed(6)}`
      setLocationAddress(address)

      toast({
        title: "Location Captured",
        description: `${address}\n\nLat: ${lat.toFixed(6)}, Lon: ${lon.toFixed(6)}`,
      })
    } catch (error) {
      console.error("Location error:", error)
      toast({
        title: "Location Error",
        description: error instanceof Error ? error.message : "Unable to get your location. Please enable location services.",
        variant: "destructive",
      })
    } finally {
      setIsLoadingLocation(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (images.length === 0) {
      toast({ title: "Missing Images", description: "Please upload at least one image.", variant: "destructive" })
      return
    }
    if (latitude === null || longitude === null) {
      toast({ title: "Missing Location", description: "Please capture your location.", variant: "destructive" })
      return
    }
    setIsSubmitting(true)
    try {
      const { data: authData } = await supabase.auth.getUser()
      if (!authData.user) {
        router.push("/auth/login")
        return
      }

      const imageUrls: string[] = []
      for (const image of images) {
        const fileName = `${Date.now()}-${Math.random().toString(36).substring(7)}-${image.name.replace(/\s+/g, "-")}`
        const { error: uploadError } = await supabase.storage.from("waste-images").upload(fileName, image)
        if (uploadError) throw new Error(`Image upload failed: ${uploadError.message}`)
        const { data: publicUrlData } = supabase.storage.from("waste-images").getPublicUrl(fileName)
        imageUrls.push(publicUrlData.publicUrl)
      }

      const { error: insertError } = await supabase.from("waste_reports").insert([
        {
          user_id: authData.user.id,
          image_url: JSON.stringify(imageUrls),
          description: description.trim() || "No description provided",
          latitude,
          longitude,
          location_address: locationAddress,
          status: "open",
        },
      ])
      if (insertError) throw new Error(`Failed to create report: ${insertError.message}`)

      toast({ title: "Report Submitted!", description: "Thank you for helping keep our community clean." })

      imagePreviews.forEach(preview => URL.revokeObjectURL(preview))
      setDescription(""); setImages([]); setImagePreviews([]); setLatitude(null); setLongitude(null); setLocationAddress("")
      setTimeout(() => { router.push("/reports") }, 1500)
    } catch (error) {
      toast({ title: "Submission Error", description: error instanceof Error ? error.message : "An unexpected error occurred.", variant: "destructive" })
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle>Report a Waste Hotspot</CardTitle>
        <CardDescription>Help us keep our community clean. Share details about waste you've spotted.</CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">

          {/* Image Upload */}
          <div className="space-y-2">
            <Label>Images (Max. {MAX_IMAGES})</Label>
            <p className="text-sm text-red-500 dark:text-yellow-400 font-normal">Note: Images not be of different locations.</p>
            {imagePreviews.length > 0 && (
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-4">
                {imagePreviews.map((preview, index) => (
                  <div key={index} className="relative aspect-square group">
                    <Image src={preview} alt={`Preview ${index + 1}`} fill className="object-cover rounded-lg" crossOrigin="anonymous" />
                    <Button
                      type="button"
                      variant="destructive"
                      size="icon"
                      className="absolute top-2 right-2 h-6 w-6 opacity-0 group-hover:opacity-100 transition-opacity"
                      onClick={() => removeImage(index)}
                    >
                      <X className="w-4 h-4" />
                    </Button>
                  </div>
                ))}
              </div>
            )}
            {images.length < MAX_IMAGES && (
              <div onClick={() => fileInputRef.current?.click()} className="border-2 border-dashed border-border rounded-lg p-8 text-center cursor-pointer hover:border-primary hover:bg-primary/5 transition-colors">
                <input ref={fileInputRef} type="file" accept="image/*" multiple {...(isMobile ? { capture: "environment" } : {})} onChange={handleImageChange} disabled={isSubmitting} className="hidden" />
                <div className="space-y-2">
                  <Upload className="w-8 h-8 mx-auto text-muted-foreground" />
                  <p className="font-medium">Click to upload images</p>
                  <p className="text-sm text-muted-foreground">{images.length}/{MAX_IMAGES} images • PNG, JPG, GIF up to 10MB each</p>
                </div>
              </div>
            )}
          </div>

          {/* Description */}
          <div className="space-y-2">
            <Label htmlFor="description">Description (Optional)</Label>
            <Textarea id="description" placeholder="Describe the waste hotspot..." value={description} onChange={(e) => setDescription(e.target.value)} disabled={isSubmitting} rows={4} className="resize-none" />
          </div>

          {/* Location */}
          <div className="space-y-2">
            <Label>Location</Label>
            {latitude !== null && longitude !== null ? (
              <div className="flex items-center gap-2 p-3 bg-primary/5 rounded-lg border border-primary/20">
                <span className="text-sm font-medium text-foreground">{locationAddress}</span>
              </div>
            ) : (
              <Button type="button" variant="outline" onClick={handleGetLocation} disabled={isLoadingLocation || isSubmitting} className="w-full bg-transparent">
                {isLoadingLocation && <Spinner className="mr-2 h-4 w-4" />}
                {isLoadingLocation ? "Getting Location..." : "Capture My Location"}
              </Button>
            )}
          </div>

          {/* Submit */}
          <Button type="submit" className="w-full" disabled={isSubmitting}>
            {isSubmitting && <Spinner className="mr-2 h-4 w-4" />}
            {isSubmitting ? "Submitting..." : "Submit Report"}
          </Button>
        </form>
      </CardContent>
    </Card>
  )
}


