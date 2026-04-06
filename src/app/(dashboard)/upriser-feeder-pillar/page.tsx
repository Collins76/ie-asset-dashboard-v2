'use client';

import { useEffect, useState, useMemo } from 'react';
import { motion } from 'framer-motion';
import dynamic from 'next/dynamic';
import KPICard from '@/components/ui/KPICard';
import { KPISkeleton, MapSkeleton } from '@/components/ui/LoadingSkeleton';

const MapContainer = dynamic(() => import('react-leaflet').then((m) => m.MapContainer), { ssr: false });
const TileLayer = dynamic(() => import('react-leaflet').then((m) => m.TileLayer), { ssr: false });
const CircleMarker = dynamic(() => import('react-leaflet').then((m) => m.CircleMarker), { ssr: false });
const Popup = dynamic(() => import('react-leaflet').then((m) => m.Popup), { ssr: false });

const ZapIcon = <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}><path strokeLinecap="round" strokeLinejoin="round" d="M13 10V3L4 14h7v7l9-11h-7z" /></svg>;

interface UpriserFeature {
  type: string;
  properties: Record<string, string | number | undefined>;
  geometry: { type: string; coordinates: number[] };
}

export default function UpriserFeederPillarPage() {
  const [data, setData] = useState<UpriserFeature[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
    import('leaflet/dist/leaflet.css');

    async function load() {
      try {
        const res = await fetch('/api/data?type=upriser');
        const json = await res.json();
        // Data could be GeoJSON features or compact array
        const features = json.data?.features || json.data || [];
        setData(features);
      } catch (err) {
        console.error('Failed to load upriser data:', err);
      } finally {
        setIsLoading(false);
      }
    }
    load();
  }, []);

  const stats = useMemo(() => {
    const total = data.length;
    const types: Record<string, number> = {};
    data.forEach((f) => {
      const t = String(f.properties?.type || f.properties?.Type || f.properties?.ASSET_TYPE || 'Unknown');
      types[t] = (types[t] || 0) + 1;
    });
    return { total, types };
  }, [data]);

  if (isLoading) {
    return <div className="space-y-6"><KPISkeleton /><MapSkeleton /></div>;
  }

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <KPICard title="Total Assets" value={stats.total} icon={ZapIcon} color="cyan" delay={1} />
        {Object.entries(stats.types).slice(0, 3).map(([type, count], i) => (
          <KPICard key={type} title={type} value={count} icon={ZapIcon} color={(['green', 'amber', 'pink'] as const)[i]} delay={i + 2} />
        ))}
      </div>

      {isClient && data.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.3 }}
          className="glass-card overflow-hidden relative"
        >
          <MapContainer
            center={[6.62, 3.35]}
            zoom={11}
            maxZoom={20}
            style={{ height: '500px', width: '100%' }}
            className="dark-tiles"
          >
            <TileLayer
              url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
              attribution="&copy; CartoDB"
            />
            {data.slice(0, 5000).map((f, i) => {
              const coords = f.geometry?.coordinates;
              if (!coords || coords.length < 2) return null;
              return (
                <CircleMarker
                  key={i}
                  center={[coords[1], coords[0]]}
                  radius={4}
                  fillColor="#06B6D4"
                  fillOpacity={0.7}
                  stroke={false}
                >
                  <Popup>
                    <div className="text-xs space-y-1" style={{ color: '#1e293b' }}>
                      {Object.entries(f.properties || {}).filter(([, v]) => v != null && v !== '').slice(0, 10).map(([k, v]) => (
                        <div key={k}><b>{k}:</b> {String(v)}</div>
                      ))}
                    </div>
                  </Popup>
                </CircleMarker>
              );
            })}
          </MapContainer>

          <div className="absolute top-3 left-3 z-[1000] bg-black/60 backdrop-blur-md rounded-lg px-2.5 py-1.5 text-[10px] text-[#94a3b8]">
            {Math.min(data.length, 5000).toLocaleString()} assets displayed
          </div>
        </motion.div>
      )}

      {data.length === 0 && (
        <div className="glass-card p-12 text-center">
          <p className="text-[#64748b]">No upriser/feeder pillar data available.</p>
          <p className="text-xs text-[#475569] mt-2">Upload data via the admin panel to populate this view.</p>
        </div>
      )}
    </div>
  );
}
