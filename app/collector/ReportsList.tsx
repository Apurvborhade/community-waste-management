import { MapPin, Calendar, Clock, CheckCircle2, Navigation } from 'lucide-react';
import Image from 'next/image';
import type { WasteReport } from "../types/waste";
import { useEffect, useState } from 'react';

interface ReportsListProps {
  reports: WasteReport[];
  selectedReportId: string | null;
  onShowRoute: (reportId: string) => void;
  onMarkCollected: (reportId: string) => void;
  onMarkRejected: (reportId: string) => void;
  filter: "all" | "nearest";
}

export function ReportsList({
  reports,
  selectedReportId,
  onShowRoute,
  onMarkCollected,
  onMarkRejected,
  filter,
}: ReportsListProps) {
  const [userLocation, setUserLocation] = useState<{ lat: number; lng: number } | null>(null)
  const [distances, setDistances] = useState<{ [key: string]: { distance: string; time: string } }>({})

  useEffect(() => {
    // Get user's current location
    navigator.geolocation.getCurrentPosition(
      (position) => {
        const location = {
          lat: position.coords.latitude,
          lng: position.coords.longitude,
        }
        setUserLocation(location)
        calculateDistances(location)
      },
      (error) => {
        console.error('Error getting location:', error)
      }
    )
  }, [reports])

  const calculateDistances = async (userLoc: { lat: number; lng: number }) => {
    const distanceData: { [key: string]: { distance: string; time: string } } = {}

    for (const report of reports) {
      // Calculate straight-line distance using Haversine formula
      const R = 6371 // Earth's radius in km
      const dLat = toRad(report.latitude - userLoc.lat)
      const dLon = toRad(report.longitude - userLoc.lng)
      const a =
        Math.sin(dLat / 2) * Math.sin(dLat / 2) +
        Math.cos(toRad(userLoc.lat)) *
          Math.cos(toRad(report.latitude)) *
          Math.sin(dLon / 2) *
          Math.sin(dLon / 2)
      const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))
      const distance = R * c

      // Estimate time (assuming average speed of 30 km/h in city)
      const timeInMinutes = Math.round((distance / 30) * 60)

      distanceData[report.id] = {
        distance: distance.toFixed(1) + ' km',
        time: timeInMinutes + ' min',
      }
    }

    setDistances(distanceData)
  }

  const toRad = (value: number) => (value * Math.PI) / 180

  // Parse image URLs from JSON string
  const getImageUrls = (imageUrl: string | null): string[] => {
    if (!imageUrl) return []
    try {
      const parsed = JSON.parse(imageUrl)
      return Array.isArray(parsed) ? parsed : [imageUrl]
    } catch {
      return [imageUrl]
    }
  }

  // Sort reports by distance if filter is "nearest"
  const sortedReports = filter === "nearest" 
    ? [...reports].sort((a, b) => {
        const distA = distances[a.id] ? parseFloat(distances[a.id].distance) : Infinity
        const distB = distances[b.id] ? parseFloat(distances[b.id].distance) : Infinity
        return distA - distB
      })
    : reports

  return (
    <div>
      <h2 className="text-2xl font-semibold text-gray-900 mb-6">
        {filter === "nearest" ? "Nearest Reports" : "Open Reports"} ({sortedReports.length})
      </h2>

      {sortedReports.length === 0 ? (
        <div className="bg-green-50 border border-green-200 rounded-2xl p-8 text-center">
          <CheckCircle2 className="w-12 h-12 text-[#0F7A20] mx-auto mb-3" />
          <p className="text-gray-700 text-lg">All reports cleared!</p>
          <p className="text-gray-500 text-sm mt-1">Great work keeping the city clean.</p>
        </div>
      ) : (
        <div className="grid gap-6 grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
          {sortedReports.map((report) => (
            <div
              key={report.id}
              className="relative flex flex-col h-full bg-white rounded-2xl p-6 shadow-sm border-2 border-gray-100 hover:border-gray-200 transition-all"
            >
              {/* Image Gallery */}
              {(() => {
                const imageUrls = getImageUrls(report.image_url)
                return imageUrls.length > 0 && (
                  <div className="mb-4 relative">
                    <div className={`grid ${imageUrls.length === 1 ? "grid-cols-1" : imageUrls.length === 2 ? "grid-cols-2" : "grid-cols-3"} gap-2`}>
                      {imageUrls.slice(0, 3).map((url, idx) => (
                        <div key={idx} className="relative h-24 rounded-lg overflow-hidden bg-gray-100">
                          <Image
                            src={url}
                            alt={`Waste report ${idx + 1}`}
                            fill
                            className="object-cover"
                            crossOrigin="anonymous"
                          />
                        </div>
                      ))}
                    </div>
                    {imageUrls.length > 3 && (
                      <div className="absolute right-2 bottom-2 bg-black/60 text-white text-xs px-2 py-1 rounded-full z-10">
                        +{imageUrls.length - 3} more
                      </div>
                    )}
                  </div>
                )
              })()}

              {/* Header */}
              <div className="flex items-start justify-between mb-4 flex-1">
                <div className="flex-1 min-w-0">
                  <h3 className="font-semibold text-gray-900 text-lg mb-2 truncate">
                    {report.description}
                  </h3>
                  <div className="flex items-center gap-1.5 text-gray-600 text-sm mb-1">
                    <MapPin className="w-4 h-4 shrink-0" />
                    <span className="truncate">{report.location}</span>
                  </div>
                  {distances[report.id] && (
                    <div className="flex items-center gap-3 text-sm mt-2">
                      <div className="flex items-center gap-1.5 text-blue-600">
                        <Navigation className="w-4 h-4" />
                        <span className="font-medium">{distances[report.id].distance}</span>
                      </div>
                      <div className="flex items-center gap-1.5 text-blue-600">
                        <Clock className="w-4 h-4" />
                        <span className="font-medium">~{distances[report.id].time}</span>
                      </div>
                    </div>
                  )}
                </div>
                <span className="ml-2 px-3 py-1 border-2 border-[#0F7A20] text-[#0F7A20] rounded-full text-xs font-medium shrink-0">
                  {report.status}
                </span>
              </div>

              {/* Date/Time */}
              <div className="flex items-center gap-4 text-sm text-gray-500 mb-4">
                <div className="flex items-center gap-1.5">
                  <Calendar className="w-4 h-4" />
                  <span>{report.date}</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <Clock className="w-4 h-4" />
                  <span>{report.time}</span>
                </div>
              </div>

              {/* Actions */}
              <div className="flex flex-col gap-2 mt-auto w-full">
                <div className="flex gap-2 w-full">
                  <button
                    onClick={() => onShowRoute(report.id)}
                    className="flex-1 flex items-center justify-center px-4 py-2 bg-[#0F7A20] text-white rounded-full hover:bg-[#0d6a1c] transition-colors font-medium"
                  >
                    Show Route
                  </button>
                </div>
                <div className="flex gap-2 w-full">
                  <button
                    onClick={() => onMarkCollected(report.id)}
                    className="flex-1 flex items-center justify-center px-4 py-2 bg-white border-2 border-green-600 text-green-700 rounded-full hover:bg-green-50 transition-colors font-medium"
                  >
                    Mark Collected
                  </button>
                  <button
                    onClick={() => onMarkRejected(report.id)}
                    className="flex-1 flex items-center justify-center px-4 py-2 bg-white border-2 border-red-500 text-red-700 rounded-full hover:bg-red-50 transition-colors font-medium"
                  >
                    Mark Rejected
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}