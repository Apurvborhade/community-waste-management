"use client"

import { useState, useEffect, useRef } from "react"
import Image from "next/image"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent } from "@/components/ui/card"
import { Empty } from "@/components/ui/empty"
import { MapPin, Calendar, User, CalendarDays, Trophy, ChevronLeft, ChevronRight, Leaf } from "lucide-react"
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
  const [currentUserId, setCurrentUserId] = useState<string | null>(null)
  const [userType, setUserType] = useState<string | null>(null)
  type ResolvedLeader = { user_id: string; email: string | null; count: number }
  const [rankLeaders, setRankLeaders] = useState<ResolvedLeader[]>([])
  const [currentImageIndex, setCurrentImageIndex] = useState<{ [key: string]: number }>({})

  const getImageUrls = (imageUrl: string | null): string[] => {
    if (!imageUrl) return []
    try {
      const parsed = JSON.parse(imageUrl)
      return Array.isArray(parsed) ? parsed : [imageUrl]
    } catch {
      return [imageUrl]
    }
  }

  useEffect(() => {
    const fetchReports = async () => {
      setIsLoading(true)
      try {
        const supabase = createClient()
        
        // Get current user and user type
        const { data: { user } } = await supabase.auth.getUser()
        setCurrentUserId(user?.id || null)
        
        const storedUserType = localStorage.getItem("userType")
        setUserType(storedUserType)
        
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

          // Normal users see only their own reports, Admin and Garbage collector see all
          if (storedUserType === "Normal User" && user?.id) {
            query = query.eq("user_id", user.id)
          }
          
          // Apply status filters (for all user types)
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
              user_email: emailsMap.get(report.user_id) || null,
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
    
    // Set up real-time subscription for report updates
    const supabase = createClient()
    const channel = supabase
      .channel('waste_reports_changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'waste_reports'
        },
        (payload) => {
          console.log('Report updated:', payload)
          // Refetch reports when any change occurs
          fetchReports()
        }
      )
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
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
              ref={(el) => {
                tabRefs.current[tab.value] = el
              }}
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
          {filter === "events" ? (
            <Card className="overflow-hidden">
              <div className="bg-gradient-to-r from-green-600 to-emerald-600 p-6 text-white">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-2">
                    <Trophy className="w-6 h-6" />
                    <span className="text-sm font-medium bg-white/20 px-3 py-1 rounded-full">Government Initiative</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="bg-white/90 rounded-full p-2 flex items-center gap-2 px-3">
                      <Leaf className="w-5 h-5 text-green-600" />
                      <span className="text-xs font-semibold text-green-700">Ministry of Environment</span>
                    </div>
                    <div className="bg-white/90 rounded-full p-2 flex items-center gap-2 px-3">
                      <svg className="w-5 h-5 text-orange-600" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8zm-5-9h10v2H7z"/>
                      </svg>
                      <span className="text-xs font-semibold text-orange-700">Swachh Bharat</span>
                    </div>
                  </div>
                </div>
                <h2 className="text-3xl font-bold mb-2">Green Champions Awards 2026</h2>
                <p className="text-green-50">Recognizing outstanding environmental contributors</p>
              </div>
              <CardContent className="p-6 space-y-6">
                <div>
                  <h3 className="text-xl font-semibold mb-3">About the Event</h3>
                  <p className="text-muted-foreground leading-relaxed">
                    The Ministry of Environment & Climate Change is proud to announce the Green Champions Awards 2026, 
                    a national initiative to recognize and reward citizens who have made exceptional contributions to 
                    environmental conservation through our Community Waste Management platform.
                  </p>
                </div>

                <div className="border-t pt-6">
                  <h3 className="text-xl font-semibold mb-4">Awards & Recognition</h3>
                  <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4">
                    <div className="bg-gradient-to-br from-purple-50 to-pink-50 border-2 border-purple-300 p-4 rounded-lg">
                      <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-pink-500 rounded-full flex items-center justify-center mb-3">
                        <Trophy className="w-6 h-6 text-white" />
                      </div>
                      <h4 className="font-semibold text-purple-900 mb-2">Platinum Tier</h4>
                      <p className="text-sm text-purple-800 mb-3">150+ Contributions</p>
                      <ul className="text-xs text-purple-700 space-y-1">
                        <li>• Platinum Trophy & Certificate</li>
                        <li>• ₹20,000 Cash Prize</li>
                        <li>• National Media Feature</li>
                        <li>• VIP Event Access</li>
                      </ul>
                    </div>

                    <div className="bg-gradient-to-br from-amber-50 to-yellow-50 border border-amber-200 p-4 rounded-lg">
                      <div className="w-12 h-12 bg-gradient-to-br from-amber-400 to-yellow-500 rounded-full flex items-center justify-center mb-3">
                        <Trophy className="w-6 h-6 text-white" />
                      </div>
                      <h4 className="font-semibold text-amber-900 mb-2">Gold Tier</h4>
                      <p className="text-sm text-amber-800 mb-3">100-149 Contributions</p>
                      <ul className="text-xs text-amber-700 space-y-1">
                        <li>• Gold Trophy & Certificate</li>
                        <li>• ₹10,000 Cash Prize</li>
                        <li>• Regional Recognition</li>
                        <li>• Event Invitation</li>
                      </ul>
                    </div>

                    <div className="bg-gradient-to-br from-slate-50 to-gray-50 border border-slate-200 p-4 rounded-lg">
                      <div className="w-12 h-12 bg-gradient-to-br from-slate-400 to-gray-500 rounded-full flex items-center justify-center mb-3">
                        <Trophy className="w-6 h-6 text-white" />
                      </div>
                      <h4 className="font-semibold text-slate-900 mb-2">Silver Tier</h4>
                      <p className="text-sm text-slate-800 mb-3">50-99 Contributions</p>
                      <ul className="text-xs text-slate-700 space-y-1">
                        <li>• Silver Trophy & Certificate</li>
                        <li>• ₹5,000 Cash Prize</li>
                        <li>• District Recognition</li>
                        <li>• Digital Certificate</li>
                      </ul>
                    </div>

                    <div className="bg-gradient-to-br from-orange-50 to-amber-50 border border-orange-200 p-4 rounded-lg">
                      <div className="w-12 h-12 bg-gradient-to-br from-orange-500 to-amber-600 rounded-full flex items-center justify-center mb-3">
                        <Trophy className="w-6 h-6 text-white" />
                      </div>
                      <h4 className="font-semibold text-orange-900 mb-2">Bronze Tier</h4>
                      <p className="text-sm text-orange-800 mb-3">25-49 Contributions</p>
                      <ul className="text-xs text-orange-700 space-y-1">
                        <li>• Bronze Trophy & Certificate</li>
                        <li>• ₹3,000 Cash Prize</li>
                        <li>• Local Recognition</li>
                        <li>• Digital Badge</li>
                      </ul>
                    </div>
                  </div>
                </div>

                <div className="border-t pt-6">
                  <h3 className="text-xl font-semibold mb-4">Event Timeline</h3>
                  <div className="space-y-4">
                    <div className="flex gap-4">
                      <div className="flex flex-col items-center">
                        <div className="w-10 h-10 rounded-full bg-green-100 flex items-center justify-center">
                          <div className="w-3 h-3 rounded-full bg-green-600"></div>
                        </div>
                        <div className="w-0.5 h-full bg-green-200 mt-2"></div>
                      </div>
                      <div className="pb-8">
                        <p className="font-semibold">Registration Open</p>
                        <p className="text-sm text-muted-foreground">January 1 - March 31, 2026</p>
                        <p className="text-xs text-muted-foreground mt-1">Continue reporting waste to qualify for awards</p>
                      </div>
                    </div>

                    <div className="flex gap-4">
                      <div className="flex flex-col items-center">
                        <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center">
                          <div className="w-3 h-3 rounded-full bg-blue-600"></div>
                        </div>
                        <div className="w-0.5 h-full bg-blue-200 mt-2"></div>
                      </div>
                      <div className="pb-8">
                        <p className="font-semibold">Evaluation Period</p>
                        <p className="text-sm text-muted-foreground">April 1 - April 15, 2026</p>
                        <p className="text-xs text-muted-foreground mt-1">Verification of contributions and winner selection</p>
                      </div>
                    </div>

                    <div className="flex gap-4">
                      <div className="flex flex-col items-center">
                        <div className="w-10 h-10 rounded-full bg-purple-100 flex items-center justify-center">
                          <div className="w-3 h-3 rounded-full bg-purple-600"></div>
                        </div>
                        <div className="w-0.5 h-full bg-purple-200 mt-2"></div>
                      </div>
                      <div className="pb-8">
                        <p className="font-semibold">Winner Announcement</p>
                        <p className="text-sm text-muted-foreground">April 22, 2026 (Earth Day)</p>
                        <p className="text-xs text-muted-foreground mt-1">Live announcement on official platforms</p>
                      </div>
                    </div>

                    <div className="flex gap-4">
                      <div className="flex flex-col items-center">
                        <div className="w-10 h-10 rounded-full bg-amber-100 flex items-center justify-center">
                          <Trophy className="w-5 h-5 text-amber-600" />
                        </div>
                      </div>
                      <div>
                        <p className="font-semibold">Award Ceremony</p>
                        <p className="text-sm text-muted-foreground">May 5, 2026</p>
                        <p className="text-xs text-muted-foreground mt-1">Grand ceremony at National Convention Center, New Delhi</p>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="border-t pt-6 bg-green-50 -mx-6 -mb-6 px-6 py-4">
                  <h3 className="text-lg font-semibold mb-2">How to Participate?</h3>
                  <p className="text-sm text-muted-foreground mb-3">
                    Simply continue reporting waste in your community. All verified resolved reports between 
                    January 1 - March 31, 2026 will count towards your contribution score. No separate registration required!
                  </p>
                  <div className="flex items-center gap-2 text-xs text-green-700">
                    <Trophy className="w-4 h-4" />
                    <span className="font-medium">Current leaderboard available in the "Leaderboard" tab</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          ) : filter === "rank" ? (
            rankLeaders.length === 0 ? (
              <Empty
                heading="No contributions yet"
                description="No users have resolved reports yet. Check back soon!"
              />
            ) : (
              <div className="space-y-6">
                {/* Title Section */}
                <div className="mb-6">
                  <h2 className="text-2xl font-bold text-foreground mb-1">
                    Top Contributors
                  </h2>
                  <p className="text-sm text-muted-foreground">Ranked by resolved reports</p>
                </div>

                {/* Leaderboard Table */}
                <div className="bg-white rounded-lg border shadow-sm overflow-hidden">
                  {/* Table Header */}
                  <div className="bg-gray-50 border-b px-6 py-3 grid grid-cols-12 gap-4 items-center text-sm font-semibold text-gray-600">
                    <div className="col-span-1">Rank</div>
                    <div className="col-span-7">Contributor</div>
                    <div className="col-span-4 text-right">Contributions</div>
                  </div>

                  {/* Table Rows */}
                  <div className="divide-y">
                    {rankLeaders.map((leader, idx) => {
                      const getRankStyle = () => {
                        if (idx === 0) return {
                          bg: "bg-yellow-100/80",
                          rankColor: "text-yellow-950 bg-yellow-300",
                          medal: "text-yellow-500",
                          countColor: "text-yellow-600"
                        }
                        if (idx === 1) return {
                          bg: "bg-slate-50/50",
                          rankColor: "text-slate-700 bg-slate-100",
                          medal: "text-slate-600",
                          countColor: "text-slate-700"
                        }
                        if (idx === 2) return {
                          bg: "bg-orange-50/50",
                          rankColor: "text-orange-700 bg-orange-100",
                          medal: "text-orange-600",
                          countColor: "text-orange-700"
                        }
                        return {
                          bg: "hover:bg-gray-50",
                          rankColor: "text-gray-600 bg-gray-100",
                          medal: "text-gray-500",
                          countColor: "text-gray-900"
                        }
                      }
                      
                      const style = getRankStyle()
                      
                      return (
                        <div key={leader.user_id} className={`px-6 py-4 grid grid-cols-12 gap-4 items-center transition-colors ${style.bg}`}>
                          {/* Rank */}
                          <div className="col-span-1">
                            <div className={`w-10 h-10 rounded-lg flex items-center justify-center font-bold text-sm ${style.rankColor}`}>
                              {idx + 1}
                            </div>
                          </div>
                          
                          {/* User Info */}
                          <div className="col-span-7 flex items-center gap-3">
                            {idx < 3 && (
                              <Trophy className={`w-5 h-5 flex-shrink-0 ${style.medal}`} />
                            )}
                            <div className="flex-1 min-w-0">
                              <p className="font-semibold text-foreground truncate">
                                {leader.email?.split('@')[0] || 'User'}
                              </p>
                              <p className="text-sm text-muted-foreground truncate">
                                {leader.email || leader.user_id}
                              </p>
                            </div>
                          </div>
                          
                          {/* Contribution Count */}
                          <div className="col-span-4 text-right">
                            <div className="inline-flex items-center gap-2">
                              <span className={`text-2xl font-bold ${style.countColor}`}>
                                {leader.count}
                              </span>
                              <span className="text-sm text-muted-foreground">
                                resolved
                              </span>
                            </div>
                          </div>
                        </div>
                      )
                    })}
                  </div>
                </div>
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
                      {/* Image Carousel */}
                      <div className="relative h-40 md:h-auto bg-muted overflow-hidden rounded-t-lg md:rounded-l-lg md:rounded-t-none group">
                        {(() => {
                          const imageUrls = getImageUrls(report.image_url)
                          return imageUrls.length > 0 ? (
                            <>
                              <Image
                                src={imageUrls[currentImageIndex[report.id] || 0]}
                                alt="Waste report"
                                fill
                                className="object-cover"
                                crossOrigin="anonymous"
                              />
                              {imageUrls.length > 1 && (
                                <>
                                  <button
                                    onClick={(e) => {
                                      e.stopPropagation()
                                      const current = currentImageIndex[report.id] || 0
                                      const newIndex = current === 0 ? imageUrls.length - 1 : current - 1
                                      setCurrentImageIndex({ ...currentImageIndex, [report.id]: newIndex })
                                    }}
                                    className="absolute left-2 top-1/2 -translate-y-1/2 bg-black/50 hover:bg-black/70 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity"
                                  >
                                    <ChevronLeft className="w-5 h-5" />
                                  </button>
                                  <button
                                    onClick={(e) => {
                                      e.stopPropagation()
                                      const current = currentImageIndex[report.id] || 0
                                      const newIndex = current === imageUrls.length - 1 ? 0 : current + 1
                                      setCurrentImageIndex({ ...currentImageIndex, [report.id]: newIndex })
                                    }}
                                    className="absolute right-2 top-1/2 -translate-y-1/2 bg-black/50 hover:bg-black/70 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity"
                                  >
                                    <ChevronRight className="w-5 h-5" />
                                  </button>
                                  <div className="absolute bottom-2 left-1/2 -translate-x-1/2 flex gap-1">
                                    {imageUrls.map((_, idx) => (
                                      <div
                                        key={idx}
                                        className={`w-1.5 h-1.5 rounded-full transition-colors ${
                                          idx === (currentImageIndex[report.id] || 0)
                                            ? 'bg-white'
                                            : 'bg-white/50'
                                        }`}
                                      />
                                    ))}
                                  </div>
                                </>
                              )}
                            </>
                          ) : (
                            <div className="w-full h-full flex items-center justify-center text-muted-foreground">
                              No image
                            </div>
                          )
                        })()}
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
                            {report.user_id === currentUserId ? (report.user_email || "You") : "Community Member"}
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
