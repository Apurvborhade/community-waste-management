"use client"

import { useEffect, useState, useRef } from "react"
import { ExternalLink } from "lucide-react"
import dynamic from "next/dynamic"
import { createClient } from "@/lib/supabase/client"

import "leaflet/dist/leaflet.css"

const MapContainer = dynamic(
  () => import("react-leaflet").then((m) => m.MapContainer),
  { ssr: false }
)
const TileLayer = dynamic(
  () => import("react-leaflet").then((m) => m.TileLayer),
  { ssr: false }
)
const CircleMarker = dynamic(
  () => import("react-leaflet").then((m) => m.CircleMarker),
  { ssr: false }
)

interface HeatmapCardProps {
  onViewFullMap: () => void
}

export function HeatmapCard({ onViewFullMap }: HeatmapCardProps) {
  const supabase = createClient()
  const mapRef = useRef<any>(null)
  const heatLayerRef = useRef<any>(null)

  const [points, setPoints] = useState<any[]>([])
  const [redDots, setRedDots] = useState<any[]>([])
  const [yellowDots, setYellowDots] = useState<any[]>([])
  const [leafletLoaded, setLeafletLoaded] = useState(false)

  const PUNE_BOUNDS = {
    minLat: 18.42, maxLat: 18.62,
    minLng: 73.75, maxLng: 73.95,
  }

  const generatePunePoints = (count: number) => {
    return Array.from({ length: count }).map(() => [
      Math.random() * (PUNE_BOUNDS.maxLat - PUNE_BOUNDS.minLat) + PUNE_BOUNDS.minLat,
      Math.random() * (PUNE_BOUNDS.maxLng - PUNE_BOUNDS.minLng) + PUNE_BOUNDS.minLng,
    ])
  }

  // 1. Load Leaflet and Heat Plugin
  useEffect(() => {
    async function initLeaflet() {
      const L = await import("leaflet")
      // @ts-ignore
      await import("leaflet.heat")
      // @ts-ignore
      window.L = L
      setLeafletLoaded(true)
    }
    initLeaflet()
  }, [])

  // 2. Load Data
  useEffect(() => {
    async function loadData() {
      const { data } = await supabase
        .from("waste_reports")
        .select("latitude, longitude")

      const dbPoints = data ? data.map((r) => [r.latitude, r.longitude, 0.8]) : []
      const heatBase = generatePunePoints(100).map(p => [...p, 0.4])
      
      setPoints([...dbPoints, ...heatBase])
      setRedDots(generatePunePoints(45))
      setYellowDots(generatePunePoints(80))
    }
    loadData()
  }, [supabase])

  // 3. Update Heatmap Layer whenever points or map changes
  useEffect(() => {
    const L = (window as any).L
    if (!leafletLoaded || !mapRef.current || !L || !L.heatLayer || points.length === 0) return

    // Remove existing heat layer if it exists to prevent duplication/errors
    if (heatLayerRef.current) {
      mapRef.current.removeLayer(heatLayerRef.current)
    }

    // Create and add new heat layer
    try {
      heatLayerRef.current = L.heatLayer(points, {
        radius: 35,
        blur: 20,
        maxZoom: 15,
      }).addTo(mapRef.current)
    } catch (error) {
      console.error("Error adding heatLayer:", error)
    }
  }, [points, leafletLoaded])

  return (
    <div className="bg-white rounded-2xl border shadow-sm mb-8 overflow-hidden">
      <div className="p-6 border-b flex items-center justify-between">
        <div>
          <h2 className="text-xl font-semibold text-gray-800">Pune Garbage Hotspots</h2>
          <p className="text-sm text-gray-500">Live density tracking - Strictly Pune Region</p>
        </div>
        <button
          onClick={onViewFullMap}
          className="flex items-center gap-2 px-4 py-2 bg-[#0F7A20] text-white rounded-full hover:bg-[#0b5e18] transition-all"
        >
          <ExternalLink className="w-4 h-4" />
          View Full Map
        </button>
      </div>

      <div className="relative h-96">
        {leafletLoaded && (
          <MapContainer
            center={[18.5204, 73.8567]}
            zoom={12}
            style={{ height: "100%", width: "100%" }}
            ref={mapRef} 
          >
            <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />

            {redDots.map((pos, idx) => (
              <CircleMarker
                key={`red-${idx}`}
                center={[pos[0], pos[1]]}
                pathOptions={{ color: '#b91c1c', fillColor: '#ef4444', fillOpacity: 0.9, weight: 1 }}
                radius={5}
              />
            ))}

            {yellowDots.map((pos, idx) => (
              <CircleMarker
                key={`yellow-${idx}`}
                center={[pos[0], pos[1]]}
                pathOptions={{ color: '#a16207', fillColor: '#facc15', fillOpacity: 0.8, weight: 1 }}
                radius={4}
              />
            ))}
          </MapContainer>
        )}

        <div className="absolute bottom-4 right-4 z-[1000] bg-white/90 p-2 rounded-lg border shadow-sm text-[10px] font-medium flex flex-col gap-1">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-red-500"></span> Critical Area
          </div>
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-yellow-400"></span> Moderate Area
          </div>
        </div>
      </div>
    </div>
  )
}