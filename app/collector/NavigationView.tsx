"use client"

import { MapPin, Navigation as NavigationIcon, Clock, ArrowLeft, CheckCircle2, Trash2 } from "lucide-react"
import type { WasteReport } from "../types/waste"

import { useEffect, useState, useRef } from "react"
import polyline from "polyline"

interface NavigationViewProps {
  report: WasteReport
  onClose: () => void
  onMarkCollected: (reportId: string) => void
}

export function NavigationView({ report, onClose, onMarkCollected }: NavigationViewProps) {
  const handleMarkCollected = () => {
    onMarkCollected(report.id)
    onClose()
  }

  const apiKey = process.env.NEXT_PUBLIC_ORS_KEY as string

  const [distance, setDistance] = useState<string>("")
  const [eta, setEta] = useState<string>("")
  const mapRef = useRef<any>(null)
  const mapInitialized = useRef(false)


  useEffect(() => {
    const initMap = async () => {
      // Prevent multiple initializations
      if (mapInitialized.current) return
      
      // load leaflet only on client
      const L = (await import("leaflet")).default

      // set marker icons
      L.Icon.Default.mergeOptions({
        iconRetinaUrl: "/marker-icon-2x.png",
        iconUrl: "/marker-icon.png",
        shadowUrl: "/marker-shadow.png",
      })

      // Check if container exists and has _leaflet_id (already initialized)
      const container = document.getElementById("map")
      if (container && (container as any)._leaflet_id) {
        return
      }

      // map element
      mapRef.current = L.map("map").setView([report.latitude, report.longitude], 14)
      mapInitialized.current = true

      // tiles
      L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
        maxZoom: 19,
      }).addTo(mapRef.current)

      // get current location
      navigator.geolocation.getCurrentPosition(
        async (pos) => {
          // start coords
          const startLat = pos.coords.latitude
          const startLng = pos.coords.longitude

          // user marker
          L.marker([startLat, startLng]).addTo(mapRef.current).bindPopup("Your Location")

          // destination marker
          L.marker([report.latitude, report.longitude]).addTo(mapRef.current).bindPopup("Waste Location")

          // fetch route
          const res = await fetch(
            `https://api.openrouteservice.org/v2/directions/driving-car?api_key=${apiKey}&start=${startLng},${startLat}&end=${report.longitude},${report.latitude}`
          )

          const routeData = await res.json()

          const summary = routeData.features[0].properties.summary

          setDistance((summary.distance / 1000).toFixed(2) + " km")
          setEta(Math.round(summary.duration / 60) + " mins")

          // geometry may be encoded or plain coords
          let coords: [number, number][] = []

          if (routeData.features[0].geometry.type === "LineString") {
            // Direct coordinates from API
            coords = routeData.features[0].geometry.coordinates.map(
              (c: number[]) => [c[1], c[0]]
            )
          } else {
            // Fallback: encoded polyline
            const raw = polyline.decode(routeData.features[0].geometry)
            coords = raw.map((c: number[]) => [c[1], c[0]])
          }

          // draw route
          const routeLine = L.polyline(coords, { color: "green", weight: 5 }).addTo(mapRef.current)

          // zoom to route
          mapRef.current.fitBounds(routeLine.getBounds())
        },

        () => {
          const fallbackLat = 18.5204
          const fallbackLng = 73.8567

          L.marker([fallbackLat, fallbackLng]).addTo(mapRef.current).bindPopup("Default Location")
          L.marker([report.latitude, report.longitude]).addTo(mapRef.current)

          mapRef.current.setView([report.latitude, report.longitude], 14)
        }
      )

    }

    initMap()

    return () => {
      if (mapRef.current) {
        mapRef.current.remove()
        mapRef.current = null
        mapInitialized.current = false
      }
    }
  }, [report, apiKey])


  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <button onClick={onClose} className="flex items-center gap-2 text-gray-700 hover:text-[#0F7A20] transition-colors">
              <ArrowLeft className="w-5 h-5" />
              <span className="font-medium">Back to Dashboard</span>
            </button>

            <button
              onClick={handleMarkCollected}
              className="flex items-center gap-2 px-5 py-2 bg-[#0F7A20] text-white rounded-full hover:bg-[#0d6a1c] transition-colors"
            >
              <CheckCircle2 className="w-4 h-4" />
              Mark as Collected
            </button>
          </div>
        </div>
      </div>

      {/* Map Section */}
      <div className="h-[60vh] w-full relative">
        <div id="map" className="h-full w-full rounded-xl border" />
      </div>

      {/* Details Section */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          
          {/* Report Details */}
          <div className="lg:col-span-2 bg-white rounded-2xl border-2 border-gray-100 shadow-sm p-6">
            <h2 className="text-2xl font-semibold text-gray-900 mb-6">Report Details</h2>

            <div className="space-y-4">
              <div>
                <label className="text-sm font-medium text-gray-500 block mb-1">Waste Type</label>
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-red-100 rounded-full flex items-center justify-center">
                    <Trash2 className="w-5 h-5 text-red-600" />
                  </div>
                  <p className="text-lg font-semibold text-gray-900">{report.description}</p>
                </div>
              </div>

              <div>
                <label className="text-sm font-medium text-gray-500 block mb-1">Location</label>
                <div className="flex items-start gap-2 text-gray-700">
                  <MapPin className="w-5 h-5 mt-0.5 text-[#0F7A20]" />
                  <p className="text-lg">{report.location}</p>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium text-gray-500 block mb-1">Date Reported</label>
                  <p className="text-gray-900">{report.date}</p>
                </div>

                <div>
                  <label className="text-sm font-medium text-gray-500 block mb-1">Time Reported</label>
                  <p className="text-gray-900">{report.time}</p>
                </div>
              </div>

              <div>
                <label className="text-sm font-medium text-gray-500 block mb-1">Status</label>
                <span className="inline-flex px-4 py-1.5 border-2 border-[#0F7A20] text-[#0F7A20] rounded-full text-sm font-medium">
                  {report.status}
                </span>
              </div>

              <div className="pt-4 border-t border-gray-200">
                <label className="text-sm font-medium text-gray-500 block mb-2">GPS Coordinates</label>
                <div className="bg-gray-50 rounded-xl p-4 font-mono text-sm text-gray-700">
                  <p>Lat: {report.latitude}</p>
                  <p>Lng: {report.longitude}</p>
                </div>
              </div>
            </div>
          </div>

          {/* Navigation Info */}
          <div className="space-y-4">
            <div className="bg-gradient-to-br from-green-50 to-white rounded-2xl border-2 border-green-100 shadow-sm p-6">
              <h3 className="font-semibold text-gray-900 mb-4">Navigation Info</h3>

              <div className="space-y-4">
                <div className="bg-white rounded-xl p-4 border border-gray-200">
                  <div className="flex items-center gap-2 text-gray-600 mb-2">
                    <NavigationIcon className="w-5 h-5 text-[#0F7A20]" />
                    <span className="text-sm font-medium">Distance</span>
                  </div>
                  <p className="text-3xl font-bold text-gray-900">{distance || "Calculating..."}</p>
                </div>

                <div className="bg-white rounded-xl p-4 border border-gray-200">
                  <div className="flex items-center gap-2 text-gray-600 mb-2">
                    <Clock className="w-5 h-5 text-[#0F7A20]" />
                    <span className="text-sm font-medium">Estimated Time</span>
                  </div>
                  <p className="text-3xl font-bold text-gray-900">{eta || "Calculating..."}</p>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-2xl border-2 border-gray-100 shadow-sm p-6">
              <h3 className="font-semibold text-gray-900 mb-4">Quick Actions</h3>

              <div className="space-y-3">
                <button className="w-full px-4 py-3 bg-blue-50 text-blue-700 rounded-xl hover:bg-blue-100 transition-colors font-medium text-left flex items-center gap-3">
                  <NavigationIcon className="w-5 h-5" />
                  Open in Maps App
                </button>

                <button className="w-full px-4 py-3 bg-gray-50 text-gray-700 rounded-xl hover:bg-gray-100 transition-colors font-medium text-left flex items-center gap-3">
                  <MapPin className="w-5 h-5" />
                  Share Location
                </button>
              </div>
            </div>

          </div>
        </div>
      </div>
    </div>
  )
}
