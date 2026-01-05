"use client"

import { useState, useEffect } from "react"
import Image from "next/image"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Empty } from "@/components/ui/empty"
import { Spinner } from "@/components/ui/spinner"
import { useToast } from "@/hooks/use-toast"
import { MapPin, Calendar, User, CheckCircle } from "lucide-react"
import { createClient } from "@/lib/supabase/client"
import { formatCoordinates } from "@/lib/utils/geolocation"

type WasteReport = {
  id: string
  image_url: string | null
  description: string
  latitude: number
  longitude: number
  status: "open" | "resolved"
  created_at: string
  user_id: string
}

export function AdminReportsList() {
  const [reports, setReports] = useState<WasteReport[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [resolvingId, setResolvingId] = useState<string | null>(null)
  const [filter, setFilter] = useState<"all" | "open" | "resolved">("open")
  const { toast } = useToast()

  useEffect(() => {
    const fetchReports = async () => {
      setIsLoading(true)
      try {
        const supabase = createClient()
        let query = supabase.from("waste_reports").select("*").order("created_at", { ascending: false })

        if (filter !== "all") {
          query = query.eq("status", filter)
        }

        const { data, error } = await query

        if (error) {
          console.error("Error fetching reports:", error)
          toast({
            title: "Error",
            description: "Failed to load reports.",
            variant: "destructive",
          })
        } else {
          setReports(data || [])
        }
      } catch (error) {
        console.error("Error:", error)
      } finally {
        setIsLoading(false)
      }
    }

    fetchReports()
  }, [filter, toast])

  const handleResolveReport = async (reportId: string) => {
    setResolvingId(reportId)

    try {
      const supabase = createClient()
      const { error } = await supabase.from("waste_reports").update({ status: "resolved" }).eq("id", reportId)

      if (error) {
        throw error
      }

      // Update local state
      setReports((prev) => prev.map((r) => (r.id === reportId ? { ...r, status: "resolved" } : r)))

      toast({
        title: "Report Resolved",
        description: "The waste report has been marked as resolved.",
      })
    } catch (error) {
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to resolve report.",
        variant: "destructive",
      })
    } finally {
      setResolvingId(null)
    }
  }

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
      <Tabs value={filter} onValueChange={(v) => setFilter(v as "all" | "open" | "resolved")}>
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="open">Open</TabsTrigger>
          <TabsTrigger value="resolved">Resolved</TabsTrigger>
          <TabsTrigger value="all">All Reports</TabsTrigger>
        </TabsList>

        <TabsContent value={filter} className="space-y-4">
          {reports.length === 0 ? (
            <Empty
              heading="No reports found"
              description={
                filter === "open"
                  ? "No open reports at this time. Great work keeping the community clean!"
                  : "No resolved reports yet."
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
                            <span>{formatCoordinates(report.latitude, report.longitude)}</span>
                          </div>
                        </div>

                        {/* Footer and Action */}
                        <div className="space-y-3 pt-3 border-t">
                          <div className="flex items-center gap-4 text-xs text-muted-foreground">
                            <div className="flex items-center gap-1">
                              <Calendar className="w-4 h-4" />
                              {formatDate(report.created_at)}
                            </div>
                            <div className="flex items-center gap-1">
                              <User className="w-4 h-4" />
                              {report.user_id.slice(0, 8)}...
                            </div>
                          </div>

                          {/* Action Button */}
                          {report.status === "open" && (
                            <Button
                              size="sm"
                              onClick={() => handleResolveReport(report.id)}
                              disabled={resolvingId === report.id}
                              className="w-full"
                            >
                              {resolvingId === report.id && <Spinner className="mr-2 h-4 w-4" />}
                              {resolvingId === report.id ? "Marking as Resolved..." : "Mark as Resolved"}
                            </Button>
                          )}
                          {report.status === "resolved" && (
                            <div className="flex items-center gap-2 text-xs text-secondary font-medium p-2 bg-secondary/10 rounded">
                              <CheckCircle className="w-4 h-4" />
                              Resolved
                            </div>
                          )}
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
