'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import { useDashboard } from '@/lib/store';
import { MAINT_COLORS, BUS, METERING_LABELS, MAINTENANCE_LABELS, HT_LINE_COLORS } from '@/lib/constants';
import type { TransformerRecord } from '@/types/dashboard';

const TILE_CONFIGS = {
  osm: { url: 'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', label: 'Street' },
  google: { url: 'https://mt1.google.com/vt/lyrs=m&x={x}&y={y}&z={z}', label: 'Google' },
  satellite: { url: 'https://mt1.google.com/vt/lyrs=s,h&x={x}&y={y}&z={z}', label: 'Satellite' },
};
const MAX_MARKERS = 6000;

export default function GeospatialDTMapPage() {
  const { filteredData, isLoading } = useDashboard();
  const mapRef = useRef<HTMLDivElement>(null);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const mapInst = useRef<any>(null);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const clusterRef = useRef<any>(null);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const networkLayerRef = useRef<any>(null);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const tileRef = useRef<any>(null);
  const [activeTile, setActiveTile] = useState<'osm' | 'google' | 'satellite'>('osm');
  const [search, setSearch] = useState('');
  const [mapReady, setMapReady] = useState(false);

  // Initialize map
  useEffect(() => {
    if (!mapRef.current || mapInst.current) return;
    const loadMap = async () => {
      const L = (await import('leaflet')).default;
      await import('leaflet/dist/leaflet.css');
      await import('leaflet.markercluster');
      await import('leaflet.markercluster/dist/MarkerCluster.css');
      await import('leaflet.markercluster/dist/MarkerCluster.Default.css');

      const map = L.map(mapRef.current!, { zoomControl: true }).setView([6.62, 3.35], 11);
      const tile = L.tileLayer(TILE_CONFIGS.osm.url, { maxZoom: 20 }).addTo(map);
      tileRef.current = tile;
      mapInst.current = map;

      // Load network overlay data
      try {
        const res = await fetch('/api/data?type=network');
        const json = await res.json();
        const features = json.data?.features || (Array.isArray(json.data) ? json.data : []);
        if (features.length > 0) {
          const networkLayer = L.layerGroup().addTo(map);
          networkLayerRef.current = networkLayer;
          const geojson = { type: 'FeatureCollection' as const, features };

          // HT Lines
          const htFeatures = features.filter((f: any) => String(f.properties?._layer || '').includes('ht_lines'));
          if (htFeatures.length) {
            L.geoJSON({ type: 'FeatureCollection', features: htFeatures } as any, {
              style: (feature: any) => {
                const bu = String(feature?.properties?.BU_NAME || feature?.properties?.bu || '').toUpperCase().replace(/\s+/g, '_');
                const buKey = Object.keys(HT_LINE_COLORS).find(k => bu.includes(k.toUpperCase().replace(/\s+/g, '_')));
                return {
                  color: buKey ? HT_LINE_COLORS[buKey] : '#22d3ee',
                  weight: 3, opacity: 0.9,
                  dashArray: '8 5',
                  className: 'ht-flow',
                };
              },
              onEachFeature: (feature: any, layer: any) => {
                const p = feature.properties || {};
                layer.bindPopup(`<div style="font-family:Inter,sans-serif;font-size:12px;min-width:200px;line-height:1.6"><div style="font-weight:700;color:#22d3ee;border-bottom:1px solid rgba(255,255,255,.1);padding-bottom:4px;margin-bottom:4px">${p.name || p.FEEDER_NAME || 'HT Line'}</div><div><b>BU:</b> ${p.BU_NAME || p.bu || '-'}</div><div><b>Feeder:</b> ${p.FEEDER_NAME || '-'}</div></div>`);
              }
            }).addTo(networkLayer);
          }

          // TCN Stations
          const tcnFeatures = features.filter((f: any) => f.properties?._layer === 'tcn');
          tcnFeatures.forEach((f: any) => {
            const coords = f.geometry?.coordinates;
            if (!coords) return;
            const ll: [number, number] = f.geometry.type === 'Point' ? [coords[1], coords[0]] : [coords[0][1], coords[0][0]];
            const p = f.properties || {};
            L.marker(ll, {
              icon: L.divIcon({
                html: `<svg width="22" height="22" viewBox="0 0 22 22"><polygon points="11,1 13.5,8 21,8 15,12.5 17,20 11,15.5 5,20 7,12.5 1,8 8.5,8" fill="#FACC15" stroke="#0F172A" stroke-width="1.2" style="filter:drop-shadow(0 0 4px #FACC15)"/></svg>`,
                className: '', iconSize: [22, 22], iconAnchor: [11, 11],
              }),
              zIndexOffset: 1000,
            }).bindPopup(`<div style="font-family:Inter,sans-serif;font-size:12px;min-width:200px"><div style="font-weight:700;color:#FACC15;margin-bottom:4px">${p.name || 'TCN Station'}</div><div><b>Capacity:</b> ${p.OP_CAPACITY || '-'}</div><div><b>Feeders:</b> ${p.NUM_FEEDER || '-'}</div><div><b>Address:</b> ${p.ADDRESS || '-'}</div></div>`).addTo(networkLayer);
          });

          // ISS Substations
          const issFeatures = features.filter((f: any) => f.properties?._layer === 'iss');
          issFeatures.forEach((f: any) => {
            const coords = f.geometry?.coordinates;
            if (!coords) return;
            const ll: [number, number] = f.geometry.type === 'Point' ? [coords[1], coords[0]] : [coords[0][1], coords[0][0]];
            const p = f.properties || {};
            L.marker(ll, {
              icon: L.divIcon({
                html: `<svg width="16" height="16" viewBox="0 0 13 13"><polygon points="6.5,1 12,5 10,11.5 3,11.5 1,5" fill="#2DD4BF" stroke="#0F172A" stroke-width="1" style="filter:drop-shadow(0 0 3px #2DD4BF)"/></svg>`,
                className: '', iconSize: [16, 16], iconAnchor: [8, 8],
              }),
              zIndexOffset: 900,
            }).bindPopup(`<div style="font-family:Inter,sans-serif;font-size:12px;min-width:200px"><div style="font-weight:700;color:#2DD4BF;margin-bottom:4px">${p.name || 'ISS Substation'}</div><div><b>Injection:</b> ${p.INJECTION || '-'}</div><div><b>Capacity:</b> ${p.TOTAL_CAP || '-'}</div><div><b>Volt Ratio:</b> ${p.VOLT_RATIO || '-'}</div><div><b>Address:</b> ${p.ADDRESS || '-'}</div></div>`).addTo(networkLayer);
          });
        }
      } catch (e) {
        console.error('Network overlay load failed:', e);
      }

      setMapReady(true);
    };
    loadMap();
    return () => { mapInst.current?.remove(); mapInst.current = null; };
  }, []);

  // Switch tile layer
  useEffect(() => {
    if (!mapInst.current || !tileRef.current) return;
    tileRef.current.setUrl(TILE_CONFIGS[activeTile].url);
  }, [activeTile]);

  // Update DT markers when filtered data changes
  useEffect(() => {
    if (!mapInst.current || !mapReady) return;
    const L = require('leaflet');

    if (clusterRef.current) {
      mapInst.current.removeLayer(clusterRef.current);
    }

    const cluster = L.markerClusterGroup({
      maxClusterRadius: 50,
      disableClusteringAtZoom: 16,
      iconCreateFunction: (c: any) => {
        const n = c.getChildCount();
        const sz = n < 50 ? 32 : n < 200 ? 40 : 48;
        return L.divIcon({
          html: `<div style="width:${sz}px;height:${sz}px;border-radius:50%;display:flex;align-items:center;justify-content:center;background:rgba(6,182,212,.85);font-size:11px;font-weight:700;color:white;border:2px solid #06B6D4;box-shadow:0 0 10px rgba(6,182,212,.5)">${n}</div>`,
          iconSize: [sz, sz], className: '',
        });
      },
    });

    const pts = filteredData.filter(r => r.lat && r.lon && r.lat > 1 && r.lon > 0);
    const step = pts.length > MAX_MARKERS ? Math.ceil(pts.length / MAX_MARKERS) : 1;
    let count = 0;

    for (let i = 0; i < pts.length; i += step) {
      const r = pts[i];
      if (search && !r.name.toLowerCase().includes(search.toLowerCase()) &&
          !r.feeder.toLowerCase().includes(search.toLowerCase()) &&
          !r.customer.toLowerCase().includes(search.toLowerCase())) continue;

      const mc = MAINT_COLORS[r.maintenance] || '#94A3B8';
      const icon = L.divIcon({
        html: `<div style="width:10px;height:10px;border-radius:50%;background:${mc};border:2px solid rgba(255,255,255,.4);box-shadow:0 0 5px ${mc}"></div>`,
        iconSize: [10, 10], iconAnchor: [5, 5], className: '',
      });

      const mk = L.marker([r.lat, r.lon], { icon });
      mk.bindPopup(`<div style="font-family:Inter,sans-serif;font-size:12px;min-width:220px;line-height:1.6">
        <div style="font-weight:700;color:#06B6D4;border-bottom:1px solid rgba(255,255,255,.1);padding-bottom:4px;margin-bottom:4px">${r.name}</div>
        <div><b>DT No:</b> ${r.dtNumber}</div>
        <div><b>BU:</b> <span style="color:${['#06B6D4','#8B5CF6','#10B981','#F59E0B','#EF4444','#EC4899'][r.bu]}">${BUS[r.bu]}</span></div>
        <div><b>UT:</b> ${r.utName}</div>
        <div><b>Feeder:</b> ${r.feeder}</div>
        <div><b>Capacity:</b> ${r.capacity} kVA</div>
        <div><b>Voltage:</b> ${r.voltage === 0 ? '11kV' : '33kV'}</div>
        <div><b>Metering:</b> ${METERING_LABELS[r.metering]}</div>
        <div><b>Status:</b> <span style="color:${mc}">${MAINTENANCE_LABELS[r.maintenance]}</span></div>
        ${r.customer ? `<div><b>Customer:</b> ${r.customer}</div>` : ''}
        ${r.address ? `<div><b>Address:</b> ${r.address}</div>` : ''}
      </div>`);
      cluster.addLayer(mk);
      count++;
    }

    mapInst.current.addLayer(cluster);
    clusterRef.current = cluster;
  }, [filteredData, mapReady, search]);

  if (isLoading) return <div className="skeleton w-full" style={{ height: 'calc(100vh - 160px)' }} />;

  return (
    <div style={{ position: 'relative', marginTop: 16 }}>
      {/* Search bar */}
      <div style={{ position: 'absolute', top: 12, left: '50%', transform: 'translateX(-50%)', zIndex: 1000, display: 'flex', alignItems: 'center', gap: 0 }}>
        <span style={{ position: 'absolute', left: 10, fontSize: 14, color: '#64748b', pointerEvents: 'none' }}>🔍</span>
        <input
          type="text"
          placeholder="Search DT by name, feeder, customer..."
          value={search}
          onChange={e => setSearch(e.target.value)}
          style={{
            width: 380, padding: '8px 14px 8px 32px',
            background: 'rgba(15,23,42,.95)', border: '1px solid rgba(255,255,255,.12)',
            borderRadius: 10, color: 'white', fontSize: 12, outline: 'none',
            backdropFilter: 'blur(12px)',
          }}
        />
      </div>

      {/* Tile switcher */}
      <div style={{ position: 'absolute', top: 12, right: 12, zIndex: 1000, display: 'flex', gap: 4 }}>
        {(Object.keys(TILE_CONFIGS) as Array<keyof typeof TILE_CONFIGS>).map(k => (
          <button key={k} onClick={() => setActiveTile(k)} style={{
            padding: '5px 10px', borderRadius: 6, fontSize: 10, fontWeight: 600, cursor: 'pointer', border: 'none',
            background: activeTile === k ? 'rgba(6,182,212,.3)' : 'rgba(0,0,0,.5)',
            color: activeTile === k ? '#06B6D4' : '#94a3b8',
            backdropFilter: 'blur(8px)',
          }}>
            {TILE_CONFIGS[k].label}
          </button>
        ))}
      </div>

      {/* Map container */}
      <div ref={mapRef} style={{
        height: 'calc(100vh - 180px)', minHeight: 500, borderRadius: 12,
        overflow: 'hidden', border: '1px solid rgba(255,255,255,.07)',
      }} />

      {/* Legend */}
      <div style={{
        position: 'absolute', bottom: 16, left: 16, zIndex: 1000,
        background: 'rgba(15,23,42,.9)', backdropFilter: 'blur(12px)',
        borderRadius: 10, padding: '10px 14px', border: '1px solid rgba(255,255,255,.1)',
      }}>
        {[
          { label: 'Healthy', color: '#10B981' },
          { label: 'Faulty', color: '#EF4444' },
          { label: 'Out/Inactive', color: '#F59E0B' },
          { label: 'Unknown', color: '#94A3B8' },
        ].map(item => (
          <div key={item.label} style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 12, color: '#94A3B8', marginBottom: 3 }}>
            <div style={{ width: 10, height: 10, borderRadius: '50%', background: item.color, boxShadow: `0 0 6px ${item.color}` }} />
            {item.label}
          </div>
        ))}
        <div style={{ borderTop: '1px solid rgba(255,255,255,.06)', marginTop: 4, paddingTop: 4 }}>
          {[
            { label: 'HT Line', html: <div style={{ width: 20, height: 0, borderTop: '2px dashed #22d3ee' }} /> },
            { label: 'TCN', html: <span style={{ color: '#FACC15', fontSize: 14 }}>★</span> },
            { label: 'ISS', html: <div style={{ width: 10, height: 10, background: '#2DD4BF', clipPath: 'polygon(50% 0%,100% 38%,82% 100%,18% 100%,0% 38%)' }} /> },
          ].map(item => (
            <div key={item.label} style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 12, color: '#94A3B8', marginBottom: 2 }}>
              {item.html}
              {item.label}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
