'use client';

import { useState, useMemo, useCallback } from 'react';
import { motion } from 'framer-motion';
import { useDashboard } from '@/lib/store';
import {
  BUS, BANDS, MAINTENANCE_LABELS, METERING_LABELS,
  INSTALLATION_LABELS, COMMISSIONING_LABELS, BU_COLORS, MAINT_COLORS, METER_COLORS,
} from '@/lib/constants';
import { normUT, generateCSV } from '@/lib/data';
import type { TransformerRecord } from '@/types/dashboard';

const PAGE_SIZE = 25;

type SortKey = keyof TransformerRecord;
type SortDir = 'asc' | 'desc';

const columns: { key: SortKey; label: string; width: string }[] = [
  { key: 'name', label: 'DT Name', width: '200px' },
  { key: 'dtNumber', label: 'DT Number', width: '120px' },
  { key: 'bu', label: 'BU', width: '110px' },
  { key: 'utName', label: 'UT', width: '130px' },
  { key: 'band', label: 'Band', width: '75px' },
  { key: 'feeder', label: 'Feeder Name', width: '170px' },
  { key: 'capacity', label: 'kVA', width: '70px' },
  { key: 'voltage', label: 'Volt', width: '65px' },
  { key: 'installation', label: 'Installation', width: '115px' },
  { key: 'metering', label: 'Metering', width: '110px' },
  { key: 'meterNumber', label: 'Meter Number', width: '130px' },
  { key: 'maintenance', label: 'Status', width: '130px' },
  { key: 'commissioning', label: 'Commissioning', width: '130px' },
  { key: 'ownership', label: 'Ownership', width: '90px' },
  { key: 'lat', label: 'Lat', width: '95px' },
  { key: 'lon', label: 'Lon', width: '95px' },
  { key: 'address', label: 'Address', width: '200px' },
  { key: 'state', label: 'State', width: '110px' },
];

function formatCellValue(row: TransformerRecord, key: SortKey) {
  switch (key) {
    case 'bu': return BUS[row.bu] || '';
    case 'band': return BANDS[row.band] || '';
    case 'maintenance': return MAINTENANCE_LABELS[row.maintenance] || '';
    case 'metering': return METERING_LABELS[row.metering] || '';
    case 'voltage': return row.voltage === 0 ? '11kV' : '33kV';
    case 'ownership': return row.ownership === 0 ? 'PUBLIC' : 'PRIVATE';
    case 'installation': return INSTALLATION_LABELS[row.installation] || '';
    case 'commissioning': return COMMISSIONING_LABELS[row.commissioning] || '';
    case 'utName': return normUT(row.utName);
    case 'capacity': return row.capacity.toLocaleString();
    case 'lat': return row.lat ? row.lat.toFixed(4) : '';
    case 'lon': return row.lon ? row.lon.toFixed(4) : '';
    default: return String(row[key] ?? '');
  }
}

function getCellStyle(row: TransformerRecord, key: SortKey): string {
  switch (key) {
    case 'bu': return `color: ${BU_COLORS[BUS[row.bu]] || '#cbd5e1'}`;
    case 'maintenance': {
      const c = MAINT_COLORS[row.maintenance] || '#94a3b8';
      return `color: ${c}`;
    }
    case 'metering': {
      const label = METERING_LABELS[row.metering];
      const c = METER_COLORS[label] || '#94a3b8';
      return `color: ${c}`;
    }
    case 'capacity': return 'font-weight: 700';
    case 'dtNumber':
    case 'meterNumber':
    case 'lat':
    case 'lon':
      return 'font-family: monospace; font-size: 11px';
    default: return '';
  }
}

