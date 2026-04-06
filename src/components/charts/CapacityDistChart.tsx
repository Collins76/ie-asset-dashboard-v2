'use client';

import { motion } from 'framer-motion';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts';
import { CAPACITY_BUCKET_COLORS } from '@/lib/constants';

interface Props {
  data: { name: string; value: number }[];
}

export default function CapacityDistChart({ data }: Props) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.4 }}
      className="glass-card p-5"
    >
      <h3 className="text-sm font-semibold text-[#e2e8f0] mb-1">Capacity Distribution</h3>
      <p className="text-[11px] text-[#475569] mb-4">Transformer capacity ranges</p>
      <ResponsiveContainer width="100%" height={180}>
        <PieChart>
          <Pie
            data={data}
            cx="50%"
            cy="50%"
            outerRadius={75}
            dataKey="value"
            label={({ percent }) =>
              (percent ?? 0) > 0.05 ? `${((percent ?? 0) * 100).toFixed(0)}%` : ''
            }
            labelLine={false}
          >
            {data.map((_, i) => (
              <Cell key={i} fill={CAPACITY_BUCKET_COLORS[i]} />
            ))}
          </Pie>
          <Tooltip
            contentStyle={{
              background: 'rgba(10,15,28,0.96)',
              border: '1px solid rgba(255,255,255,0.1)',
              borderRadius: 8,
              fontSize: 12,
              color: '#e2e8f0',
            }}
          />
        </PieChart>
      </ResponsiveContainer>
      <div className="flex flex-wrap justify-center gap-3 mt-2">
        {data.map((d, i) => (
          <div key={d.name} className="flex items-center gap-1.5 text-[11px] text-[#94a3b8]">
            <div className="w-2.5 h-2.5 rounded-full" style={{ background: CAPACITY_BUCKET_COLORS[i] }} />
            {d.name}: {d.value.toLocaleString()}
          </div>
        ))}
      </div>
    </motion.div>
  );
}
