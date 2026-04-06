'use client';

import { useDashboard } from '@/lib/store';
import { formatCapacity } from '@/lib/data';
import KPICard from '@/components/ui/KPICard';
import CapacityByBUChart from '@/components/charts/CapacityByBUChart';
import MeteringDonut from '@/components/charts/MeteringDonut';
import MaintenanceByBandChart from '@/components/charts/MaintenanceByBandChart';
import VoltageChart from '@/components/charts/VoltageChart';
import MaintenanceByBUChart from '@/components/charts/MaintenanceByBUChart';
import CapacityDistChart from '@/components/charts/CapacityDistChart';
import TransformerMap from '@/components/maps/TransformerMap';
import DataTable from '@/components/ui/DataTable';
import { KPISkeleton, ChartSkeleton, MapSkeleton, TableSkeleton } from '@/components/ui/LoadingSkeleton';

// SVG icons for KPI cards
const BoltIcon = <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}><path strokeLinecap="round" strokeLinejoin="round" d="M3.75 13.5l10.5-11.25L12 10.5h8.25L9.75 21.75 12 13.5H3.75z" /></svg>;
const BatteryIcon = <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}><path strokeLinecap="round" strokeLinejoin="round" d="M21 10.5h.375c.621 0 1.125.504 1.125 1.125v2.25c0 .621-.504 1.125-1.125 1.125H21M3.75 18h15A2.25 2.25 0 0021 15.75v-6a2.25 2.25 0 00-2.25-2.25h-15A2.25 2.25 0 001.5 9.75v6A2.25 2.25 0 003.75 18z" /></svg>;
const GaugeIcon = <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}><path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6h4.5m4.5 0a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>;
const HeartIcon = <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}><path strokeLinecap="round" strokeLinejoin="round" d="M21 8.25c0-2.485-2.099-4.5-4.688-4.5-1.935 0-3.597 1.126-4.312 2.733-.715-1.607-2.377-2.733-4.313-2.733C5.1 3.75 3 5.765 3 8.25c0 7.22 9 12 9 12s9-4.78 9-12z" /></svg>;
const WarningIcon = <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}><path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z" /></svg>;
const MapGridIcon = <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}><path strokeLinecap="round" strokeLinejoin="round" d="M3.75 6A2.25 2.25 0 016 3.75h2.25A2.25 2.25 0 0110.5 6v2.25a2.25 2.25 0 01-2.25 2.25H6a2.25 2.25 0 01-2.25-2.25V6zM3.75 15.75A2.25 2.25 0 016 13.5h2.25a2.25 2.25 0 012.25 2.25V18a2.25 2.25 0 01-2.25 2.25H6A2.25 2.25 0 013.75 18v-2.25zM13.5 6a2.25 2.25 0 012.25-2.25H18A2.25 2.25 0 0120.25 6v2.25A2.25 2.25 0 0118 10.5h-2.25a2.25 2.25 0 01-2.25-2.25V6zM13.5 15.75a2.25 2.25 0 012.25-2.25H18a2.25 2.25 0 012.25 2.25V18A2.25 2.25 0 0118 20.25h-2.25a2.25 2.25 0 01-2.25-2.25v-2.25z" /></svg>;
const NetworkIcon = <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}><path strokeLinecap="round" strokeLinejoin="round" d="M7.5 21L3 16.5m0 0L7.5 12M3 16.5h13.5m0-13.5L21 7.5m0 0L16.5 12M21 7.5H7.5" /></svg>;

export default function ExecutiveSummaryPage() {
  const { aggregation, isLoading } = useDashboard();

  if (isLoading || !aggregation) {
    return (
      <div className="space-y-6">
        <KPISkeleton />
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          <div className="lg:col-span-2"><ChartSkeleton /></div>
          <ChartSkeleton />
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          <div className="lg:col-span-2"><ChartSkeleton /></div>
          <ChartSkeleton />
        </div>
        <MapSkeleton />
        <TableSkeleton />
      </div>
    );
  }

  const agg = aggregation;

  return (
    <div className="space-y-6">
      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 xl:grid-cols-7 gap-4">
        <KPICard
          title="Total Transformers"
          value={agg.totalCount}
          subtitle={`${agg.publicCount.toLocaleString()} Public · ${agg.privateCount.toLocaleString()} Private`}
          icon={BoltIcon}
          color="cyan"
          delay={1}
        />
        <KPICard
          title="Network Capacity"
          value={agg.totalCapacity}
          icon={BatteryIcon}
          color="green"
          delay={2}
          formatValue={(v) => formatCapacity(v)}
        />
        <KPICard
          title="Metered DTs"
          value={agg.meteredCount}
          subtitle={`${agg.unmeteredCount.toLocaleString()} unmetered`}
          icon={GaugeIcon}
          color="amber"
          percentage={agg.meteredPct}
          delay={3}
        />
        <KPICard
          title="Grid Health"
          value={agg.healthyCount}
          subtitle={`${agg.faultyCount.toLocaleString()} faulty · ${agg.outOfCircuitCount.toLocaleString()} OOC`}
          icon={HeartIcon}
          color="green"
          percentage={agg.healthyPct}
          delay={4}
        />
        <KPICard
          title="Faulty Transformers"
          value={agg.faultyCount}
          icon={WarningIcon}
          color="red"
          delay={5}
        />
        <KPICard
          title="Unique UT"
          value={agg.uniqueUTs}
          icon={MapGridIcon}
          color="cyan"
          delay={6}
        />
        <KPICard
          title="Unique Feeders"
          value={agg.uniqueFeeders}
          icon={NetworkIcon}
          color="pink"
          delay={7}
        />
      </div>

      {/* Charts Row 1 */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <div className="lg:col-span-2">
          <CapacityByBUChart data={agg.capacityByBU} />
        </div>
        <MeteringDonut data={agg.meteringBreakdown} total={agg.totalCount} />
      </div>

      {/* Charts Row 2 */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <div className="lg:col-span-2">
          <MaintenanceByBandChart data={agg.maintenanceByBand} />
        </div>
        <VoltageChart data={agg.voltageSplit} />
      </div>

      {/* Charts Row 3 */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <div className="lg:col-span-2">
          <MaintenanceByBUChart data={agg.maintenanceByBU} />
        </div>
        <CapacityDistChart data={agg.capacityDistribution} />
      </div>

      {/* Map */}
      <TransformerMap />

      {/* Data Table */}
      <DataTable />
    </div>
  );
}
