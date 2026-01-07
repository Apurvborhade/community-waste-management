"use client"

import { createClient } from "@/lib/supabase/client"
import { 
  X, MapPin, Calendar, User, CheckCircle2, 
  UserPlus, Image as ImageIcon, ExternalLink,
  AlertCircle, Clock
} from "lucide-react"
import type { WasteReportAdmin } from "./types"

interface ReportDetailsDrawerProps {
  report: WasteReportAdmin
  onClose: () => void
}

export function ReportDetailsDrawer({ report, onClose }: ReportDetailsDrawerProps) {
  const supabase = createClient()

  const handleResolve = async () => {
    const { error } = await supabase
      .from("waste_reports")
      .update({ status: "resolved" })
      .eq("id", report.id)

    if (error) {
      alert("Error updating report")
      return
    }
    onClose()
  }

  return (
    <>
      {/* Backdrop with stronger blur */}
      <div
        className="fixed inset-0 bg-slate-900/60 z-50 transition-opacity flex items-center justify-center p-4 md:p-8 backdrop-blur-md"
        onClick={onClose}
      >
        {/* Horizontal Big Card */}
        <div
          className="bg-white rounded-[2rem] shadow-2xl w-full max-w-6xl flex flex-col overflow-hidden border border-white/20"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Enhanced Header */}
          <div className="bg-white px-8 py-6 flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="bg-slate-100 p-3 rounded-2xl">
                <AlertCircle className="w-6 h-6 text-slate-600" />
              </div>
              <div>
                <h3 className="text-2xl font-bold text-slate-900 tracking-tight">Report Review</h3>
                <div className="flex items-center gap-2 mt-0.5">
                   <span className="text-xs font-mono text-slate-400">#{report.reportId}</span>
                   <span className="h-1 w-1 rounded-full bg-slate-300"></span>
                   <span className="text-xs text-slate-500 flex items-center gap-1">
                     <Clock className="w-3 h-3" /> {report.dateCreated}
                   </span>
                </div>
              </div>
            </div>
            <button 
              onClick={onClose} 
              className="p-2 bg-slate-50 hover:bg-slate-100 rounded-full transition-all group"
            >
              <X className="w-6 h-6 text-slate-400 group-hover:text-slate-600" />
            </button>
          </div>

          <div className="flex flex-col md:flex-row flex-1 min-h-0 border-t border-slate-100">
            
            {/* Left Column: Media Section */}
            <div className="md:w-3/5 bg-slate-50 p-6 flex flex-col">
              <div className="relative flex-1 group">
                {report.imageUrl ? (
                  <>
                    <img
                      src={report.imageUrl}
                      className="w-full h-full object-cover rounded-3xl shadow-inner border border-slate-200"
                      alt="Waste Evidence"
                    />
                    <button className="absolute bottom-4 right-4 bg-white/90 backdrop-blur px-4 py-2 rounded-xl text-xs font-bold text-slate-700 shadow-sm flex items-center gap-2 hover:bg-white transition-colors">
                      <ExternalLink className="w-3 h-3" /> View Full Image
                    </button>
                  </>
                ) : (
                  <div className="w-full h-full min-h-[400px] bg-white rounded-3xl border-2 border-dashed border-slate-200 flex flex-col items-center justify-center">
                    <ImageIcon className="w-16 h-16 text-slate-200 mb-2" />
                    <span className="text-slate-400 font-medium tracking-tight">Evidence Missing</span>
                  </div>
                )}
              </div>
            </div>

            {/* Right Column: Information & Controls */}
            <div className="md:w-2/5 p-8 flex flex-col justify-between bg-white">
              
              <div className="space-y-8">
                {/* Status & Priority Tag Header */}
                <div className="flex gap-2">
                  <span className={`px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest border ${
                    report.status === 'Open' 
                    ? 'bg-amber-50 text-amber-700 border-amber-100' 
                    : 'bg-emerald-50 text-emerald-700 border-emerald-100'
                  }`}>
                    {report.status}
                  </span>
                  <span className="px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest bg-slate-50 text-slate-600 border border-slate-100">
                    {report.priority} Priority
                  </span>
                </div>

                {/* Description with better typography */}
                <div>
                  <h4 className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.2em] mb-3">Case Description</h4>
                  <p className="text-slate-700 text-lg leading-relaxed font-medium">
                    {report.description || "No description provided."}
                  </p>
                </div>

                {/* Meta Grid */}
                <div className="grid grid-cols-1 gap-4">
                  <div className="flex items-center gap-4 p-4 rounded-2xl border border-slate-50 bg-slate-50/50">
                    <div className="w-10 h-10 bg-[#0F7A20] rounded-xl flex items-center justify-center shadow-lg shadow-green-900/20">
                      <User className="w-5 h-5 text-white" />
                    </div>
                    <div>
                      <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Reporter</p>
                      <p className="text-sm font-bold text-slate-900">{report.user}</p>
                    </div>
                  </div>

                  <div className="flex items-start gap-4 p-4 rounded-2xl border border-slate-50 bg-slate-50/50">
                    <div className="w-10 h-10 bg-amber-500 rounded-xl flex items-center justify-center shadow-lg shadow-amber-900/20">
                      <MapPin className="w-5 h-5 text-white" />
                    </div>
                    <div className="flex-1">
                      <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Coordinates & Location</p>
                      <p className="text-sm font-bold text-slate-900 leading-snug mb-1">{report.location}</p>
                      <p className="text-[10px] font-mono text-slate-400">{report.coordinates.lat.toFixed(5)}, {report.coordinates.lng.toFixed(5)}</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Action Buttons - More distinct */}
              <div className="flex flex-col gap-3 mt-10">
                <button className="w-full flex items-center justify-center gap-2 px-6 py-4 bg-slate-900 text-white font-bold rounded-2xl hover:bg-slate-800 transition-all shadow-xl shadow-slate-900/10 active:scale-[0.98]">
                  <UserPlus className="w-5 h-5" />
                  Assign Pickup Team
                </button>

                {report.status === "Open" ? (
                  <button
                    onClick={handleResolve}
                    className="w-full flex items-center justify-center gap-2 px-6 py-4 bg-white border-2 border-[#0F7A20] text-[#0F7A20] font-bold rounded-2xl hover:bg-green-50 transition-all active:scale-[0.98]"
                  >
                    <CheckCircle2 className="w-5 h-5" />
                    Mark as Resolved
                  </button>
                ) : (
                  <div className="w-full flex items-center justify-center gap-2 px-6 py-4 bg-emerald-50 text-emerald-600 font-bold rounded-2xl border border-emerald-100">
                    <CheckCircle2 className="w-5 h-5" />
                    Completed
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  )
}