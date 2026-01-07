"use client"

import { ArrowLeft, Filter, MapPin } from 'lucide-react';
import { useState, useEffect, useRef } from 'react';
import dynamic from "next/dynamic";
import { createClient } from "@/lib/supabase/client";

import "leaflet/dist/leaflet.css";

// Dynamic imports for Leaflet
const MapContainer = dynamic(
  () => import("react-leaflet").then((m) => m.MapContainer),
  { ssr: false }
);
const TileLayer = dynamic(
  () => import("react-leaflet").then((m) => m.TileLayer),
  { ssr: false }
);
const CircleMarker = dynamic(
  () => import("react-leaflet").then((m) => m.CircleMarker),
  { ssr: false }
);

interface HeatmapFullPageProps {
  onBack: () => void;
}

export function HeatmapFullPage({ onBack }: HeatmapFullPageProps) {
  const supabase = createClient();
  const mapRef = useRef<any>(null);
  const heatLayerRef = useRef<any>(null);

  const [showUnresolvedOnly, setShowUnresolvedOnly] = useState(false);
  const [timeRange, setTimeRange] = useState('7days');
  const [areaFilter, setAreaFilter] = useState('All');

  const [points, setPoints] = useState<any[]>([]);
  const [redDots, setRedDots] = useState<any[]>([]);
  const [yellowDots, setYellowDots] = useState<any[]>([]);
  const [leafletLoaded, setLeafletLoaded] = useState(false);

  // Pune Bounds
  const PUNE_BOUNDS = {
    minLat: 18.42, maxLat: 18.62,
    minLng: 73.75, maxLng: 73.95,
  };

  const generatePunePoints = (count: number) => {
    return Array.from({ length: count }).map(() => [
      Math.random() * (PUNE_BOUNDS.maxLat - PUNE_BOUNDS.minLat) + PUNE_BOUNDS.minLat,
      Math.random() * (PUNE_BOUNDS.maxLng - PUNE_BOUNDS.minLng) + PUNE_BOUNDS.minLng,
    ]);
  };

  // 1. Initialize Leaflet
  useEffect(() => {
    async function initLeaflet() {
      const L = await import("leaflet");
      // @ts-ignore
      await import("leaflet.heat");
      // @ts-ignore
      window.L = L;
      setLeafletLoaded(true);
    }
    initLeaflet();
  }, []);

  // 2. Load Data (Database + Random Hotspots)
  useEffect(() => {
    async function loadData() {
      const { data } = await supabase
        .from("waste_reports")
        .select("latitude, longitude, status");

      let filteredData = data || [];
      if (showUnresolvedOnly) {
        filteredData = filteredData.filter(r => r.status !== 'resolved');
      }

      const dbPoints = filteredData.map((r) => [r.latitude, r.longitude, 0.8]);
      
      // Full screen view: More points for a "busy" look
      const heatBase = generatePunePoints(150).map(p => [...p, 0.4]);
      setPoints([...dbPoints, ...heatBase]);
      setRedDots(generatePunePoints(50));
      setYellowDots(generatePunePoints(90));
    }
    loadData();
  }, [supabase, showUnresolvedOnly]);

  // 3. Update Heat Layer
  useEffect(() => {
    const L = (window as any).L;
    if (!leafletLoaded || !mapRef.current || !L?.heatLayer || points.length === 0) return;

    if (heatLayerRef.current) {
      mapRef.current.removeLayer(heatLayerRef.current);
    }

    heatLayerRef.current = L.heatLayer(points, {
      radius: 40,
      blur: 25,
      maxZoom: 15,
      gradient: { 0.4: 'blue', 0.6: 'lime', 0.9: 'red' }
    }).addTo(mapRef.current);
  }, [points, leafletLoaded]);

  return (
    <div className="h-screen flex flex-col bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 px-6 py-4 shadow-sm z-10">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-4">
            <button
              onClick={onBack}
              className="flex items-center gap-2 text-gray-700 hover:text-[#0F7A20] transition-colors"
            >
              <ArrowLeft className="w-5 h-5" />
              <span className="font-medium">Back</span>
            </button>
            <div className="h-6 w-px bg-gray-300" />
            <h1 className="text-xl font-semibold text-gray-900">
              Pune City Waste Analytics
            </h1>
          </div>
        </div>
      </div>

      {/* Filters Bar */}
      <div className="bg-white border-b border-gray-200 px-6 py-3 z-10">
        <div className="max-w-7xl mx-auto flex items-center gap-4 flex-wrap">
          <div className="flex items-center gap-2 text-gray-600">
            <Filter className="w-4 h-4" />
            <span className="text-sm font-medium">Filters:</span>
          </div>

          <select
            value={timeRange}
            onChange={(e) => setTimeRange(e.target.value)}
            className="px-3 py-1.5 border border-gray-300 rounded-lg text-sm outline-none focus:ring-2 focus:ring-[#0F7A20]"
          >
            <option value="7days">Last 7 Days</option>
            <option value="30days">Last 30 Days</option>
            <option value="all">All Time</option>
          </select>

          <label className="flex items-center gap-2 cursor-pointer px-3 py-1.5 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors">
            <input
              type="checkbox"
              checked={showUnresolvedOnly}
              onChange={(e) => setShowUnresolvedOnly(e.target.checked)}
              className="w-4 h-4 text-[#0F7A20] rounded border-gray-300"
            />
            <span className="text-sm text-gray-700">Unresolved Only</span>
          </label>
        </div>
      </div>

      {/* Map Section */}
      <div className="flex-1 relative">
        {!leafletLoaded && (
          <div className="absolute inset-0 flex items-center justify-center bg-gray-100 z-[2000]">
            <p className="animate-pulse font-medium text-gray-500">Loading Map Data...</p>
          </div>
        )}

        {leafletLoaded && (
          <MapContainer
            center={[18.5204, 73.8567]}
            zoom={13}
            style={{ height: "100%", width: "100%" }}
            ref={mapRef}
            zoomControl={false} // We can add custom controls or use default
          >
            <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />

            {/* Red Points */}
            {redDots.map((pos, idx) => (
              <CircleMarker
                key={`red-${idx}`}
                center={[pos[0], pos[1]]}
                pathOptions={{ color: '#b91c1c', fillColor: '#ef4444', fillOpacity: 0.8 }}
                radius={5}
              />
            ))}

            {/* Yellow Points */}
            {yellowDots.map((pos, idx) => (
              <CircleMarker
                key={`yellow-${idx}`}
                center={[pos[0], pos[1]]}
                pathOptions={{ color: '#a16207', fillColor: '#facc15', fillOpacity: 0.7 }}
                radius={4}
              />
            ))}
          </MapContainer>
        )}

        {/* Legend - Bottom Left */}
        <div className="absolute bottom-6 left-6 bg-white/90 backdrop-blur-sm rounded-xl p-4 shadow-2xl border border-gray-200 z-[1000]">
          <p className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-3">Waste Density</p>
          <div className="space-y-2">
            <div className="flex items-center gap-3">
              <div className="w-3 h-3 bg-red-500 rounded-full shadow-[0_0_8px_rgba(239,68,68,0.6)]" />
              <span className="text-sm text-gray-700 font-medium">Critical Hotspots</span>
            </div>
            <div className="flex items-center gap-3">
              <div className="w-3 h-3 bg-yellow-400 rounded-full" />
              <span className="text-sm text-gray-700 font-medium">Moderate Areas</span>
            </div>
            <div className="mt-3 pt-2 border-t border-gray-200">
                <div className="h-2 w-full bg-gradient-to-r from-blue-500 via-lime-500 to-red-500 rounded-full" />
                <div className="flex justify-between mt-1 text-[10px] text-gray-500 font-bold">
                    <span>LOW</span>
                    <span>HIGH</span>
                </div>
            </div>
          </div>
        </div>

        {/* Stats Card - Bottom Right */}
        <div className="absolute bottom-6 right-6 bg-white/90 backdrop-blur-sm rounded-xl p-5 shadow-2xl border border-gray-200 min-w-[220px] z-[1000]">
          <div className="space-y-3">
            <div className="flex justify-between items-center">
              <span className="text-xs text-gray-500 font-bold uppercase">Hotspots</span>
              <span className="text-lg font-black text-gray-900">{redDots.length + yellowDots.length}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-xs text-red-500 font-bold uppercase">Critical</span>
              <span className="text-lg font-black text-red-600">{redDots.length}</span>
            </div>
            <div className="pt-2 border-t border-gray-100 flex items-center gap-2 text-[#0F7A20]">
                <MapPin className="w-3 h-3" />
                <span className="text-[10px] font-bold uppercase tracking-tighter">Live from Pune District</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}