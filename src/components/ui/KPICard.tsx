'use client';

import { useEffect, useRef, useState } from 'react';
import { motion } from 'framer-motion';

interface KPICardProps {
  title: string;
  value: number;
  subtitle?: string;
  icon: React.ReactNode;
  color: 'cyan' | 'green' | 'amber' | 'red' | 'pink';
  percentage?: number;
  secondaryLabel?: string;
  secondaryValue?: number;
  delay?: number;
  formatValue?: (n: number) => string;
}

function useCountUp(target: number, duration = 1200) {
  const [count, setCount] = useState(0);
  const prevTarget = useRef(0);

  useEffect(() => {
    const start = prevTarget.current;
    prevTarget.current = target;
    if (target === 0) { setCount(0); return; }

    const startTime = performance.now();
    let raf: number;

    function tick(now: number) {
      const elapsed = now - startTime;
      const progress = Math.min(elapsed / duration, 1);
      // Ease out cubic
      const eased = 1 - Math.pow(1 - progress, 3);
      setCount(Math.round(start + (target - start) * eased));
      if (progress < 1) raf = requestAnimationFrame(tick);
    }

    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [target, duration]);

  return count;
}

export default function KPICard({
  title, value, subtitle, icon, color, percentage,
  secondaryLabel, secondaryValue, delay = 0, formatValue,
}: KPICardProps) {
  const animatedValue = useCountUp(value);
  const gradientClass = `kpi-gradient-${color}`;

  const colorMap = {
    cyan: 'text-cyan-400',
    green: 'text-emerald-400',
    amber: 'text-amber-400',
    red: 'text-red-400',
    pink: 'text-pink-400',
  };

  const bgMap = {
    cyan: 'bg-cyan-400/10',
    green: 'bg-emerald-400/10',
    amber: 'bg-amber-400/10',
    red: 'bg-red-400/10',
    pink: 'bg-pink-400/10',
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 24 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: delay * 0.1, ease: 'easeOut' }}
      whileHover={{ scale: 1.03 }}
      className={`${gradientClass} rounded-2xl p-5 backdrop-blur-xl cursor-default relative overflow-hidden`}
    >
      <div className="flex items-start justify-between mb-3">
        <div className={`p-2 rounded-lg ${bgMap[color]}`}>
          <span className={colorMap[color]}>{icon}</span>
        </div>
        {percentage !== undefined && (
          <span className={`text-xs font-semibold px-2 py-1 rounded-full ${bgMap[color]} ${colorMap[color]}`}>
            {percentage}%
          </span>
        )}
      </div>

      <div className={`text-2xl font-bold ${colorMap[color]} tracking-tight`}>
        {formatValue ? formatValue(animatedValue) : animatedValue.toLocaleString()}
      </div>

      <div className="text-xs text-[#94a3b8] font-medium mt-1">{title}</div>

      {subtitle && (
        <div className="text-[11px] text-[#475569] mt-1">{subtitle}</div>
      )}

      {secondaryLabel && secondaryValue !== undefined && (
        <div className="text-[11px] text-[#475569] mt-1">
          {secondaryLabel}: <span className="text-[#94a3b8] font-medium">{secondaryValue.toLocaleString()}</span>
        </div>
      )}
    </motion.div>
  );
}
