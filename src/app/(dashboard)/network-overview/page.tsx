'use client';

import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import dynamic from 'next/dynamic';
import KPICard from '@/components/ui/KPICard';
import { KPISkeleton, MapSkeleton } from '@/components/ui/LoadingSkeleton';
import { HT_LINE_COLORS } from '@/lib/constants';

const MapContainer = dynamic(() => import('react-leaflet').then((m) => m.MapContainer), { ssr: false });
const TileLayer = dynamic(() => import('react-leaflet').then((m) => m.TileLayer), { ssr: false });
const GeoJSON = dynamic(() => import('react-leaflet').then((m) => m.GeoJSON), { ssr: false });

const GlobeIcon = <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}><path strokeLinecap="round" strokeLinejoin="round" d="M12 21a9 9 0 100-18 9 9 0 000 18zM3.6 9h16.8M3.6 15h16.8" /></svg>;

export default function NetworkOverviewPage() {
  const [geoData, setGeoData] = useState<Record<string, unknown> | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
    import('leaflet/dist/leaflet.css');

    async function load() {
      try {
        const res = await fetch('/api/data?type=network');
        const json = await res.json();
        if (json.data) {
          // Build GeoJSON FeatureCollection if it's an array
          const geojson = Array.isArray(json.data)
            ? { type: 'FeatureCollection', features: json.data }
            : json.data;
          setGeoData(geojson);
        }
      } catch (err) {
        console.error('Failed to load network data:', err);
      } finally {
        setIsLoading(false);
      }
    }
    load();
  }, []);

  const featureCount = geoData && 'features' in geoData ? (geoData.features as unknown[]).length : 0;

  if (isLoading) {
    return <div className="space-y-6"><KPISkeleton /><MapSkeleton /></div>;
  }

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        <KPICard title="Network Features" value={featureCount} icon={GlobeIcon} color="cyan" delay={1} />
        <KPICard title="Data Source" value={geoData ? 1 : 0} icon={GlobeIcon} color="green" delay={2} formatValue={() => geoData ? 'Loaded' : 'N/A'} />
        <KPICard title="Layer Types" value={3} icon={GlobeIcon} color="amber" delay={3} formatValue={() => 'HT / TCN / ISS'} />
      </div>

      {isClient && geoData && (
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
            style={{ height: '600px', width: '100%' }}
            className="dark-tiles"
          >
            <TileLayer
              url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
              attribution="&copy; CartoDB"
            />
            <GeoJSON
              data={geoData as unknown as GeoJSON.FeatureCollection}
              style={(feature) => {
                const layer = feature?.properties?._layer || '';
                const bu = feature?.properties?.bu || feature?.properties?.BU || '';
                if (typeof layer === 'string' && layer.includes('ht_lines')) {
                  return {
                    color: HT_LINE_COLORS[bu as string] || '#06B6D4',
                    weight: 2,
                    opacity: 0.7,
                    dashArray: '8 5',
                    className: 'ht-flow',
                  };
                }
                return {
                  color: '#06B6D4',
                  weight: 2,
                  fillColor: '#06B6D4',
                  fillOpacity: 0.3,
                };
              }}
              pointToLayer={(feature, latlng) => {
                const L = require('leaflet');
                const layer = feature.properties?._layer || '';
                if (layer === 'tcn') {
                  return L.marker(latlng, {
                    icon: L.divIcon({
                      html: '<div style="color:#FBBF24;font-size:22px;text-align:center">★</div>',
                      className: '',
                      iconSize: [22, 22],
                      iconAnchor: [11, 11],
                    }),
                    zIndexOffset: 1000,
                  });
                }
                if (layer === 'iss') {
                  return L.circleMarker(latlng, {
                    radius: 6,
                    fillColor: '#14B8A6',
                    fillOpacity: 0.9,
                    color: '#14B8A6',
                    weight: 1,
                  });
                }
                return L.circleMarker(latlng, {
                  radius: 4,
                  fillColor: '#06B6D4',
                  fillOpacity: 0.7,
                  stroke: false,
                });
              }}
              onEachFeature={(feature, layer) => {
                const props = feature.properties || {};
                const entries = Object.entries(props)
                  .filter(([k, v]) => v != null && v !== '' && !k.startsWith('_'))
                  .slice(0, 8);
                if (entries.length > 0) {
                  const html = entries.map(([k, v]) => `<div><b>${k}:</b> ${v}</div>`).join('');
                  layer.bindPopup(`<div style="font-size:12px">${html}</div>`);
                }
              }}
            />
          </MapContainer>

          {/* Legend */}
          <div className="absolute bottom-3 left-3 z-[1000] bg-black/60 backdrop-blur-md rounded-lg p-3 space-y-1.5">
            <div className="text-[10px] font-semibold text-[#cbd5e1] mb-1">Network Legend</div>
            <div className="flex items-center gap-2 text-[10px] text-[#94a3b8]">
              <div className="w-6 h-0.5 bg-cyan-400" style={{ borderTop: '2px dashed #06B6D4' }} />
              HT Lines
            </div>
            <div className="flex items-center gap-2 text-[10px] text-[#94a3b8]">
              <span style={{ color: '#FBBF24', fontSize: '14px' }}>★</span>
              TCN Stations
            </div>
            <div className="flex items-center gap-2 text-[10px] text-[#94a3b8]">
              <div className="w-3 h-3 rounded-full bg-teal-500" />
              ISS Substations
            </div>
          </div>
        </motion.div>
      )}

      {!geoData && (
        <div className="glass-card p-12 text-center">
          <p className="text-[#64748b]">No network overview data available.</p>
          <p className="text-xs text-[#475569] mt-2">Upload network GeoJSON data via the admin panel.</p>
        </div>
      )}
    </div>
  );
}
