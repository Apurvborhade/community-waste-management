import { MapPin, Calendar, Clock, CheckCircle2 } from 'lucide-react';
import type { WasteReport } from "../types/waste";


interface ReportsListProps {
  reports: WasteReport[];
  selectedReportId: string | null;
  onShowRoute: (reportId: string) => void;
  onMarkCollected: (reportId: string) => void;
}

export function ReportsList({
  reports,
  selectedReportId,
  onShowRoute,
  onMarkCollected,
}: ReportsListProps) {
  return (
    <div className="space-y-4">
      <h2 className="text-2xl font-semibold text-gray-900 mb-6">
        Open Reports ({reports.length})
      </h2>

      {reports.length === 0 ? (
        <div className="bg-green-50 border border-green-200 rounded-2xl p-8 text-center">
          <CheckCircle2 className="w-12 h-12 text-[#0F7A20] mx-auto mb-3" />
          <p className="text-gray-700 text-lg">All reports cleared!</p>
          <p className="text-gray-500 text-sm mt-1">Great work keeping the city clean.</p>
        </div>
      ) : (
        reports.map((report) => (
          <div
            key={report.id}
            className="bg-white rounded-2xl p-6 shadow-sm border-2 border-gray-100 hover:border-gray-200 transition-all"
          >
            {/* Header */}
            <div className="flex items-start justify-between mb-4">
              <div className="flex-1">
                <h3 className="font-semibold text-gray-900 text-lg mb-2">
                  {report.description}
                </h3>
                <div className="flex items-center gap-1.5 text-gray-600 text-sm mb-1">
                  <MapPin className="w-4 h-4" />
                  <span>{report.location}</span>
                </div>
              </div>
              <span className="px-3 py-1 border-2 border-[#0F7A20] text-[#0F7A20] rounded-full text-xs font-medium">
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
            <div className="flex items-center gap-3">
              <button
                onClick={() => onShowRoute(report.id)}
                className="flex-1 px-4 py-2.5 bg-[#0F7A20] text-white rounded-full hover:bg-[#0d6a1c] transition-colors font-medium"
              >
                Show Route
              </button>
              <button
                onClick={() => onMarkCollected(report.id)}
                className="flex-1 px-4 py-2.5 bg-white border-2 border-gray-300 text-gray-700 rounded-full hover:bg-gray-50 transition-colors font-medium"
              >
                Mark Collected
              </button>
            </div>
          </div>
        ))
      )}
    </div>
  );
}