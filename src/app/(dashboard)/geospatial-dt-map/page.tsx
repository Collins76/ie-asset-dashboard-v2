'use client';

import { useDashboard } from '@/lib/store';
import TransformerMap from '@/components/maps/TransformerMap';
import DataTable from '@/components/ui/DataTable';
import KPICard from '@/components/ui/KPICard';
import { KPISkeleton, MapSkeleton, TableSkeleton } from '@/components/ui/LoadingSkeleton';

const MapIcon = <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}><path strokeLinecap="round" strokeLinejoin="round" d="M15 10.5a3 3 0 11-6 0 3 3 0 016 0z" /><path strokeLinecap="round" strokeLinejoin="round" d="M19.5 10.5c0 7.142-7.5 11.25-7.5 11.25S4.5 17.642 4.5 10.5a7.5 7.5 0 1115 0z" /></svg>;

export default function GeospatialDTMapPage() {
  const { aggregation, filteredData, isLoading } = useDashboard();

  if (isLoading || !aggregation) {
    return <div className="space-y-6"><KPISkeleton /><MapSkeleton /><TableSkeleton /></div>;
  }

  const withCoords = filteredData.filter((r) => r.lat && r.lon && r.lat !== 0 && r.lon !== 0);

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <KPICard title="Total DTs" value={aggregation.totalCount} icon={MapIcon} color="cyan" delay={1} />
        <KPICard title="Geo-Located" value={withCoords.length} icon={MapIcon} color="green" delay={2} />
        <KPICard title="Missing Coords" value={filteredData.length - withCoords.length} icon={MapIcon} color="red" delay={3} />
        <KPICard title="Coverage" value={filteredData.length > 0 ? Math.round((withCoords.length / filteredData.length) * 100) : 0} icon={MapIcon} color="amber" delay={4} formatValue={(v) => `${v}%`} />
      </div>

      <TransformerMap />
      <DataTable />
    </div>
  );
}
