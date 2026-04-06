'use client';

import { useDashboard } from '@/lib/store';
import { formatCapacity } from '@/lib/data';
import { BUS, BU_COLORS } from '@/lib/constants';
import KPICard from '@/components/ui/KPICard';
import CapacityByBUChart from '@/components/charts/CapacityByBUChart';
import VoltageChart from '@/components/charts/VoltageChart';
import CapacityDistChart from '@/components/charts/CapacityDistChart';
import TransformerMap from '@/components/maps/TransformerMap';
import { KPISkeleton, ChartSkeleton, MapSkeleton } from '@/components/ui/LoadingSkeleton';
import { motion } from 'framer-motion';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from 'recharts';

const BatteryIcon = <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}><path strokeLinecap="round" strokeLinejoin="round" d="M21 10.5h.375c.621 0 1.125.504 1.125 1.125v2.25c0 .621-.504 1.125-1.125 1.125H21M3.75 18h15A2.25 2.25 0 0021 15.75v-6a2.25 2.25 0 00-2.25-2.25h-15A2.25 2.25 0 001.5 9.75v6A2.25 2.25 0 003.75 18z" /></svg>;

export default function NetworkInfrastructurePage() {
  const { aggregation, filteredData, isLoading } = useDashboard();

  if (isLoading || !aggregation) {
    return <div className="space-y-6"><KPISkeleton /><ChartSkeleton /><MapSkeleton /></div>;
  }

  const agg = aggregation;

  // Compute BU breakdown table data
  const buBreakdown = BUS.map((bu, i) => {
    const buData = filteredData.filter((r) => r.bu === i);
    const totalCap = buData.reduce((s, r) => s + r.capacity, 0);
    const v11 = buData.filter((r) => r.voltage === 0).length;
    const v33 = buData.filter((r) => r.voltage === 1).length;
    const ground = buData.filter((r) => r.installation === 0).length;
    const pole = buData.filter((r) => r.installation === 1).length;
    return { bu, count: buData.length, capacity: totalCap, v11, v33, ground, pole, color: BU_COLORS[bu] };
  });

  // Transformers by installation type
  const installData = [
    { name: 'Ground', value: filteredData.filter((r) => r.installation === 0).length },
    { name: 'Pole Mounted', value: filteredData.filter((r) => r.installation === 1).length },
  ];

  return (
    <div className="space-y-6">
      {/* KPI Row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <KPICard title="Total Network Capacity" value={agg.totalCapacity} icon={BatteryIcon} color="green" formatValue={formatCapacity} delay={1} />
        <KPICard title="11kV Transformers" value={agg.voltageSplit[0].value} icon={BatteryIcon} color="cyan" delay={2} />
        <KPICard title="33kV Transformers" value={agg.voltageSplit[1].value} icon={BatteryIcon} color="amber" delay={3} />
        <KPICard title="Avg Capacity" value={agg.totalCount > 0 ? Math.round(agg.totalCapacity / agg.totalCount) : 0} icon={BatteryIcon} color="pink" delay={4} formatValue={(v) => `${v} kVA`} />
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <div className="lg:col-span-2">
          <CapacityByBUChart data={agg.capacityByBU} />
        </div>
        <VoltageChart data={agg.voltageSplit} />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <div className="lg:col-span-2">
          {/* Installation Type Bar Chart */}
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, delay: 0.3 }} className="glass-card p-5">
            <h3 className="text-sm font-semibold text-[#e2e8f0] mb-1">Installation Type</h3>
            <p className="text-[11px] text-[#475569] mb-4">Ground vs Pole Mounted</p>
            <ResponsiveContainer width="100%" height={200}>
              <BarChart data={installData}>
                <XAxis dataKey="name" tick={{ fill: '#64748b', fontSize: 11 }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fill: '#64748b', fontSize: 10 }} axisLine={false} tickLine={false} />
                <Tooltip contentStyle={{ background: 'rgba(10,15,28,0.96)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 8, fontSize: 12, color: '#e2e8f0' }} />
                <Bar dataKey="value" radius={[5, 5, 0, 0]}>
                  <Cell fill="#06B6D4" />
                  <Cell fill="#8B5CF6" />
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </motion.div>
        </div>
        <CapacityDistChart data={agg.capacityDistribution} />
      </div>

      {/* BU Breakdown Table */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, delay: 0.4 }} className="glass-card p-5">
        <h3 className="text-sm font-semibold text-[#e2e8f0] mb-4">Business Unit Infrastructure Summary</h3>
        <div className="overflow-x-auto">
          <table className="w-full text-xs">
            <thead>
              <tr className="border-b border-white/[0.07]">
                <th className="text-left py-2 px-3 text-[#64748b] font-semibold uppercase text-[10px] tracking-wider">Business Unit</th>
                <th className="text-right py-2 px-3 text-[#64748b] font-semibold uppercase text-[10px] tracking-wider">DTs</th>
                <th className="text-right py-2 px-3 text-[#64748b] font-semibold uppercase text-[10px] tracking-wider">Capacity</th>
                <th className="text-right py-2 px-3 text-[#64748b] font-semibold uppercase text-[10px] tracking-wider">11kV</th>
                <th className="text-right py-2 px-3 text-[#64748b] font-semibold uppercase text-[10px] tracking-wider">33kV</th>
                <th className="text-right py-2 px-3 text-[#64748b] font-semibold uppercase text-[10px] tracking-wider">Ground</th>
                <th className="text-right py-2 px-3 text-[#64748b] font-semibold uppercase text-[10px] tracking-wider">Pole</th>
              </tr>
            </thead>
            <tbody>
              {buBreakdown.map((row) => (
                <tr key={row.bu} className="border-b border-white/[0.04] hover:bg-white/[0.02]">
                  <td className="py-2 px-3 font-medium" style={{ color: row.color }}>{row.bu}</td>
                  <td className="py-2 px-3 text-right text-[#cbd5e1]">{row.count.toLocaleString()}</td>
                  <td className="py-2 px-3 text-right text-[#cbd5e1] font-semibold">{formatCapacity(row.capacity)}</td>
                  <td className="py-2 px-3 text-right text-[#cbd5e1]">{row.v11.toLocaleString()}</td>
                  <td className="py-2 px-3 text-right text-[#cbd5e1]">{row.v33.toLocaleString()}</td>
                  <td className="py-2 px-3 text-right text-[#cbd5e1]">{row.ground.toLocaleString()}</td>
                  <td className="py-2 px-3 text-right text-[#cbd5e1]">{row.pole.toLocaleString()}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </motion.div>

      {/* Map */}
      <TransformerMap />
    </div>
  );
}
