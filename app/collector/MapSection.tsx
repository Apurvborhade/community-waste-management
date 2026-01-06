import { MapPin, Navigation as NavigationIcon, Clock } from 'lucide-react';
import type { WasteReport } from "../types/waste";


interface MapSectionProps {
  selectedReport: WasteReport | undefined;
}

export function MapSection({ selectedReport }: MapSectionProps) {
  return (
    <div className="bg-white rounded-2xl shadow-sm border-2 border-gray-100 overflow-hidden">
      {/* Map Placeholder */}
      <div className="relative bg-gradient-to-br from-green-100 via-green-50 to-blue-50 h-[400px] flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center mx-auto mb-4 shadow-md">
            <NavigationIcon className="w-8 h-8 text-[#0F7A20]" />
          </div>
          <p className="text-gray-600 font-medium">Navigation Preview</p>
          {!selectedReport && (
            <p className="text-gray-400 text-sm mt-2">
              Select a report to view route
            </p>
          )}
        </div>

        {/* Route Indicator (when report is selected) */}
        {selectedReport && (
          <div className="absolute inset-0 flex items-center justify-center">
            <svg className="absolute w-full h-full" style={{ pointerEvents: 'none' }}>
              <path
                d="M 100 350 Q 200 200, 350 100"
                stroke="#0F7A20"
                strokeWidth="4"
                strokeDasharray="10,10"
                fill="none"
                opacity="0.6"
              />
            </svg>
            
            {/* Start Point */}
            <div className="absolute bottom-8 left-8 w-4 h-4 bg-blue-500 rounded-full border-4 border-white shadow-lg" />
            
            {/* End Point */}
            <div className="absolute top-8 right-8 w-6 h-6 bg-[#0F7A20] rounded-full border-4 border-white shadow-lg flex items-center justify-center">
              <MapPin className="w-3 h-3 text-white" />
            </div>
          </div>
        )}
      </div>

      {/* Route Info Panel */}
      {selectedReport && (
        <div className="p-6 bg-gradient-to-br from-green-50/50 to-white border-t-2 border-gray-100">
          <div className="flex items-start gap-3 mb-4">
            <div className="w-10 h-10 bg-[#0F7A20] rounded-full flex items-center justify-center flex-shrink-0">
              <MapPin className="w-5 h-5 text-white" />
            </div>
            <div className="flex-1">
              <h3 className="font-semibold text-gray-900 mb-1">
                {selectedReport.description}
              </h3>
              <p className="text-sm text-gray-600">{selectedReport.location}</p>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="bg-white rounded-xl p-4 border border-gray-200">
              <div className="flex items-center gap-2 text-gray-600 mb-1">
                <NavigationIcon className="w-4 h-4" />
                <span className="text-xs font-medium">Distance</span>
              </div>
              <p className="text-xl font-semibold text-gray-900">
                {selectedReport.distance}
              </p>
            </div>

            <div className="bg-white rounded-xl p-4 border border-gray-200">
              <div className="flex items-center gap-2 text-gray-600 mb-1">
                <Clock className="w-4 h-4" />
                <span className="text-xs font-medium">ETA</span>
              </div>
              <p className="text-xl font-semibold text-gray-900">
                {selectedReport.estimatedTime}
              </p>
            </div>
          </div>
        </div>
      )}

      {!selectedReport && (
        <div className="p-6 text-center text-gray-500 text-sm border-t-2 border-gray-100">
          Click "Show Route" on any report to view navigation details
        </div>
      )}
    </div>
  );
}
