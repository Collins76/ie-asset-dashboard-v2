'use client';

import { motion } from 'framer-motion';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts';
import { METER_COLORS } from '@/lib/constants';

interface Props {
  data: { name: string; value: number }[];
  total: number;
}

function fmt(n: number): string {
  if (n >= 1e6) return (n / 1e6).toFixed(2) + 'M';
  if (n >= 1e3) return (n / 1e3).toFixed(1) + 'K';
  return (n || 0).toLocaleString();
}

export default function MeteringDonut({ data, total }: Props) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.3 }}
      className="glass-card"
    >
      <div className="chart-title">Metering Status</div>
      <div className="chart-sub">Distribution by metering type</div>
      <div style={{ position: 'relative' }}>
        <ResponsiveContainer width="100%" height={210}>
          <PieChart>
            <Pie
              data={data}
              cx="50%"
              cy="50%"
              innerRadius={58}
              outerRadius={88}
              paddingAngle={2}
              dataKey="value"
              labelLine={false}
              label={({ percent }) =>
                (percent ?? 0) > 0.05 ? `${((percent ?? 0) * 100).toFixed(0)}%` : ''
              }
            >
              {data.map((entry) => (
                <Cell key={entry.name} fill={METER_COLORS[entry.name] || '#64748b'} stroke="none" />
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
        {/* Center donut label - matching original */}
        <div style={{
          position: 'absolute',
          top: '50%',
          left: '50%',
          transform: 'translate(-50%, -58%)',
          textAlign: 'center',
          pointerEvents: 'none',
        }}>
          <div style={{
            fontSize: 22,
            fontWeight: 800,
            color: '#06B6D4',
            textShadow: '0 0 18px rgba(6,182,212,.6)',
          }}>
            {fmt(total)}
          </div>
          <div style={{ fontSize: 10, color: '#64748B', fontWeight: 500 }}>
            Total DTs
          </div>
        </div>
      </div>
      {/* Legend */}
      <div style={{ display: 'flex', justifyContent: 'center', gap: 16, marginTop: 8 }}>
        {data.map((d) => (
          <div key={d.name} style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 11, color: '#94a3b8' }}>
            <div style={{ width: 10, height: 10, borderRadius: '50%', background: METER_COLORS[d.name] }} />
            {d.name}: {d.value.toLocaleString()}
          </div>
        ))}
      </div>
    </motion.div>
  );
}
