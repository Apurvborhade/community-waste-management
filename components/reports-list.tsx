"use client"

import { useState, useEffect, useRef } from "react"
import Image from "next/image"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent } from "@/components/ui/card"
import { Empty } from "@/components/ui/empty"
import { MapPin, Calendar, User, CalendarDays, Trophy } from "lucide-react"
import { createClient } from "@/lib/supabase/client"
import { formatCoordinates } from "@/lib/utils/geolocation"

type WasteReport = {
  id: string
  image_url: string | null
  description: string
  latitude: number
  longitude: number
  location_address: string | null
  status: "open" | "resolved" | "rejected"
  created_at: string
  user_id: string
  rank: number | null
  event: string | null
  user_email?: string | null
}

export function ReportsList() {
  const [reports, setReports] = useState<WasteReport[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [filter, setFilter] = useState<"all" | "open" | "resolved" | "rejected" | "rank" | "events">("all")
  const [hoveredTab, setHoveredTab] = useState<string | null>(null)
  const tabRefs = useRef<{ [key: string]: HTMLButtonElement | null }>({})
  const [indicatorStyle, setIndicatorStyle] = useState({ left: 0, width: 0 })
  type ResolvedLeader = { user_id: string; email: string | null; count: number }
  const [rankLeaders, setRankLeaders] = useState<ResolvedLeader[]>([])

  useEffect(() => {
    const fetchReports = async () => {
      setIsLoading(true)
      try {
        const supabase = createClient()
        if (filter === "rank") {
          const { data: resolvedReports, error } = await supabase
            .from("waste_reports")
            .select("user_id, status")
            .eq("status", "resolved")

          if (error) {
            console.error("Error fetching resolved reports:", error)
            setRankLeaders([])
          } else {
            const counts = new Map<string, number>()
            for (const r of resolvedReports || []) {
              counts.set(r.user_id, (counts.get(r.user_id) || 0) + 1)
            }
            const userIds = Array.from(counts.keys())
            let emailsMap = new Map<string, string | null>()
            if (userIds.length > 0) {
              const { data: profilesData } = await supabase
                .from("profiles")
                .select("id, email")
                .in("id", userIds)
              for (const p of profilesData || []) {
                emailsMap.set(p.id, p.email)
              }
            }
            const leaders: ResolvedLeader[] = userIds
              .map((uid) => ({ user_id: uid, email: emailsMap.get(uid) || null, count: counts.get(uid) || 0 }))
              .sort((a, b) => b.count - a.count)
            setRankLeaders(leaders)
            setReports([])
          }
        } else {
          let query = supabase
            .from("waste_reports")
            .select("*")
            .order("created_at", { ascending: false })

          if (filter === "open" || filter === "resolved" || filter === "rejected") {
            query = query.eq("status", filter)
          } else if (filter === "events") {
            query = query.not("event", "is", null).neq("event", "")
          }

          const { data, error } = await query

          if (error) {
            console.error("Error fetching reports:", error)
          } else {
            // Fetch user emails separately
            const userIds = [...new Set((data || []).map(r => r.user_id))]
            let emailsMap = new Map<string, string>()
            
            if (userIds.length > 0) {
              const { data: profilesData, error: profilesError } = await supabase
                .from("profiles")
                .select("id, email")
                .in("id", userIds)
              
              console.log("Profiles data:", profilesData, "Error:", profilesError)
              
              for (const p of profilesData || []) {
                emailsMap.set(p.id, p.email)
              }
            }
            
            const reportsWithEmail = (data || []).map((report) => ({
              ...report,
              user_email: emailsMap.get(report.user_id) || null
            }))
            
            console.log("Reports with email:", reportsWithEmail)
            
            setReports(reportsWithEmail)
            setRankLeaders([])
          }
        }
      } catch (error) {
        console.error("Error:", error)
      } finally {
        setIsLoading(false)
      }
    }

    fetchReports()
  }, [filter])

  useEffect(() => {
    const updateIndicator = () => {
      const activeTab = hoveredTab || filter
      const tabElement = tabRefs.current[activeTab]
      if (tabElement) {
        const parent = tabElement.parentElement
        if (parent) {
          const parentRect = parent.getBoundingClientRect()
          const tabRect = tabElement.getBoundingClientRect()
          setIndicatorStyle({
            left: tabRect.left - parentRect.left,
            width: tabRect.width,
          })
        }
      }
    }
    updateIndicator()
    window.addEventListener('resize', updateIndicator)
    return () => window.removeEventListener('resize', updateIndicator)
  }, [filter, hoveredTab])

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
      <div className="relative bg-muted p-1 rounded-lg">
        <div 
          className="absolute top-1 bottom-1 bg-background rounded-md shadow-sm transition-all duration-300 ease-out"
          style={{
            left: `${indicatorStyle.left}px`,
            width: `${indicatorStyle.width}px`,
          }}
        />
        <div className="grid grid-cols-3 md:grid-cols-6 relative z-10">
          {[
            { value: "all", label: "All Reports" },
            { value: "open", label: "Open" },
            { value: "resolved", label: "Resolved" },
            { value: "rejected", label: "Rejected" },
            { value: "rank", label: "Leaderboard" },
            { value: "events", label: "Events" },
          ].map((tab) => (
            <button
              key={tab.value}
              ref={(el) => (tabRefs.current[tab.value] = el)}
              onClick={() => setFilter(tab.value as typeof filter)}
              onMouseEnter={() => setHoveredTab(tab.value)}
              onMouseLeave={() => setHoveredTab(null)}
              className={`px-3 py-2 text-sm font-medium transition-colors rounded-md ${
                filter === tab.value
                  ? "text-foreground"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      <div className="space-y-4">
          {filter === "rank" ? (
            rankLeaders.length === 0 ? (
              <Empty
                heading="No contributions yet"
                description="No users have resolved reports yet. Check back soon!"
              />
            ) : (
              <div className="grid gap-2">
                {rankLeaders.map((leader, idx) => (
                  <Card key={leader.user_id} className="p-2">
                    <CardContent className="flex items-center justify-between py-3">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
                          <span className="text-sm font-semibold">{idx + 1}</span>
                        </div>
                        <div>
                          <p className="text-sm font-medium">{leader.email || leader.user_id}</p>
                          <p className="text-xs text-muted-foreground">Resolved: {leader.count}</p>
                        </div>
                      </div>
                      <Trophy className="w-5 h-5 text-primary" />
                    </CardContent>
                  </Card>
                ))}
              </div>
            )
          ) : reports.length === 0 ? (
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
                              variant={report.status === "open" ? "outline" : report.status === "resolved" ? "default" : "destructive"}
                              className={`flex-shrink-0 capitalize ${
                                report.status === "open" 
                                  ? "bg-yellow-100 text-yellow-800 border-yellow-300 dark:bg-yellow-900 dark:text-yellow-200" 
                                  : report.status === "resolved" 
                                  ? "bg-green-100 text-green-800 border-green-300 dark:bg-green-900 dark:text-green-200" 
                                  : "bg-red-100 text-red-800 border-red-300 dark:bg-red-900 dark:text-red-200"
                              }`}
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
                            {report.user_email || "Community Member"}
                          </div>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
      </div>
    </div>
  )
}
