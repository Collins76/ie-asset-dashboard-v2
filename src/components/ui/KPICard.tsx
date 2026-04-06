'use client';

import { useEffect, useRef, useState } from 'react';

interface KPICardProps {
  title: string;
  value: number;
  subtitle?: string;
  icon: React.ReactNode;
  color: 'cyan' | 'green' | 'amber' | 'red' | 'pink';
  percentage?: number;
  delay?: number;
  formatValue?: (n: number) => string;
}

const COLOR_HEX: Record<string, string> = {
  cyan: '#06B6D4',
  green: '#10B981',
  amber: '#F59E0B',
  red: '#EF4444',
  pink: '#EC4899',
};

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
  title, value, subtitle, icon, color, percentage, delay = 0, formatValue,
}: KPICardProps) {
  const animatedValue = useCountUp(value);
  const hex = COLOR_HEX[color];
  const delayClass = `fade-up-${Math.min(delay, 6)}`;

  return (
    <div
      className={`kpi-card ${delayClass}`}
      style={{
        border: `1px solid ${hex}22`,
        position: 'relative',
        overflow: 'hidden',
      }}
    >
      {/* Background glow blob */}
      <div style={{
        position: 'absolute',
        top: -20,
        right: -20,
        width: 80,
        height: 80,
        borderRadius: '50%',
        background: `${hex}10`,
        filter: 'blur(20px)',
        pointerEvents: 'none',
      }} />

      {/* Header: Icon + Percentage */}
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 12 }}>
        <div style={{
          background: `${hex}18`,
          borderRadius: 10,
          padding: 9,
          border: `1px solid ${hex}25`,
          display: 'flex',
        }}>
          {icon}
        </div>
        {percentage != null && (
          <div style={{
            background: `${hex}15`,
            color: hex,
            fontSize: 11,
            fontWeight: 700,
            padding: '3px 10px',
            borderRadius: 20,
            border: `1px solid ${hex}30`,
          }}>
            {percentage}%
          </div>
        )}
      </div>

      {/* Value */}
      <div style={{
        fontSize: 26,
        fontWeight: 800,
        color: hex,
        textShadow: `0 0 20px ${hex}60`,
        letterSpacing: '-.5px',
        lineHeight: 1.2,
      }}>
        {formatValue ? formatValue(animatedValue) : animatedValue.toLocaleString()}
      </div>

      {/* Title */}
      <div style={{ color: '#CBD5E1', fontSize: 13, marginTop: 4 }}>
        {title}
      </div>

      {/* Subtitle */}
      {subtitle && (
        <div style={{ color: '#475569', fontSize: 11, marginTop: 2 }}>
          {subtitle}
        </div>
      )}
    </div>
  );
}
