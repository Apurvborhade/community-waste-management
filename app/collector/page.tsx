"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { Leaf, LogOut } from "lucide-react"
import { Button } from "@/components/ui/button"
import { createClient } from "@/lib/supabase/client"
import { ReportsList } from "./ReportsList"
import { NavigationView } from "./NavigationView"
import type { WasteReport } from "../types/waste"

export default function CollectorPage() {
  const router = useRouter()
  const supabase = createClient()

  const [reports, setReports] = useState<WasteReport[]>([])
  const [selectedReportId, setSelectedReportId] = useState<string | null>(null)
  const [viewingRoute, setViewingRoute] = useState(false)

  // check auth
  useEffect(() => {
    const checkAuth = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) router.push("/auth/login")

      const userType = localStorage.getItem("userType")
      if (userType !== "collector") router.push("/reports")
    }

    checkAuth()
  }, [])

  // load reports
  useEffect(() => {
    const load = async () => {
      const { data, error } = await supabase
        .from("waste_reports")
        .select("*")
        .eq("status", "open")
        .order("created_at", { ascending: false })

      if (!error && data) {
        const mapped = data.map((r: any) => ({
          ...r,
          date: new Date(r.created_at).toLocaleDateString(),
          time: new Date(r.created_at).toLocaleTimeString(),
          location: r.location_address || `Lat ${r.latitude}, Lng ${r.longitude}`,
        }))

        setReports(mapped)
      }
    }

    load()
  }, [])

  // logout
  const handleSignOut = async () => {
    await supabase.auth.signOut()
    localStorage.removeItem("userType")
    router.push("/")
  }

  // show route
  const handleShowRoute = (reportId: string) => {
    setSelectedReportId(reportId)
    setViewingRoute(true)
  }

  // mark collected
  const handleMarkCollected = async (reportId: string) => {
  const { error } = await supabase
    .from("waste_reports")
    .update({ status: "resolved" })
    .eq("id", reportId)

  if (!error) {
    // update UI locally
    setReports(prev =>
      prev.map(r =>
        r.id === reportId ? { ...r, status: "resolved" } : r
      )
    )
  }
}


  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b bg-background/95 sticky top-0 z-50">
        <div className="max-w-6xl mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Leaf className="w-6 h-6 text-primary" />
            <h1 className="text-xl font-bold">Garbage Collector Dashboard</h1>
          </div>

          <Button variant="ghost" onClick={handleSignOut}>
            <LogOut className="w-4 h-4 mr-2" />
            Sign Out
          </Button>
        </div>
      </header>

      {/* MAIN */}
      <main className="max-w-6xl mx-auto px-4 py-8">
        {/* list view */}
        {!viewingRoute && (
          <ReportsList
            reports={reports}
            selectedReportId={selectedReportId}
            onShowRoute={handleShowRoute}
            onMarkCollected={handleMarkCollected}
          />
        )}

        {/* navigation view */}
        {viewingRoute && selectedReportId && (
          <NavigationView
            report={reports.find(r => r.id === selectedReportId)!}
            onClose={() => setViewingRoute(false)}
            onMarkCollected={handleMarkCollected}
          />
        )}
      </main>
    </div>
  )
}
