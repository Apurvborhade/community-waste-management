"use client"

import { useEffect, useState } from "react"
import { MapContainer, TileLayer } from "react-leaflet"
import "leaflet/dist/leaflet.css"
import "leaflet.heat"
import { createClient } from "@/lib/supabase/client"

export default function HeatmapMiniMap() {
  const supabase = createClient()
  const [points, setPoints] = useState<any[]>([])

  useEffect(() => {
    async function load() {
      const { data } = await supabase
        .from("waste_reports")
        .select("latitude, longitude")

      if (!data) return

      setPoints(data.map(r => [r.latitude, r.longitude, 0.6]))
    }

    load()
  }, [])

  return (
    <MapContainer
  center={[20.59, 78.96]}
  zoom={5}
  style={{ height: "100%", width: "100%" }}
  ref={(map) => {
    // @ts-ignore
    if (map) window.leafletMap = map
  }}
  whenReady={() => {
    // @ts-ignore
    L.heatLayer(points, { radius: 25, blur: 15 }).addTo(
      (window as any).leafletMap
    )
  }}
>
  <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
</MapContainer>

  )
}
