'use client';

import { useEffect, useRef, useState } from 'react';
import { HT_LINE_COLORS } from '@/lib/constants';

const TILE_CONFIGS = {
  osm: { url: 'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', label: 'Street' },
  google: { url: 'https://mt1.google.com/vt/lyrs=m&x={x}&y={y}&z={z}', label: 'Google' },
  satellite: { url: 'https://mt1.google.com/vt/lyrs=s,h&x={x}&y={y}&z={z}', label: 'Satellite' },
};

export default function NetworkOverviewPage() {
  const mapRef = useRef<HTMLDivElement>(null);
  const mapInst = useRef<L.Map | null>(null);
  const tileRef = useRef<L.TileLayer | null>(null);
  const [activeTile, setActiveTile] = useState<'osm' | 'google' | 'satellite'>('osm');
  const [search, setSearch] = useState('');
  const [featureCount, setFeatureCount] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!mapRef.current || mapInst.current) return;
    const loadMap = async () => {
      const L = (await import('leaflet')).default;
      await import('leaflet/dist/leaflet.css');

      const map = L.map(mapRef.current!, { zoomControl: true }).setView([6.62, 3.35], 11);
      const tile = L.tileLayer(TILE_CONFIGS.osm.url, { maxZoom: 20 }).addTo(map);
      tileRef.current = tile;
      mapInst.current = map;

      try {
        const res = await fetch('/api/data?type=network');
        const json = await res.json();
        const features = json.data?.features || (Array.isArray(json.data) ? json.data : []);
        setFeatureCount(features.length);

        if (features.length > 0) {
          // HT Lines
          const htFeatures = features.filter((f: any) => String(f.properties?._layer || '').includes('ht_lines'));
          if (htFeatures.length) {
            L.geoJSON({ type: 'FeatureCollection', features: htFeatures } as any, {
              style: (feature: any) => {
                const bu = String(feature?.properties?.BU_NAME || feature?.properties?.bu || '').toUpperCase().replace(/\s+/g, '_');
                const buKey = Object.keys(HT_LINE_COLORS).find(k => bu.includes(k.toUpperCase().replace(/\s+/g, '_')));
                return { color: buKey ? HT_LINE_COLORS[buKey] : '#22d3ee', weight: 3, opacity: 0.9, dashArray: '8 5', className: 'ht-flow' };
              },
              onEachFeature: (feature: any, layer: any) => {
                const p = feature.properties || {};
                layer.bindPopup(`<div style="font-family:Inter,sans-serif;font-size:12px;min-width:200px;line-height:1.6"><div style="font-weight:700;color:#22d3ee;border-bottom:1px solid rgba(255,255,255,.1);padding-bottom:4px;margin-bottom:4px">${p.name || p.FEEDER_NAME || 'HT Line'}</div><b>BU:</b> ${p.BU_NAME || '-'}<br><b>Feeder:</b> ${p.FEEDER_NAME || '-'}</div>`);
              }
            }).addTo(map);
          }

          // TCN Stations
          const tcnFeatures = features.filter((f: any) => f.properties?._layer === 'tcn');
          tcnFeatures.forEach((f: any) => {
            const coords = f.geometry?.coordinates;
            if (!coords) return;
            const ll: [number, number] = f.geometry.type === 'Point' ? [coords[1], coords[0]] : [coords[0][1] || coords[1], coords[0][0] || coords[0]];
            const p = f.properties || {};
            L.marker(ll, {
              icon: L.divIcon({
                html: `<svg width="22" height="22" viewBox="0 0 22 22"><polygon points="11,1 13.5,8 21,8 15,12.5 17,20 11,15.5 5,20 7,12.5 1,8 8.5,8" fill="#FACC15" stroke="#0F172A" stroke-width="1.2" style="filter:drop-shadow(0 0 4px #FACC15)"/></svg>`,
                className: '', iconSize: [22, 22], iconAnchor: [11, 11],
              }),
              zIndexOffset: 1000,
            }).bindPopup(`<div style="font-family:Inter,sans-serif;font-size:12px;min-width:220px"><div style="font-weight:700;color:#FACC15;margin-bottom:4px">${p.name || 'TCN Station'}</div><b>Capacity:</b> ${p.OP_CAPACITY || '-'}<br><b>Feeders:</b> ${p.NUM_FEEDER || '-'}<br><b>Address:</b> ${p.ADDRESS || '-'}</div>`).addTo(map);
          });

          // ISS Substations
          const issFeatures = features.filter((f: any) => f.properties?._layer === 'iss');
          issFeatures.forEach((f: any) => {
            const coords = f.geometry?.coordinates;
            if (!coords) return;
            const ll: [number, number] = f.geometry.type === 'Point' ? [coords[1], coords[0]] : [coords[0][1] || coords[1], coords[0][0] || coords[0]];
            const p = f.properties || {};
            L.marker(ll, {
              icon: L.divIcon({
                html: `<svg width="16" height="16" viewBox="0 0 13 13"><polygon points="6.5,1 12,5 10,11.5 3,11.5 1,5" fill="#2DD4BF" stroke="#0F172A" stroke-width="1" style="filter:drop-shadow(0 0 3px #2DD4BF)"/></svg>`,
                className: '', iconSize: [16, 16], iconAnchor: [8, 8],
              }),
              zIndexOffset: 900,
            }).bindPopup(`<div style="font-family:Inter,sans-serif;font-size:12px;min-width:220px"><div style="font-weight:700;color:#2DD4BF;margin-bottom:4px">${p.name || 'ISS'}</div><b>Injection:</b> ${p.INJECTION || '-'}<br><b>Capacity:</b> ${p.TOTAL_CAP || '-'}<br><b>Volt Ratio:</b> ${p.VOLT_RATIO || '-'}<br><b>Address:</b> ${p.ADDRESS || '-'}</div>`).addTo(map);
          });

          // UT Boundaries
          const utFeatures = features.filter((f: any) => f.properties?._layer === 'ut_boundary');
          if (utFeatures.length) {
            L.geoJSON({ type: 'FeatureCollection', features: utFeatures } as any, {
              style: () => ({ color: '#64748b', weight: 2, fillColor: '#64748b', fillOpacity: 0.08, dashArray: '' }),
              onEachFeature: (feature: any, layer: any) => {
                const name = feature.properties?.name || '';
                if (name) {
                  layer.bindTooltip(name, { permanent: true, direction: 'center', className: 'ut-label', opacity: 0.85 });
                  layer.bindPopup(`<b style="color:#64748b">${name}</b><br>UT Boundary`);
                }
                layer.on('mouseover', function(this: any) { this.setStyle({ weight: 4, fillOpacity: 0.2 }); });
                layer.on('mouseout', function(this: any) { this.setStyle({ weight: 2, fillOpacity: 0.08 }); });
              }
            }).addTo(map);
          }

          // Lagos boundary
          const lagosFeatures = features.filter((f: any) => f.properties?._layer === 'lagos');
          if (lagosFeatures.length) {
            L.geoJSON({ type: 'FeatureCollection', features: lagosFeatures } as any, {
              style: () => ({ color: '#f43f5e', weight: 4, fillColor: '#f43f5e', fillOpacity: 0.05 }),
              onEachFeature: (_: any, layer: any) => { layer.bindPopup('<b style="color:#f43f5e">Lagos State Boundary</b>'); }
            }).addTo(map);
          }

          // Other point features
          const otherPoints = features.filter((f: any) => {
            const l = f.properties?._layer || '';
            return f.geometry?.type === 'Point' && l !== 'tcn' && l !== 'iss';
          });
          otherPoints.forEach((f: any) => {
            const coords = f.geometry?.coordinates;
            if (!coords || coords.length < 2) return;
            const p = f.properties || {};
            L.circleMarker([coords[1], coords[0]], {
              radius: 4, fillColor: '#06B6D4', fillOpacity: 0.7, color: '#06B6D4', weight: 1,
            }).bindPopup(`<div style="font-size:12px">${Object.entries(p).filter(([k, v]) => v && !k.startsWith('_')).slice(0, 8).map(([k, v]) => `<div><b>${k}:</b> ${v}</div>`).join('')}</div>`).addTo(map);
          });
        }
      } catch (e) {
        console.error('Failed to load network data:', e);
      }

      setLoading(false);
    };
    loadMap();
    return () => { mapInst.current?.remove(); mapInst.current = null; };
  }, []);

  useEffect(() => {
    if (!mapInst.current || !tileRef.current) return;
    tileRef.current.setUrl(TILE_CONFIGS[activeTile].url);
  }, [activeTile]);

  return (
    <div style={{ position: 'relative', marginTop: 16 }}>
      {/* Search */}
      <div style={{ position: 'absolute', top: 12, left: '50%', transform: 'translateX(-50%)', zIndex: 1000 }}>
        <span style={{ position: 'absolute', left: 10, top: '50%', transform: 'translateY(-50%)', fontSize: 14, color: '#64748b' }}>🔍</span>
        <input type="text" placeholder="Search network features..." value={search} onChange={e => setSearch(e.target.value)}
          style={{ width: 340, padding: '8px 14px 8px 32px', background: 'rgba(15,23,42,.95)', border: '1px solid rgba(255,255,255,.12)', borderRadius: 10, color: 'white', fontSize: 12, outline: 'none', backdropFilter: 'blur(12px)' }}
        />
      </div>

      {/* Tile switcher */}
      <div style={{ position: 'absolute', top: 12, right: 12, zIndex: 1000, display: 'flex', gap: 4 }}>
        {(Object.keys(TILE_CONFIGS) as Array<keyof typeof TILE_CONFIGS>).map(k => (
          <button key={k} onClick={() => setActiveTile(k)} style={{
            padding: '5px 10px', borderRadius: 6, fontSize: 10, fontWeight: 600, cursor: 'pointer', border: 'none',
            background: activeTile === k ? 'rgba(6,182,212,.3)' : 'rgba(0,0,0,.5)',
            color: activeTile === k ? '#06B6D4' : '#94a3b8',
          }}>{TILE_CONFIGS[k].label}</button>
        ))}
      </div>

      {/* Map */}
      <div ref={mapRef} style={{ height: 'calc(100vh - 180px)', minHeight: 500, borderRadius: 12, overflow: 'hidden', border: '1px solid rgba(255,255,255,.07)' }} />

      {/* Legend */}
      <div style={{ position: 'absolute', bottom: 16, left: 16, zIndex: 1000, background: 'rgba(15,23,42,.9)', backdropFilter: 'blur(12px)', borderRadius: 10, padding: '10px 14px', border: '1px solid rgba(255,255,255,.1)' }}>
        <div style={{ fontSize: 11, fontWeight: 600, color: '#CBD5E1', marginBottom: 6 }}>Network Legend</div>
        {[
          { label: 'HT Line', html: <div style={{ width: 20, borderTop: '2px dashed #22d3ee', filter: 'drop-shadow(0 0 3px #22d3ee)' }} /> },
          { label: 'TCN Station', html: <span style={{ color: '#FACC15', fontSize: 14, filter: 'drop-shadow(0 0 3px #FACC15)' }}>★</span> },
          { label: 'ISS Substation', html: <div style={{ width: 10, height: 10, background: '#2DD4BF', clipPath: 'polygon(50% 0%,100% 38%,82% 100%,18% 100%,0% 38%)', filter: 'drop-shadow(0 0 3px #2DD4BF)' }} /> },
          { label: 'UT Boundary', html: <div style={{ width: 14, height: 10, border: '1.5px solid #64748b', borderRadius: 2, opacity: 0.6 }} /> },
          { label: 'Lagos Boundary', html: <div style={{ width: 14, height: 0, borderTop: '2.5px solid #f43f5e' }} /> },
        ].map(item => (
          <div key={item.label} style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 11, color: '#94A3B8', marginBottom: 3 }}>
            {item.html} {item.label}
          </div>
        ))}
        <div style={{ fontSize: 10, color: '#475569', borderTop: '1px solid rgba(255,255,255,.06)', paddingTop: 4, marginTop: 4 }}>
          {featureCount.toLocaleString()} features loaded
        </div>
      </div>

      {loading && (
        <div style={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%,-50%)', zIndex: 1000, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8 }}>
          <div style={{ width: 36, height: 36, border: '3px solid rgba(255,255,255,.1)', borderTop: '3px solid #06B6D4', borderRadius: '50%', animation: 'spin 0.7s linear infinite' }} />
          <div style={{ fontSize: 12, color: '#94a3b8' }}>Loading network data...</div>
        </div>
      )}
    </div>
  );
}
