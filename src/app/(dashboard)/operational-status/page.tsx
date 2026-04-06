'use client';

import { useMemo } from 'react';
import { useDashboard } from '@/lib/store';
import { BUS, BU_COLORS, MAINTENANCE_LABELS, MAINT_COLORS } from '@/lib/constants';
import KPICard from '@/components/ui/KPICard';
import MaintenanceByBandChart from '@/components/charts/MaintenanceByBandChart';
import MaintenanceByBUChart from '@/components/charts/MaintenanceByBUChart';
import TransformerMap from '@/components/maps/TransformerMap';
import { KPISkeleton, ChartSkeleton, MapSkeleton } from '@/components/ui/LoadingSkeleton';
import { motion } from 'framer-motion';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts';

const HeartIcon = <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}><path strokeLinecap="round" strokeLinejoin="round" d="M21 8.25c0-2.485-2.099-4.5-4.688-4.5-1.935 0-3.597 1.126-4.312 2.733-.715-1.607-2.377-2.733-4.313-2.733C5.1 3.75 3 5.765 3 8.25c0 7.22 9 12 9 12s9-4.78 9-12z" /></svg>;
const WarningIcon = <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}><path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z" /></svg>;

export default function OperationalStatusPage() {
  const { aggregation, filteredData, isLoading } = useDashboard();

  const statusPieData = useMemo(() => {
    if (!aggregation) return [];
    return [
      { name: 'Healthy', value: aggregation.healthyCount, color: MAINT_COLORS[0] },
      { name: 'Faulty', value: aggregation.faultyCount, color: MAINT_COLORS[1] },
      { name: 'Out of Circuit', value: aggregation.outOfCircuitCount, color: MAINT_COLORS[2] },
      { name: 'Inactive', value: aggregation.inactiveCount, color: MAINT_COLORS[3] },
    ];
  }, [aggregation]);

  // Commissioning breakdown
  const commBreakdown = useMemo(() => {
    const commissioned = filteredData.filter((r) => r.commissioning === 0).length;
    const notCommissioned = filteredData.filter((r) => r.commissioning === 1).length;
    return [
      { name: 'Commissioned', value: commissioned },
      { name: 'Not Commissioned', value: notCommissioned },
    ];
  }, [filteredData]);

  if (isLoading || !aggregation) {
    return <div className="space-y-6"><KPISkeleton /><ChartSkeleton /><MapSkeleton /></div>;
  }

  const agg = aggregation;

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <KPICard title="Healthy DTs" value={agg.healthyCount} icon={HeartIcon} color="green" percentage={agg.healthyPct} delay={1} />
        <KPICard title="Faulty DTs" value={agg.faultyCount} icon={WarningIcon} color="red" delay={2} />
        <KPICard title="Out of Circuit" value={agg.outOfCircuitCount} icon={WarningIcon} color="amber" delay={3} />
        <KPICard title="Inactive DTs" value={agg.inactiveCount} icon={WarningIcon} color="pink" delay={4} />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <div className="lg:col-span-2">
          <MaintenanceByBUChart data={agg.maintenanceByBU} />
        </div>
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, delay: 0.3 }} className="glass-card p-5">
          <h3 className="text-sm font-semibold text-[#e2e8f0] mb-1">Overall Status</h3>
          <p className="text-[11px] text-[#475569] mb-4">Transformer health distribution</p>
          <ResponsiveContainer width="100%" height={200}>
            <PieChart>
              <Pie data={statusPieData} cx="50%" cy="50%" innerRadius={50} outerRadius={80} paddingAngle={2} dataKey="value">
                {statusPieData.map((entry) => <Cell key={entry.name} fill={entry.color} />)}
              </Pie>
              <Tooltip contentStyle={{ background: 'rgba(10,15,28,0.96)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 8, fontSize: 12, color: '#e2e8f0' }} />
            </PieChart>
          </ResponsiveContainer>
          <div className="flex flex-wrap justify-center gap-3 mt-2">
            {statusPieData.map((d) => (
              <div key={d.name} className="flex items-center gap-1.5 text-[11px] text-[#94a3b8]">
                <div className="w-2.5 h-2.5 rounded-full" style={{ background: d.color }} />
                {d.name}: {d.value.toLocaleString()}
              </div>
            ))}
          </div>
        </motion.div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <div className="lg:col-span-2">
          <MaintenanceByBandChart data={agg.maintenanceByBand} />
        </div>
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, delay: 0.4 }} className="glass-card p-5">
          <h3 className="text-sm font-semibold text-[#e2e8f0] mb-1">Commissioning Status</h3>
          <p className="text-[11px] text-[#475569] mb-4">Commissioned vs not commissioned</p>
          <ResponsiveContainer width="100%" height={180}>
            <PieChart>
              <Pie data={commBreakdown} cx="50%" cy="50%" outerRadius={75} dataKey="value" label={({ percent }) => `${((percent ?? 0) * 100).toFixed(0)}%`} labelLine={false}>
                <Cell fill="#10B981" />
                <Cell fill="#EF4444" />
              </Pie>
              <Tooltip contentStyle={{ background: 'rgba(10,15,28,0.96)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 8, fontSize: 12, color: '#e2e8f0' }} />
            </PieChart>
          </ResponsiveContainer>
          <div className="flex justify-center gap-4 mt-2">
            {commBreakdown.map((d, i) => (
              <div key={d.name} className="flex items-center gap-1.5 text-[11px] text-[#94a3b8]">
                <div className="w-2.5 h-2.5 rounded-full" style={{ background: i === 0 ? '#10B981' : '#EF4444' }} />
                {d.name}: {d.value.toLocaleString()}
              </div>
            ))}
          </div>
        </motion.div>
      </div>

      <TransformerMap />
    </div>
  );
}
