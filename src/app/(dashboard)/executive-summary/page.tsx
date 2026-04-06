'use client';

import { useDashboard } from '@/lib/store';
import KPICard from '@/components/ui/KPICard';
import CapacityByBUChart from '@/components/charts/CapacityByBUChart';
import MeteringDonut from '@/components/charts/MeteringDonut';
import MaintenanceByBandChart from '@/components/charts/MaintenanceByBandChart';
import VoltageChart from '@/components/charts/VoltageChart';
import MaintenanceByBUChart from '@/components/charts/MaintenanceByBUChart';
import CapacityDistChart from '@/components/charts/CapacityDistChart';
import TransformerMap from '@/components/maps/TransformerMap';
import DataTable from '@/components/ui/DataTable';
import { PageSkeleton } from '@/components/ui/LoadingSkeleton';

// Animated SVG Icons matching the original dashboard
function IcoBolt({ c }: { c: string }) {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke={c} strokeWidth={1.5}>
      <style>{`@keyframes bolt-flash{0%,100%{opacity:1;filter:drop-shadow(0 0 2px ${c})}50%{opacity:.7;filter:drop-shadow(0 0 8px ${c})}}`}</style>
      <path d="M13 10V3L4 14h7v7l9-11h-7z" strokeLinecap="round" strokeLinejoin="round" style={{ animation: 'bolt-flash 1.8s ease-in-out infinite' }} />
    </svg>
  );
}
function IcoBattery({ c }: { c: string }) {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke={c} strokeWidth={1.5}>
      <rect x="2" y="7" width="18" height="10" rx="2" /><path d="M22 11v2" /><rect x="4" y="9" width="7" height="6" rx="1" fill={c} opacity=".3" />
    </svg>
  );
}
function IcoGauge({ c }: { c: string }) {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke={c} strokeWidth={1.5}>
      <circle cx="12" cy="12" r="10" /><path d="M12 6v2" /><path d="M12 12l3.5-3.5" strokeLinecap="round" />
    </svg>
  );
}
function IcoHeart({ c }: { c: string }) {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke={c} strokeWidth={1.5}>
      <style>{`@keyframes heart-beat{0%,100%{transform:scale(1)}50%{transform:scale(1.15)}}`}</style>
      <path d="M20.84 4.61a5.5 5.5 0 00-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 00-7.78 7.78L12 21.23l8.84-8.84a5.5 5.5 0 000-7.78z" style={{ animation: 'heart-beat 1.4s ease-in-out infinite' }} />
    </svg>
  );
}
function IcoWarn({ c }: { c: string }) {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke={c} strokeWidth={1.5}>
      <style>{`@keyframes warn-blink{0%,100%{opacity:1}50%{opacity:.3}}`}</style>
      <path d="M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z" style={{ animation: 'warn-blink 1s ease-in-out infinite' }} />
      <line x1="12" y1="9" x2="12" y2="13" /><line x1="12" y1="17" x2="12.01" y2="17" />
    </svg>
  );
}
function IcoMapGrid({ c }: { c: string }) {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke={c} strokeWidth={1.5}>
      <rect x="3" y="3" width="7" height="7" rx="1" /><rect x="14" y="3" width="7" height="7" rx="1" />
      <rect x="3" y="14" width="7" height="7" rx="1" /><rect x="14" y="14" width="7" height="7" rx="1" />
    </svg>
  );
}
function IcoNetwork({ c }: { c: string }) {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke={c} strokeWidth={1.5}>
      <path d="M7.5 21L3 16.5m0 0L7.5 12M3 16.5h13.5m0-13.5L21 7.5m0 0L16.5 12M21 7.5H7.5" />
    </svg>
  );
}

function fmtMVA(kva: number): string {
  const m = (kva || 0) / 1000;
  if (m >= 1000) return (m / 1000).toFixed(2) + ' GVA';
  if (m >= 1) return m.toFixed(2) + ' MVA';
  return m.toFixed(3) + ' MVA';
}

export default function ExecutiveSummaryPage() {
  const { aggregation, isLoading, filteredData } = useDashboard();

  if (isLoading || !aggregation) {
    return <PageSkeleton />;
  }

  const agg = aggregation;

  return (
    <div className="space-y-4">
      {/* KPI Cards - auto-fit grid matching original */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(190px, 1fr))', gap: 14 }}>
        <KPICard
          title="Total Transformers"
          value={agg.totalCount}
          subtitle={`${agg.publicCount.toLocaleString()} Public · ${agg.privateCount.toLocaleString()} Private`}
          icon={<IcoBolt c="#06B6D4" />}
          color="cyan"
          delay={1}
        />
        <KPICard
          title="Network Capacity"
          value={agg.totalCapacity}
          icon={<IcoBattery c="#10B981" />}
          color="green"
          delay={2}
          formatValue={(v) => fmtMVA(v)}
        />
        <KPICard
          title="Metered DTs"
          value={agg.meteredCount + agg.meteredEstCount}
          subtitle={`${agg.unmeteredCount.toLocaleString()} unmetered`}
          icon={<IcoGauge c="#F59E0B" />}
          color="amber"
          percentage={agg.meteredPct}
          delay={3}
        />
        <KPICard
          title="Grid Health"
          value={agg.healthyCount}
          subtitle={`${agg.faultyCount.toLocaleString()} faulty · ${agg.outOfCircuitCount.toLocaleString()} OOC`}
          icon={<IcoHeart c="#10B981" />}
          color="green"
          percentage={agg.healthyPct}
          delay={4}
        />
        <KPICard
          title="Faulty Transformers"
          value={agg.faultyCount}
          icon={<IcoWarn c="#EF4444" />}
          color="red"
          delay={5}
        />
        <KPICard
          title="Unique UT Zones"
          value={agg.uniqueUTs}
          icon={<IcoMapGrid c="#06B6D4" />}
          color="cyan"
          delay={6}
        />
        <KPICard
          title="Unique Feeders"
          value={agg.uniqueFeeders}
          icon={<IcoNetwork c="#EC4899" />}
          color="pink"
          delay={7}
        />
      </div>

      {/* Charts Row 1: Capacity by BU (2fr) + Metering Donut (1fr) */}
      <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: 16 }}>
        <CapacityByBUChart data={agg.capacityByBU} />
        <MeteringDonut data={agg.meteringBreakdown} total={agg.totalCount} />
      </div>

      {/* Charts Row 2: Maintenance by Band (2fr) + Capacity Distribution (1fr) */}
      <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: 16 }}>
        <MaintenanceByBandChart data={agg.maintenanceByBand} />
        <CapacityDistChart data={agg.capacityDistribution} />
      </div>

      {/* Charts Row 3: Maintenance by BU (2fr) + Voltage Split (1fr) */}
      <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: 16 }}>
        <MaintenanceByBUChart data={agg.maintenanceByBU} />
        <VoltageChart data={agg.voltageSplit} />
      </div>

      {/* Map */}
      <TransformerMap />

      {/* Data Table */}
      <DataTable />
    </div>
  );
}
