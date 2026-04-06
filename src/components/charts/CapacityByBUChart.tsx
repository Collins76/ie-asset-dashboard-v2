'use client';

import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell, CartesianGrid,
} from 'recharts';
import { BU_COLORS } from '@/lib/constants';

interface Props {
  data: { bu: string; capacity: number; count: number }[];
}

function fmtMVA(kva: number): string {
  const m = (kva || 0) / 1000;
  if (m >= 1000) return (m / 1000).toFixed(1) + 'GVA';
  return m.toFixed(0) + 'MVA';
}

function DarkTooltip({ active, payload, label }: { active?: boolean; payload?: Array<{ value: number }>; label?: string }) {
  if (!active || !payload?.length) return null;
  return (
    <div style={{
      background: 'rgba(10,15,28,.96)',
      border: '1px solid rgba(255,255,255,.1)',
      borderRadius: 8,
      padding: '10px 14px',
      fontSize: 12,
      color: '#E2E8F0',
    }}>
      <div style={{ fontWeight: 600, marginBottom: 4 }}>{label}</div>
      <div>Capacity: {fmtMVA(payload[0].value)}</div>
    </div>
  );
}

export default function CapacityByBUChart({ data }: Props) {
  return (
    <div className="glass-card">
      <div style={{ fontSize: 14, fontWeight: 600, color: '#E2E8F0', marginBottom: 3 }}>Capacity by Business Unit</div>
      <div style={{ fontSize: 11, color: '#475569', marginBottom: 14 }}>Total installed capacity per BU</div>
      <ResponsiveContainer width="100%" height={230}>
        <BarChart data={data} margin={{ top: 4, right: 8, left: 0, bottom: 4 }}>
          <defs>
            {data.map((d, i) => (
              <linearGradient key={i} id={`gb${i}`} x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor={BU_COLORS[d.bu] || '#64748b'} stopOpacity={0.9} />
                <stop offset="100%" stopColor={BU_COLORS[d.bu] || '#64748b'} stopOpacity={0.25} />
              </linearGradient>
            ))}
          </defs>
          <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,.05)" vertical={false} />
          <XAxis
            dataKey="bu"
            tickFormatter={(v: string) => v.split(' ')[0]}
            tick={{ fill: '#64748B', fontSize: 10 }}
            axisLine={false}
            tickLine={false}
          />
          <YAxis
            tickFormatter={(v: number) => fmtMVA(v)}
            tick={{ fill: '#64748B', fontSize: 10 }}
            axisLine={false}
            tickLine={false}
          />
          <Tooltip content={<DarkTooltip />} />
          <Bar dataKey="capacity" radius={[5, 5, 0, 0]}>
            {data.map((_, i) => (
              <Cell key={i} fill={`url(#gb${i})`} />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
