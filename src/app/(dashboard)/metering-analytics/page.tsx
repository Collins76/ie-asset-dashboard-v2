'use client';

import { useMemo } from 'react';
import { useDashboard } from '@/lib/store';
import { BUS, BU_COLORS, METERING_LABELS, METER_COLORS } from '@/lib/constants';
import KPICard from '@/components/ui/KPICard';
import MeteringDonut from '@/components/charts/MeteringDonut';
import { KPISkeleton, ChartSkeleton } from '@/components/ui/LoadingSkeleton';
import { motion } from 'framer-motion';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Legend, PieChart, Pie, Cell } from 'recharts';

const GaugeIcon = <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}><path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6h4.5m4.5 0a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>;

export default function MeteringAnalyticsPage() {
  const { aggregation, filteredData, isLoading } = useDashboard();

  const meteringByBU = useMemo(() => {
    return BUS.map((bu, i) => {
      const buData = filteredData.filter((r) => r.bu === i);
      return {
        bu,
        METERED: buData.filter((r) => r.metering === 0).length,
        'METERED EST.': buData.filter((r) => r.metering === 1).length,
        UNMETERED: buData.filter((r) => r.metering === 2).length,
      };
    });
  }, [filteredData]);

  const meteringByBand = useMemo(() => {
    const bands = ['Band A', 'Band B', 'Band C', 'Band D', 'Band E'];
    return bands.map((band, i) => {
      const bandData = filteredData.filter((r) => r.band === i);
      return {
        band,
        METERED: bandData.filter((r) => r.metering === 0).length,
        'METERED EST.': bandData.filter((r) => r.metering === 1).length,
        UNMETERED: bandData.filter((r) => r.metering === 2).length,
      };
    });
  }, [filteredData]);

  if (isLoading || !aggregation) {
    return <div className="space-y-6"><KPISkeleton /><ChartSkeleton /><ChartSkeleton /></div>;
  }

  const agg = aggregation;
  const meterEstPct = agg.totalCount > 0 ? Math.round((agg.meteredEstCount / agg.totalCount) * 100) : 0;

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <KPICard title="Metered DTs" value={agg.meteredCount} icon={GaugeIcon} color="green" percentage={agg.meteredPct} delay={1} />
        <KPICard title="Metered (Est.)" value={agg.meteredEstCount} icon={GaugeIcon} color="amber" percentage={meterEstPct} delay={2} />
        <KPICard title="Unmetered DTs" value={agg.unmeteredCount} icon={GaugeIcon} color="red" delay={3} />
        <KPICard title="Metering Gap" value={agg.unmeteredCount + agg.meteredEstCount} icon={GaugeIcon} color="pink" delay={4} subtitle="Unmetered + Estimated" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <div className="lg:col-span-2">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, delay: 0.2 }} className="glass-card p-5">
            <h3 className="text-sm font-semibold text-[#e2e8f0] mb-1">Metering by Business Unit</h3>
            <p className="text-[11px] text-[#475569] mb-4">Breakdown of metering status per BU</p>
            <ResponsiveContainer width="100%" height={260}>
              <BarChart data={meteringByBU}>
                <XAxis dataKey="bu" tickFormatter={(v: string) => v.split(' ')[0]} tick={{ fill: '#64748b', fontSize: 11 }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fill: '#64748b', fontSize: 10 }} axisLine={false} tickLine={false} />
                <Tooltip contentStyle={{ background: 'rgba(10,15,28,0.96)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 8, fontSize: 12, color: '#e2e8f0' }} />
                <Legend wrapperStyle={{ fontSize: 11, color: '#94a3b8' }} />
                <Bar dataKey="METERED" stackId="a" fill="#10B981" />
                <Bar dataKey="METERED EST." stackId="a" fill="#F59E0B" />
                <Bar dataKey="UNMETERED" stackId="a" fill="#EF4444" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </motion.div>
        </div>
        <MeteringDonut data={agg.meteringBreakdown} total={agg.totalCount} />
      </div>

      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, delay: 0.3 }} className="glass-card p-5">
        <h3 className="text-sm font-semibold text-[#e2e8f0] mb-1">Metering by SRT Band</h3>
        <p className="text-[11px] text-[#475569] mb-4">Metering coverage across tariff bands</p>
        <ResponsiveContainer width="100%" height={260}>
          <BarChart data={meteringByBand}>
            <XAxis dataKey="band" tickFormatter={(v: string) => v.replace('Band ', '')} tick={{ fill: '#64748b', fontSize: 11 }} axisLine={false} tickLine={false} />
            <YAxis tick={{ fill: '#64748b', fontSize: 10 }} axisLine={false} tickLine={false} />
            <Tooltip contentStyle={{ background: 'rgba(10,15,28,0.96)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 8, fontSize: 12, color: '#e2e8f0' }} />
            <Legend wrapperStyle={{ fontSize: 11, color: '#94a3b8' }} />
            <Bar dataKey="METERED" stackId="a" fill="#10B981" />
            <Bar dataKey="METERED EST." stackId="a" fill="#F59E0B" />
            <Bar dataKey="UNMETERED" stackId="a" fill="#EF4444" radius={[4, 4, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </motion.div>
    </div>
  );
}
