'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import { motion } from 'framer-motion';
import dynamic from 'next/dynamic';
import { useDashboard } from '@/lib/store';
import { MAINT_COLORS, BUS } from '@/lib/constants';
import type { TransformerRecord } from '@/types/dashboard';

// Dynamically import react-leaflet to avoid SSR issues
const MapContainer = dynamic(
  () => import('react-leaflet').then((m) => m.MapContainer),
  { ssr: false }
);
const TileLayer = dynamic(
  () => import('react-leaflet').then((m) => m.TileLayer),
  { ssr: false }
);
const CircleMarker = dynamic(
  () => import('react-leaflet').then((m) => m.CircleMarker),
  { ssr: false }
);
const Popup = dynamic(
  () => import('react-leaflet').then((m) => m.Popup),
  { ssr: false }
);

const TILE_LAYERS = {
  dark: {
    url: 'https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png',
    attribution: '&copy; CartoDB',
  },
  osm: {
    url: 'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png',
    attribution: '&copy; OpenStreetMap',
  },
  satellite: {
    url: 'https://mt1.google.com/vt/lyrs=s,h&x={x}&y={y}&z={z}',
    attribution: '&copy; Google',
  },
};

const MAX_MARKERS = 6000;

function sampleData(data: TransformerRecord[], max: number): TransformerRecord[] {
  if (data.length <= max) return data;
  const step = data.length / max;
  const sampled: TransformerRecord[] = [];
  for (let i = 0; i < data.length && sampled.length < max; i += step) {
    sampled.push(data[Math.floor(i)]);
  }
  return sampled;
}

export default function TransformerMap() {
  const { filteredData } = useDashboard();
  const [tileLayer, setTileLayer] = useState<'dark' | 'osm' | 'satellite'>('dark');
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
    // Import leaflet CSS
    import('leaflet/dist/leaflet.css');
  }, []);

  const markers = useMemo(() => {
    const withCoords = filteredData.filter((r) => r.lat && r.lon && r.lat !== 0 && r.lon !== 0);
    return sampleData(withCoords, MAX_MARKERS);
  }, [filteredData]);

  if (!isClient) {
    return <div className="skeleton w-full h-[460px] rounded-xl" />;
  }

  const tile = TILE_LAYERS[tileLayer];

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.3 }}
      className="glass-card overflow-hidden relative"
    >
      {/* Tile switcher */}
      <div className="absolute top-3 right-3 z-[1000] flex gap-1">
        {(['dark', 'osm', 'satellite'] as const).map((layer) => (
          <button
            key={layer}
            onClick={() => setTileLayer(layer)}
            className={`px-2.5 py-1 rounded-md text-[10px] font-medium transition-colors ${
              tileLayer === layer
                ? 'bg-cyan-500/30 text-cyan-300 border border-cyan-500/40'
                : 'bg-black/40 text-[#94a3b8] border border-white/10 hover:bg-white/10'
            }`}
          >
            {layer === 'dark' ? 'Dark' : layer === 'osm' ? 'Street' : 'Satellite'}
          </button>
        ))}
      </div>

      <MapContainer
        center={[6.62, 3.35]}
        zoom={11}
        maxZoom={20}
        style={{ height: '460px', width: '100%' }}
        className={tileLayer === 'dark' ? 'dark-tiles' : ''}
      >
        <TileLayer url={tile.url} attribution={tile.attribution} />
        {markers.map((r, i) => (
          <CircleMarker
            key={`${r.dtNumber}-${i}`}
            center={[r.lat, r.lon]}
            radius={4}
            fillColor={MAINT_COLORS[r.maintenance] || '#94a3b8'}
            fillOpacity={0.8}
            stroke={false}
          >
            <Popup>
              <div className="text-xs space-y-1 min-w-[200px]" style={{ color: '#1e293b' }}>
                <div className="font-bold text-sm">{r.name}</div>
                <div><b>DT No:</b> {r.dtNumber}</div>
                <div><b>BU:</b> {BUS[r.bu]}</div>
                <div><b>UT:</b> {r.utName}</div>
                <div><b>Feeder:</b> {r.feeder}</div>
                <div><b>Capacity:</b> {r.capacity} kVA</div>
                <div><b>Voltage:</b> {r.voltage === 0 ? '11kV' : '33kV'}</div>
                <div><b>Status:</b> {['HEALTHY', 'FAULTY', 'OUT OF CIRCUIT', 'INACTIVE', 'Unknown'][r.maintenance]}</div>
                <div><b>Metering:</b> {['METERED', 'METERED EST.', 'UNMETERED'][r.metering]}</div>
                {r.address && <div><b>Address:</b> {r.address}</div>}
              </div>
            </Popup>
          </CircleMarker>
        ))}
      </MapContainer>

      {/* Legend */}
      <div className="absolute bottom-3 left-3 z-[1000] bg-black/60 backdrop-blur-md rounded-lg p-2.5 flex gap-3">
        {[
          { label: 'Healthy', color: '#10B981' },
          { label: 'Faulty', color: '#EF4444' },
          { label: 'Out/Inactive', color: '#F59E0B' },
          { label: 'Unknown', color: '#94A3B8' },
        ].map((item) => (
          <div key={item.label} className="flex items-center gap-1.5 text-[10px] text-[#cbd5e1]">
            <div className="w-2.5 h-2.5 rounded-full" style={{ background: item.color, boxShadow: `0 0 6px ${item.color}` }} />
            {item.label}
          </div>
        ))}
      </div>

      {/* Count badge */}
      <div className="absolute top-3 left-3 z-[1000] bg-black/60 backdrop-blur-md rounded-lg px-2.5 py-1.5 text-[10px] text-[#94a3b8]">
        Showing {markers.length.toLocaleString()} of {filteredData.filter(r => r.lat && r.lon).length.toLocaleString()} markers
      </div>
    </motion.div>
  );
}
