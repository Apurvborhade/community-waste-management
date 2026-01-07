"use client"

import { useEffect, useState } from "react"
import { Eye, CheckCircle2, Search, Calendar, MapPin } from "lucide-react"
import type { WasteReportAdmin } from "./types"
import { createClient } from "@/lib/supabase/client"

interface ReportsTableProps {
  onViewReport: (report: WasteReportAdmin) => void
}

export function ReportsTable({ onViewReport }: ReportsTableProps) {
  const supabase = createClient()

  const [reports, setReports] = useState<WasteReportAdmin[]>([])
  const [loading, setLoading] = useState(true)

  const [statusFilter, setStatusFilter] = useState<"All" | "Open" | "Resolved">("All")
  const [locationFilter, setLocationFilter] = useState("All")
  const [searchTerm, setSearchTerm] = useState("")

  useEffect(() => {
    const loadReports = async () => {
      setLoading(true)

      const { data: reportsData, error: reportsError } = await supabase
        .from("waste_reports")
        .select("*")
        .order("created_at", { ascending: false })

      if (reportsError || !reportsData) {
        console.error("Error loading reports:", reportsError)
        setLoading(false)
        return
      }

      const userIds = [...new Set(reportsData.map(r => r.user_id))]

      const { data: profilesData } = await supabase
        .from("profiles")
        .select("id, email")      
        .in("id", userIds)        

      const emailMap: Record<string, string> = {}
      profilesData?.forEach((p) => {
        emailMap[p.id] = p.email
      })

      const mapped = reportsData.map((r) => ({
        id: r.id,
        // Removed reportId mapping here
        user: emailMap[r.user_id] || "Unknown",
        location: r.location_address || "Unknown",
        status: r.status === "resolved" ? "Resolved" : "Open",
        priority: r.rank ? "High" : "Low",
        dateCreated: new Date(r.created_at).toDateString(),
        description: r.description,
        imageUrl: r.image_url || null,
        coordinates: {
          lat: r.latitude,
          lng: r.longitude,
        },
      }))

      setReports(mapped as WasteReportAdmin[])
      setLoading(false)
    }

    loadReports()
  }, [supabase])

  const handleResolve = async (reportId: string) => {
    await supabase
      .from("waste_reports")
      .update({ status: "resolved" })
      .eq("id", reportId)

    setReports((prev) =>
      prev.map((r) =>
        r.id === reportId ? { ...r, status: "Resolved" } : r
      )
    )
  }

  const filteredReports = reports.filter((report) => {
    const matchesStatus = statusFilter === "All" || report.status === statusFilter
    const matchesLocation =
      locationFilter === "All" || report.location.includes(locationFilter)

    const matchesSearch =
      report.user.toLowerCase().includes(searchTerm.toLowerCase()) ||
      report.location.toLowerCase().includes(searchTerm.toLowerCase())

    return matchesStatus && matchesLocation && matchesSearch
  })

  if (loading) return <p className="p-6">Loading...</p>

  return (
    <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
      {/* Header & Filters */}
      <div className="p-6 border-b border-gray-200">
        <h2 className="text-xl font-semibold text-gray-900 mb-6">
          All Waste Reports
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              placeholder="Search reports..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#0F7A20]"
            />
          </div>

          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value as any)}
            className="px-4 py-2 border border-gray-300 rounded-xl focus:ring-2 focus:ring-[#0F7A20]"
          >
            <option value="All">All Status</option>
            <option value="Open">Open</option>
            <option value="Resolved">Resolved</option>
          </select>

          <select
            value={locationFilter}
            onChange={(e) => setLocationFilter(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-xl focus:ring-2 focus:ring-[#0F7A20]"
          >
            <option value="All">All Locations</option>
            <option value="Downtown">Downtown</option>
            <option value="Westside">Westside</option>
            <option value="Eastside">Eastside</option>
          </select>

          <button className="flex items-center justify-center gap-2 px-4 py-2 border border-gray-300 rounded-xl">
            <Calendar className="w-4 h-4 text-gray-600" />
            <span className="text-sm">Date Range</span>
          </button>
        </div>
      </div>

      {/* Table */}
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="bg-gray-50 border-b border-gray-200 text-left">
            <tr>
              <th className="px-6 py-3 text-xs font-medium text-gray-500 uppercase">User</th>
              <th className="px-6 py-3 text-xs font-medium text-gray-500 uppercase">Location</th>
              <th className="px-6 py-3 text-xs font-medium text-gray-500 uppercase">Status</th>
              <th className="px-6 py-3 text-xs font-medium text-gray-500 uppercase">Priority</th>
              <th className="px-6 py-3 text-xs font-medium text-gray-500 uppercase">Date</th>
              <th className="px-6 py-3 text-xs font-medium text-gray-500 uppercase">Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredReports.map((report) => (
              <tr key={report.id} className="border-b hover:bg-gray-50">
                {/* ID Column Removed */}
                <td className="px-6 py-3 text-sm text-gray-600 font-medium">{report.user}</td>

                <td className="px-6 py-3 text-sm text-gray-600">
                  <div className="flex items-center gap-2">
                    <MapPin className="w-4 h-4 text-gray-400" />
                    {report.location}
                  </div>
                </td>

                <td className="px-6 py-3">
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                    report.status === "Resolved" ? "bg-green-100 text-green-700" : "bg-yellow-100 text-yellow-700"
                  }`}>
                    {report.status}
                  </span>
                </td>

                <td className="px-6 py-3 text-sm text-gray-600">{report.priority}</td>

                <td className="px-6 py-3 text-sm text-gray-600">{report.dateCreated}</td>

                <td className="px-6 py-3 flex gap-2">
                  <button
                    onClick={() => onViewReport(report)}
                    className="p-2 text-[#0F7A20] hover:bg-green-50 rounded-lg transition-colors"
                  >
                    <Eye className="w-4 h-4" />
                  </button>

                  {report.status === "Open" && (
                    <button
                      onClick={() => handleResolve(report.id)}
                      className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                    >
                      <CheckCircle2 className="w-4 h-4" />
                    </button>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}