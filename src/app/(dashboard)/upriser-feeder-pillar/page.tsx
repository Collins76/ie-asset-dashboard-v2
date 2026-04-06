'use client';

import { useEffect, useRef, useState, useMemo } from 'react';

const UF_COND_CLR: Record<string, string> = {
  Good: '#10b981', Fair: '#f59e0b', Poor: '#f97316', Critical: '#ef4444', Unknown: '#64748b',
};

function fmt(n: number): string {
  if (n >= 1e6) return (n / 1e6).toFixed(2) + 'M';
  if (n >= 1e3) return (n / 1e3).toFixed(1) + 'K';
  return (n || 0).toLocaleString();
}

interface UfRecord {
  dt: string; bu: string; ut: string; addr: string;
  gd: number; bd: number; tt: number; fp: boolean;
  ft: string; fc: string; vl: string; ph: string[];
  la: number; ln: number; fo: string; rp: string; ts: string;
}

export default function UpriserFeederPillarPage() {
  const [data, setData] = useState<UfRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(0);
  const mapRef = useRef<HTMLDivElement>(null);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const mapInst = useRef<any>(null);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const layerRef = useRef<any>(null);
  const PAGE_SIZE = 25;

  // Load upriser data
  useEffect(() => {
    async function load() {
      try {
        const res = await fetch('/api/data?type=upriser');
        const json = await res.json();
        const raw = json.data || [];
        setData(raw);
      } catch (e) { console.error('Upriser data load failed:', e); }
      setLoading(false);
    }
    load();
  }, []);

  // Init map
  useEffect(() => {
    if (!mapRef.current || mapInst.current || data.length === 0) return;
    const initMap = async () => {
      const L = (await import('leaflet')).default;
      await import('leaflet/dist/leaflet.css');
      const map = L.map(mapRef.current!, { zoomControl: true }).setView([6.55, 3.38], 11);
      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', { maxZoom: 19 }).addTo(map);
      mapInst.current = map;
      const lg = L.layerGroup().addTo(map);
      layerRef.current = lg;
      renderMarkers(L, lg, data);
    };
    initMap();
    return () => { mapInst.current?.remove(); mapInst.current = null; };
  }, [data]);

  function renderMarkers(L: any, lg: any, records: UfRecord[]) {
    lg.clearLayers();
    let count = 0;
    records.forEach(r => {
      if (!r.la || !r.ln || r.la < 1 || r.ln < 0) return;
      const c = UF_COND_CLR[r.fc] || '#64748b';
      const mk = L.circleMarker([r.la, r.ln], { radius: 4, fillColor: c, fillOpacity: 1, color: c, weight: 1 });
      mk.on('mouseover', function(this: any) { this.setStyle({ radius: 7, weight: 2 }); });
      mk.on('mouseout', function(this: any) { this.setStyle({ radius: 4, weight: 1 }); });
      const photos = Array.isArray(r.ph) ? r.ph : (r.ph ? [r.ph] : []);
      const photoHTML = photos.length
        ? `<div style="margin-top:6px;display:flex;gap:4px;flex-wrap:wrap">${photos.map((id: string, pi: number) =>
            `<a href="https://drive.google.com/file/d/${id}/view" target="_blank" title="Photo ${pi + 1}"><img src="https://lh3.googleusercontent.com/d/${id}=w150" style="width:${photos.length === 1 ? '200' : '90'}px;height:${photos.length === 1 ? 'auto' : '70'}px;object-fit:cover;border-radius:6px;border:1px solid #1a2535" onerror="this.style.display='none'"></a>`
          ).join('')}</div>`
        : '';
      mk.bindPopup(`<div style="font-family:Inter,sans-serif;font-size:12px;min-width:250px">
        <div style="font-weight:700;color:${c};border-bottom:1px solid #1a2535;padding-bottom:4px;margin-bottom:4px">${r.dt || 'Unknown DT'}</div>
        <table style="width:100%;font-size:11px;line-height:1.7">
          <tr><td style="color:#7a8a9e;width:110px"><b>BU</b></td><td style="color:${c};font-weight:600">${r.bu}</td></tr>
          <tr><td style="color:#7a8a9e"><b>Undertaking</b></td><td>${r.ut}</td></tr>
          <tr><td style="color:#7a8a9e"><b>Good Uprisers</b></td><td style="color:#10b981;font-weight:600">${r.gd}</td></tr>
          <tr><td style="color:#7a8a9e"><b>Bad Uprisers</b></td><td style="color:#ef4444;font-weight:600">${r.bd}</td></tr>
          <tr><td style="color:#7a8a9e"><b>Total</b></td><td>${r.tt}</td></tr>
          <tr><td style="color:#7a8a9e"><b>FP Condition</b></td><td style="color:${c};font-weight:600">${r.fc}</td></tr>
          <tr><td style="color:#7a8a9e"><b>FP Type</b></td><td>${r.ft || '-'}</td></tr>
          <tr><td style="color:#7a8a9e"><b>Validation</b></td><td>${r.vl === 'Valid' ? '<span style="color:#10b981">Valid</span>' : '<span style="color:#ef4444">Invalid</span>'}</td></tr>
          <tr><td style="color:#7a8a9e"><b>Address</b></td><td style="word-break:break-word">${r.addr || '-'}</td></tr>
          <tr><td style="color:#7a8a9e"><b>Field Officer</b></td><td>${r.fo || '-'}</td></tr>
          <tr><td style="color:#7a8a9e"><b>Timestamp</b></td><td>${r.ts || '-'}</td></tr>
        </table>
        ${photoHTML}
      </div>`, { maxWidth: 600 });
      mk.addTo(lg);
      count++;
    });

    if (count > 0 && mapInst.current) {
      try { mapInst.current.fitBounds(lg.getBounds(), { padding: [30, 30], maxZoom: 14 }); } catch {}
    }
  }

  // KPI stats
  const stats = useMemo(() => {
    const total = data.length;
    const goodU = data.reduce((s, r) => s + (r.gd || 0), 0);
    const badU = data.reduce((s, r) => s + (r.bd || 0), 0);
    const totalU = goodU + badU;
    const healthPct = totalU ? ((goodU / totalU) * 100).toFixed(1) : '0';
    const fpYes = data.filter(r => r.fp).length;
    const fpPct = total ? ((fpYes / total) * 100).toFixed(1) : '0';
    const critical = data.filter(r => r.fc === 'Critical').length;
    const valid = data.filter(r => r.vl === 'Valid').length;
    const validPct = total ? ((valid / total) * 100).toFixed(1) : '0';
    return { total, goodU, badU, healthPct, fpYes, fpPct, critical, valid, validPct };
  }, [data]);

  // Filtered table data
  const filtered = useMemo(() => {
    if (!search) return data;
    const q = search.toLowerCase();
    return data.filter(r =>
      (r.dt || '').toLowerCase().includes(q) ||
      (r.bu || '').toLowerCase().includes(q) ||
      (r.addr || '').toLowerCase().includes(q) ||
      (r.fo || '').toLowerCase().includes(q)
    );
  }, [data, search]);

  const totalPages = Math.ceil(filtered.length / PAGE_SIZE);
  const pageData = filtered.slice(page * PAGE_SIZE, (page + 1) * PAGE_SIZE);

  if (loading) return <div className="skeleton w-full" style={{ height: 'calc(100vh - 160px)' }} />;

  const kpis = [
    { v: fmt(stats.total), l: 'DTs Surveyed', s: 'From field survey data', c: '#06B6D4', anim: 'uf-pulse 2s ease-in-out infinite' },
    { v: `${fmt(stats.goodU)} / ${fmt(stats.badU)}`, l: 'Uprisers Good / Bad', s: `${stats.healthPct}% health rate`, c: parseFloat(stats.healthPct) > 80 ? '#10b981' : '#f59e0b', anim: 'uf-bounce 1.5s ease infinite' },
    { v: `${stats.fpPct}%`, l: 'Feeder Pillar Coverage', s: `${fmt(stats.fpYes)} of ${fmt(stats.total)} have FP`, c: parseFloat(stats.fpPct) > 90 ? '#10b981' : '#f59e0b', anim: 'uf-glow 2s ease-in-out infinite' },
    { v: fmt(stats.critical), l: 'Critical Condition', s: 'Urgent attention needed', c: '#ef4444', anim: 'uf-shake 2s ease-in-out infinite' },
    { v: `${stats.validPct}%`, l: 'Validation Rate', s: `${fmt(stats.valid)} valid of ${fmt(stats.total)}`, c: parseFloat(stats.validPct) > 95 ? '#10b981' : '#f59e0b', anim: 'uf-spin-slow 3s linear infinite' },
  ];

  return (
    <div style={{ marginTop: 16 }}>
      <style>{`
        @keyframes uf-pulse{0%,100%{transform:scale(1)}50%{transform:scale(1.2)}}
        @keyframes uf-bounce{0%,100%{transform:translateY(0)}50%{transform:translateY(-4px)}}
        @keyframes uf-glow{0%,100%{filter:drop-shadow(0 0 2px currentColor)}50%{filter:drop-shadow(0 0 8px currentColor)}}
        @keyframes uf-shake{0%,100%{transform:rotate(0)}25%{transform:rotate(-8deg)}75%{transform:rotate(8deg)}}
        @keyframes uf-spin-slow{0%{transform:rotate(0)}100%{transform:rotate(360deg)}}
        @keyframes spin{to{transform:rotate(360deg)}}
      `}</style>

      {/* KPI Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(190px, 1fr))', gap: 14, marginBottom: 16 }}>
        {kpis.map((k, i) => (
          <div key={i} className={`kpi-card fade-up-${i + 1}`} style={{ borderLeft: `3px solid ${k.c}` }}>
            <div style={{ fontSize: 20, marginBottom: 4, display: 'inline-block', animation: k.anim, color: k.c }}>
              {['📊', '⚡', '▪', '⚠', '✅'][i]}
            </div>
            <div style={{ fontSize: 24, fontWeight: 800, color: k.c, textShadow: `0 0 16px ${k.c}60` }}>{k.v}</div>
            <div style={{ fontSize: 13, color: '#CBD5E1', marginTop: 2 }}>{k.l}</div>
            <div style={{ fontSize: 11, color: '#475569' }}>{k.s}</div>
          </div>
        ))}
      </div>

      {/* Map + Charts grid */}
      <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: 12, marginBottom: 12 }}>
        <div style={{ position: 'relative', borderRadius: 12, overflow: 'hidden', border: '1px solid rgba(255,255,255,.07)', height: 'calc(100vh - 420px)', minHeight: 400 }}>
          <div ref={mapRef} style={{ width: '100%', height: '100%' }} />
          {/* Legend */}
          <div style={{ position: 'absolute', bottom: 12, left: 12, zIndex: 1000, background: 'rgba(15,23,42,.9)', backdropFilter: 'blur(12px)', borderRadius: 10, padding: '8px 12px', border: '1px solid rgba(255,255,255,.1)' }}>
            <div style={{ fontSize: 10, fontWeight: 600, color: '#CBD5E1', marginBottom: 4 }}>FP Condition</div>
            {Object.entries(UF_COND_CLR).map(([k, c]) => (
              <div key={k} style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 11, color: '#94A3B8', marginBottom: 2 }}>
                <div style={{ width: 8, height: 8, borderRadius: '50%', background: c, boxShadow: `0 0 4px ${c}` }} />
                {k} ({fmt(data.filter(r => r.fc === k).length)})
              </div>
            ))}
          </div>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          {/* Condition by BU chart placeholder */}
          <div className="glass-card" style={{ flex: 1 }}>
            <div className="chart-title">Feeder Pillar Condition by BU</div>
            <div style={{ fontSize: 12 }}>
              {Object.entries(data.reduce((acc: Record<string, Record<string, number>>, r) => {
                const bu = r.bu || 'Unknown';
                if (!acc[bu]) acc[bu] = {};
                acc[bu][r.fc || 'Unknown'] = (acc[bu][r.fc || 'Unknown'] || 0) + 1;
                return acc;
              }, {})).slice(0, 6).map(([bu, conds]) => (
                <div key={bu} style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 6 }}>
                  <span style={{ width: 80, fontSize: 11, color: '#94a3b8', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{bu}</span>
                  <div style={{ flex: 1, display: 'flex', height: 16, borderRadius: 4, overflow: 'hidden' }}>
                    {Object.entries(conds).map(([cond, count]) => (
                      <div key={cond} style={{ width: `${(count / data.filter(r => r.bu === bu).length) * 100}%`, background: UF_COND_CLR[cond] || '#64748b', minWidth: 2 }} title={`${cond}: ${count}`} />
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Type distribution */}
          <div className="glass-card" style={{ flex: 1 }}>
            <div className="chart-title">Feeder Pillar Type</div>
            {Object.entries(data.reduce((acc: Record<string, number>, r) => { const t = r.ft || 'Unknown'; acc[t] = (acc[t] || 0) + 1; return acc; }, {})).map(([type, count]) => (
              <div key={type} style={{ display: 'flex', justifyContent: 'space-between', padding: '4px 0', fontSize: 12, borderBottom: '1px solid rgba(255,255,255,.04)' }}>
                <span style={{ color: '#94a3b8' }}>{type}</span>
                <span style={{ color: '#CBD5E1', fontWeight: 600 }}>{(count as number).toLocaleString()}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Survey Records Table */}
      <div className="glass-card">
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 8 }}>
          <div style={{ flex: 1, fontSize: 14, fontWeight: 600, color: '#E2E8F0' }}>Survey Records</div>
          <input type="text" placeholder="Search DT, address, BU, officer..." value={search} onChange={e => { setSearch(e.target.value); setPage(0); }}
            style={{ width: 280, padding: '6px 10px', background: 'rgba(15,23,42,.8)', border: '1px solid rgba(255,255,255,.1)', borderRadius: 6, fontSize: 11, color: 'white', outline: 'none' }}
          />
        </div>
        <div style={{ overflowX: 'auto' }}>
          <table className="dt-table" style={{ minWidth: 1200 }}>
            <thead>
              <tr>
                {['DT Name', 'BU', 'UT', 'Good', 'Bad', 'Total', 'FP Condition', 'FP Type', 'Validation', 'Address', 'Officer', 'Timestamp'].map(h => (
                  <th key={h}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {pageData.map((r, i) => (
                <tr key={i}>
                  <td style={{ maxWidth: 200, overflow: 'hidden', textOverflow: 'ellipsis' }}>{r.dt}</td>
                  <td>{r.bu}</td>
                  <td>{r.ut}</td>
                  <td style={{ color: '#10b981', fontWeight: 600 }}>{r.gd}</td>
                  <td style={{ color: '#ef4444', fontWeight: 600 }}>{r.bd}</td>
                  <td>{r.tt}</td>
                  <td style={{ color: UF_COND_CLR[r.fc] || '#64748b', fontWeight: 600 }}>{r.fc}</td>
                  <td>{r.ft || '-'}</td>
                  <td style={{ color: r.vl === 'Valid' ? '#10b981' : '#ef4444' }}>{r.vl}</td>
                  <td style={{ maxWidth: 180, overflow: 'hidden', textOverflow: 'ellipsis' }}>{r.addr || '-'}</td>
                  <td>{r.fo || '-'}</td>
                  <td>{r.ts || '-'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {totalPages > 1 && (
          <div style={{ display: 'flex', gap: 4, marginTop: 8, justifyContent: 'center' }}>
            <button onClick={() => setPage(0)} disabled={page === 0} className="btn btn-secondary" style={{ fontSize: 11, padding: '4px 8px' }}>First</button>
            <button onClick={() => setPage(p => Math.max(0, p - 1))} disabled={page === 0} className="btn btn-secondary" style={{ fontSize: 11, padding: '4px 8px' }}>Prev</button>
            <span style={{ padding: '4px 12px', fontSize: 11, color: '#94a3b8' }}>{page + 1} / {totalPages}</span>
            <button onClick={() => setPage(p => Math.min(totalPages - 1, p + 1))} disabled={page >= totalPages - 1} className="btn btn-secondary" style={{ fontSize: 11, padding: '4px 8px' }}>Next</button>
            <button onClick={() => setPage(totalPages - 1)} disabled={page >= totalPages - 1} className="btn btn-secondary" style={{ fontSize: 11, padding: '4px 8px' }}>Last</button>
          </div>
        )}
      </div>
    </div>
  );
}
