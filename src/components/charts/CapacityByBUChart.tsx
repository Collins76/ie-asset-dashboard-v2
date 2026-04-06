'use client';

import { motion } from 'framer-motion';
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell,
} from 'recharts';
import { BU_COLORS } from '@/lib/constants';
import { formatCapacity } from '@/lib/data';

interface Props {
  data: { bu: string; capacity: number; count: number }[];
}

export default function CapacityByBUChart({ data }: Props) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.2 }}
      className="glass-card p-5"
    >
      <h3 className="text-sm font-semibold text-[#e2e8f0] mb-1">Capacity by Business Unit</h3>
      <p className="text-[11px] text-[#475569] mb-4">Total installed capacity per BU</p>
      <ResponsiveContainer width="100%" height={230}>
        <BarChart data={data} margin={{ top: 5, right: 5, bottom: 5, left: 5 }}>
          <XAxis
            dataKey="bu"
            tickFormatter={(v: string) => v.split(' ')[0]}
            tick={{ fill: '#64748b', fontSize: 11 }}
            axisLine={false}
            tickLine={false}
          />
          <YAxis
            tickFormatter={(v: number) => formatCapacity(v)}
            tick={{ fill: '#64748b', fontSize: 10 }}
            axisLine={false}
            tickLine={false}
            width={60}
          />
          <Tooltip
            contentStyle={{
              background: 'rgba(10,15,28,0.96)',
              border: '1px solid rgba(255,255,255,0.1)',
              borderRadius: 8,
              fontSize: 12,
              color: '#e2e8f0',
            }}
            formatter={(value) => [formatCapacity(Number(value)), 'Capacity']}
            labelStyle={{ color: '#94a3b8' }}
          />
          <Bar dataKey="capacity" radius={[5, 5, 0, 0]}>
            {data.map((entry) => (
              <Cell key={entry.bu} fill={BU_COLORS[entry.bu] || '#64748b'} />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </motion.div>
  );
}