export default function DataTable() {
  const { filteredData } = useDashboard();
  const [page, setPage] = useState(0);
  const [sortKey, setSortKey] = useState<SortKey>('name');
  const [sortDir, setSortDir] = useState<SortDir>('asc');
  const [search, setSearch] = useState('');

  const searched = useMemo(() => {
    if (!search.trim()) return filteredData;
    const q = search.toLowerCase();
    return filteredData.filter((r) =>
      r.name?.toLowerCase().includes(q) ||
      r.dtNumber?.toLowerCase().includes(q) ||
      r.feeder?.toLowerCase().includes(q) ||
      r.utName?.toLowerCase().includes(q) ||
      r.customer?.toLowerCase().includes(q) ||
      BUS[r.bu]?.toLowerCase().includes(q)
    );
  }, [filteredData, search]);

  const sorted = useMemo(() => {
    return [...searched].sort((a, b) => {
      const av = a[sortKey];
      const bv = b[sortKey];
      if (av == null && bv == null) return 0;
      if (av == null) return 1;
      if (bv == null) return -1;
      const cmp = typeof av === 'string'
        ? av.localeCompare(bv as string)
        : (av as number) - (bv as number);
      return sortDir === 'asc' ? cmp : -cmp;
    });
  }, [searched, sortKey, sortDir]);

  const totalPages = Math.ceil(sorted.length / PAGE_SIZE);
  const pageData = sorted.slice(page * PAGE_SIZE, (page + 1) * PAGE_SIZE);

  const handleSort = (key: SortKey) => {
    if (sortKey === key) setSortDir((d) => (d === 'asc' ? 'desc' : 'asc'));
    else { setSortKey(key); setSortDir('asc'); }
  };

  const handleExportCSV = useCallback(() => {
    const csv = generateCSV(sorted);
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `ie_transformers_${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  }, [sorted]);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.5 }}
      className="glass-card"
    >
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 p-5 border-b border-white/[0.07]">
        <div>
          <h3 className="text-sm font-semibold text-[#e2e8f0]">Transformer Asset Registry</h3>
          <p className="text-[11px] text-[#475569]">{sorted.length.toLocaleString()} records</p>
        </div>
        <div className="flex items-center gap-2">
          <input
            type="text"
            placeholder="Search transformers..."
            value={search}
            onChange={(e) => { setSearch(e.target.value); setPage(0); }}
            className="bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-xs text-white outline-none focus:border-cyan-500/50 w-56"
          />
          <button
            onClick={handleExportCSV}
            className="px-3 py-2 rounded-lg text-xs font-medium bg-white/[0.06] text-[#cbd5e1] border border-white/10 hover:bg-white/10 transition-colors"
          >
            Export CSV
          </button>
        </div>
      </div>

      {/* Table */}
      <div className="overflow-x-auto">
        <table className="w-full border-collapse" style={{ minWidth: '2400px', tableLayout: 'fixed' }}>
          <thead>
            <tr>
              {columns.map((col) => (
                <th
                  key={col.key}
                  onClick={() => handleSort(col.key)}
                  style={{ width: col.width }}
                  className="bg-[#0f172a]/95 text-[#64748b] text-[10px] font-bold uppercase tracking-wider px-3 py-2.5 text-left border-b border-white/[0.07] sticky top-0 z-10 cursor-pointer select-none hover:text-[#cbd5e1] transition-colors"
                >
                  {col.label}
                  {sortKey === col.key && (
                    <span className="ml-1 text-cyan-400">{sortDir === 'asc' ? '↑' : '↓'}</span>
                  )}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {pageData.map((row, i) => (
              <motion.tr
                key={`${row.dtNumber}-${i}`}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.2, delay: i * 0.02 }}
                className="hover:bg-white/[0.025] transition-colors"
              >
                {columns.map((col) => (
                  <td
                    key={col.key}
                    style={{ width: col.width, ...(getCellStyle(row, col.key) ? Object.fromEntries(getCellStyle(row, col.key).split(';').filter(Boolean).map(s => { const [k, v] = s.split(':'); return [k.trim().replace(/-([a-z])/g, (_, c) => c.toUpperCase()), v.trim()]; })) : {}) }}
                    className="px-3 py-2 text-xs text-[#cbd5e1] border-b border-white/[0.04] overflow-hidden text-ellipsis whitespace-nowrap"
                  >
                    {formatCellValue(row, col.key)}
                  </td>
                ))}
              </motion.tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between px-5 py-3 border-t border-white/[0.07]">
          <span className="text-[11px] text-[#475569]">
            Showing {page * PAGE_SIZE + 1}–{Math.min((page + 1) * PAGE_SIZE, sorted.length)} of {sorted.length.toLocaleString()}
          </span>
          <div className="flex items-center gap-1">
            <button
              onClick={() => setPage(0)}
              disabled={page === 0}
              className="px-2 py-1 rounded text-xs text-[#94a3b8] hover:bg-white/5 disabled:opacity-30 transition-colors"
            >
              First
            </button>
            <button
              onClick={() => setPage((p) => Math.max(0, p - 1))}
              disabled={page === 0}
              className="px-2 py-1 rounded text-xs text-[#94a3b8] hover:bg-white/5 disabled:opacity-30 transition-colors"
            >
              Prev
            </button>
            {Array.from({ length: Math.min(7, totalPages) }, (_, i) => {
              const start = Math.max(0, Math.min(page - 3, totalPages - 7));
              const p = start + i;
              if (p >= totalPages) return null;
              return (
                <button
                  key={p}
                  onClick={() => setPage(p)}
                  className={`px-2.5 py-1 rounded text-xs font-medium transition-colors ${
                    page === p
                      ? 'bg-cyan-500/20 text-cyan-300'
                      : 'text-[#94a3b8] hover:bg-white/5'
                  }`}
                >
                  {p + 1}
                </button>
              );
            })}
            <button
              onClick={() => setPage((p) => Math.min(totalPages - 1, p + 1))}
              disabled={page >= totalPages - 1}
              className="px-2 py-1 rounded text-xs text-[#94a3b8] hover:bg-white/5 disabled:opacity-30 transition-colors"
            >
              Next
            </button>
            <button
              onClick={() => setPage(totalPages - 1)}
              disabled={page >= totalPages - 1}
              className="px-2 py-1 rounded text-xs text-[#94a3b8] hover:bg-white/5 disabled:opacity-30 transition-colors"
            >
              Last
            </button>
          </div>
        </div>
      )}
    </motion.div>
  );
}
