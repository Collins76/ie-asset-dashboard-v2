'use client';

import { motion } from 'framer-motion';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Legend } from 'recharts';

interface Props {
  data: { band: string; HEALTHY: number; FAULTY: number; OUT: number }[];
}

export default function MaintenanceByBandChart({ data }: Props) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.4 }}
      className="glass-card p-5"
    >
      <h3 className="text-sm font-semibold text-[#e2e8f0] mb-1">Maintenance by SRT Band</h3>
      <p className="text-[11px] text-[#475569] mb-4">Health status breakdown per band</p>
      <ResponsiveContainer width="100%" height={230}>
        <BarChart data={data} margin={{ top: 5, right: 5, bottom: 5, left: 5 }}>
          <XAxis
            dataKey="band"
            tickFormatter={(v: string) => v.replace('Band ', '')}
            tick={{ fill: '#64748b', fontSize: 11 }}
            axisLine={false}
            tickLine={false}
          />
          <YAxis
            tick={{ fill: '#64748b', fontSize: 10 }}
            axisLine={false}
            tickLine={false}
            width={50}
          />
          <Tooltip
            contentStyle={{
              background: 'rgba(10,15,28,0.96)',
              border: '1px solid rgba(255,255,255,0.1)',
              borderRadius: 8,
              fontSize: 12,
              color: '#e2e8f0',
            }}
          />
          <Legend
            wrapperStyle={{ fontSize: 11, color: '#94a3b8' }}
          />
          <Bar dataKey="HEALTHY" stackId="a" fill="#10B981" radius={[0, 0, 0, 0]} />
          <Bar dataKey="FAULTY" stackId="a" fill="#EF4444" />
          <Bar dataKey="OUT" stackId="a" fill="#F59E0B" radius={[4, 4, 0, 0]} />
        </BarChart>
      </ResponsiveContainer>
    </motion.div>
  );
}
