"use client"

import { useState, useEffect } from "react"
import Image from "next/image"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent } from "@/components/ui/card"
import { Empty } from "@/components/ui/empty"
import { MapPin, Calendar, User, CalendarDays } from "lucide-react"
import { createClient } from "@/lib/supabase/client"
import { formatCoordinates } from "@/lib/utils/geolocation"

type WasteReport = {
  id: string
  image_url: string | null
  description: string
  latitude: number
  longitude: number
  location_address: string | null
  status: "open" | "resolved"
  created_at: string
  user_id: string
  rank: number | null
  event: string | null
}

export function ReportsList() {
  const [reports, setReports] = useState<WasteReport[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [filter, setFilter] = useState<"all" | "open" | "resolved" | "rank" | "events">("all")

  useEffect(() => {
    const fetchReports = async () => {
      setIsLoading(true)
      try {
        const supabase = createClient()
        let query = supabase.from("waste_reports").select("*").order("created_at", { ascending: false })

        if (filter === "open" || filter === "resolved") {
          query = query.eq("status", filter)
        } else if (filter === "rank") {
          query = query.not("rank", "is", null).neq("rank", 0)
        } else if (filter === "events") {
          query = query.not("event", "is", null).neq("event", "")
        }

        const { data, error } = await query

        if (error) {
          console.error("Error fetching reports:", error)
        } else {
          console.log(`Filter: ${filter}, Results:`, data?.length)
          setReports(data || [])
        }
      } catch (error) {
        console.error("Error:", error)
      } finally {
        setIsLoading(false)
      }
    }

    fetchReports()
  }, [filter])

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })
  }

  if (isLoading) {
    return (
      <div className="space-y-4">
        {[...Array(3)].map((_, i) => (
          <Card key={i} className="animate-pulse">
            <CardContent className="pt-6">
              <div className="h-48 bg-muted rounded-lg" />
            </CardContent>
          </Card>
        ))}
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <Tabs value={filter} onValueChange={(v) => setFilter(v as "all" | "open" | "resolved" | "rank" | "events")}>
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="all">All Reports</TabsTrigger>
          <TabsTrigger value="open">Open</TabsTrigger>
          <TabsTrigger value="resolved">Resolved</TabsTrigger>
          <TabsTrigger value="rank">Rank</TabsTrigger>
          <TabsTrigger value="events">Events</TabsTrigger>
        </TabsList>

        <TabsContent value={filter} className="space-y-4">
          {reports.length === 0 ? (
            <Empty
              heading="No reports found"
              description={
                filter === "all"
                  ? "Be the first to report a waste hotspot in your community."
                  : `No ${filter} reports at this time. Check back soon!`
              }
            />
          ) : (
            <div className="grid gap-4">
              {reports.map((report) => (
                <Card key={report.id} className="overflow-hidden hover:shadow-md transition-shadow">
                  <CardContent className="p-0">
                    <div className="grid md:grid-cols-3 gap-4">
                      {/* Image */}
                      <div className="relative h-40 md:h-auto bg-muted overflow-hidden rounded-t-lg md:rounded-l-lg md:rounded-t-none">
                        {report.image_url ? (
                          <Image
                            src={report.image_url || "/placeholder.svg"}
                            alt="Waste report"
                            fill
                            className="object-cover"
                            crossOrigin="anonymous"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center text-muted-foreground">
                            No image
                          </div>
                        )}
                      </div>

                      {/* Details */}
                      <div className="md:col-span-2 p-4 flex flex-col justify-between">
                        <div className="space-y-3">
                          <div className="flex items-start justify-between gap-2">
                            <p className="text-sm text-foreground line-clamp-2 flex-1">{report.description}</p>
                            <Badge
                              variant={report.status === "open" ? "default" : "secondary"}
                              className="flex-shrink-0 capitalize"
                            >
                              {report.status}
                            </Badge>
                          </div>

                          {/* Location */}
                          <div className="flex items-center gap-2 text-sm text-muted-foreground">
                            <MapPin className="w-4 h-4 flex-shrink-0" />
                            <span className="line-clamp-1">{report.location_address || formatCoordinates(report.latitude, report.longitude)}</span>
                          </div>
                        </div>

                        {/* Footer */}
                        <div className="flex items-center gap-4 text-xs text-muted-foreground pt-3 border-t">
                          <div className="flex items-center gap-1">
                            <Calendar className="w-4 h-4" />
                            {formatDate(report.created_at)}
                          </div>
                          <div className="flex items-center gap-1">
                            <User className="w-4 h-4" />
                            Community Member
                          </div>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  )
}
