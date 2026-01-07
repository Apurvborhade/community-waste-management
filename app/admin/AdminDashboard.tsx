import { useState } from 'react';
import { MetricsCards } from './MetricsCards';
import { HeatmapCard } from './HeatmapCard';
import { ChartsSection } from './ChartsSection';
import { ReportsTable } from './ReportsTable';
import { ReportDetailsDrawer } from "./ReportDetailsPanel"
import type { WasteReportAdmin } from './types';

interface AdminDashboardProps {
  onViewFullMap: () => void;
}

export function AdminDashboard({ onViewFullMap }: AdminDashboardProps) {
  const [selectedReport, setSelectedReport] = useState<WasteReportAdmin | null>(null);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Section 1: Key Metrics */}
      <MetricsCards />

      {/* Section 2: Heatmap */}
      <HeatmapCard onViewFullMap={onViewFullMap} />

      {/* Section 3: Charts */}
      <ChartsSection />

      {/* Section 4: Reports Table */}
      <ReportsTable onViewReport={setSelectedReport} />

      {/* Report Details Drawer */}
      {selectedReport && (
        <ReportDetailsDrawer 
          report={selectedReport}
          onClose={() => setSelectedReport(null)}
        />
      )}
    </div>
  );
}
