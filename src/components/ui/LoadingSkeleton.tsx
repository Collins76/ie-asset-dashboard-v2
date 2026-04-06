'use client';

export function KPISkeleton() {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 xl:grid-cols-7 gap-4">
      {Array.from({ length: 7 }).map((_, i) => (
        <div key={i} className="rounded-2xl p-5 border border-white/[0.07] bg-[#1e293b]/50">
          <div className="skeleton h-8 w-8 rounded-lg mb-3" />
          <div className="skeleton h-7 w-20 mb-2" />
          <div className="skeleton h-3 w-24 mb-1" />
          <div className="skeleton h-3 w-16" />
        </div>
      ))}
    </div>
  );
}

export function ChartSkeleton({ height = 230 }: { height?: number }) {
  return (
    <div className="glass-card p-5" style={{ pointerEvents: 'none' }}>
      <div className="skeleton h-4 w-40 mb-2" />
      <div className="skeleton h-3 w-28 mb-4" />
      <div className="skeleton w-full" style={{ height }} />
    </div>
  );
}

export function MapSkeleton() {
  return (
    <div className="glass-card overflow-hidden">
      <div className="skeleton w-full h-[460px]" />
    </div>
  );
}

export function TableSkeleton() {
  return (
    <div className="glass-card p-5">
      <div className="skeleton h-5 w-48 mb-4" />
      <div className="space-y-2">
        {Array.from({ length: 10 }).map((_, i) => (
          <div key={i} className="skeleton h-10 w-full" />
        ))}
      </div>
    </div>
  );
}

export function PageSkeleton() {
  return (
    <div className="space-y-6 p-6">
      <KPISkeleton />
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <div className="lg:col-span-2"><ChartSkeleton /></div>
        <ChartSkeleton />
      </div>
      <MapSkeleton />
    </div>
  );
}
