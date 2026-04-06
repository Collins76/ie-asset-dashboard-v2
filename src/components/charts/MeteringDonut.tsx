'use client';

import { motion } from 'framer-motion';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts';
import { METER_COLORS } from '@/lib/constants';

interface Props {
  data: { name: string; value: number }[];
  total: number;
}

export default function MeteringDonut({ data, total }: Props) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.3 }}
      className="glass-card p-5"
    >
      <h3 className="text-sm font-semibold text-[#e2e8f0] mb-1">Metering Status</h3>
      <p className="text-[11px] text-[#475569] mb-4">Distribution by metering type</p>
      <div className="relative">
        <ResponsiveContainer width="100%" height={200}>
          <PieChart>
            <Pie
              data={data}
              cx="50%"
              cy="50%"
              innerRadius={58}
              outerRadius={88}
              paddingAngle={2}
              dataKey="value"
              label={({ percent }) =>
                (percent ?? 0) > 0.05 ? `${((percent ?? 0) * 100).toFixed(0)}%` : ''
              }
              labelLine={false}
            >
              {data.map((entry) => (
                <Cell key={entry.name} fill={METER_COLORS[entry.name] || '#64748b'} />
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
        {/* Center text */}
        <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
          <span className="text-xl font-bold text-white">{total.toLocaleString()}</span>
          <span className="text-[10px] text-[#64748b]">Total DTs</span>
        </div>
      </div>
      {/* Legend */}
      <div className="flex justify-center gap-4 mt-2">
        {data.map((d) => (
          <div key={d.name} className="flex items-center gap-1.5 text-[11px] text-[#94a3b8]">
            <div className="w-2.5 h-2.5 rounded-full" style={{ background: METER_COLORS[d.name] }} />
            {d.name}: {d.value.toLocaleString()}
          </div>
        ))}
      </div>
    </motion.div>
  );
}
