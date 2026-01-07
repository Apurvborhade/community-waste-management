"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { createClient } from "@/lib/supabase/client"

import { AdminNavigation } from "./AdminNavigation"
import { AdminDashboard } from "./AdminDashboard"
import { HeatmapFullPage } from "./HeatmapFullPage"

export default function AdminPage() {
  const router = useRouter()
  const supabase = createClient()

  const [showHeatmap, setShowHeatmap] = useState(false)

  // check login + role
  useEffect(() => {
    const checkAuth = async () => {
      const { data: { user } } = await supabase.auth.getUser()

      if (!user) {
        router.push("/auth/login")
        return
      }

      const userType = localStorage.getItem("userType")
      if (userType !== "admin") {
        router.push("/reports")
      }
    }

    checkAuth()
  }, [router, supabase])

  return (
    <div className="min-h-screen bg-background">
      {/* Top Navigation */}
      <AdminNavigation />

      {/* Admin dashboard */}
      {!showHeatmap && (
        <AdminDashboard onViewFullMap={() => setShowHeatmap(true)} />
      )}

      {/* Full-screen heatmap */}
      {showHeatmap && (
        <HeatmapFullPage onBack={() => setShowHeatmap(false)} />
      )}
    </div>
  )
}
