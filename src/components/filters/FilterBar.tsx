'use client';

import { useState, useRef, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { useDashboard } from '@/lib/store';
import {
  BUS, BANDS, MAINTENANCE_LABELS, METERING_LABELS,
  VOLTAGE_LABELS, OWNERSHIP_LABELS, INSTALLATION_LABELS,
  COMMISSIONING_LABELS, BU_COLORS,
} from '@/lib/constants';

interface MultiSelectProps {
  label: string;
  options: string[];
  selected: (string | number)[];
  onChange: (values: (string | number)[]) => void;
  colorMap?: Record<string, string>;
  searchable?: boolean;
  strMode?: boolean;
}

function MultiSelect({ label, options, selected, onChange, colorMap, searchable, strMode }: MultiSelectProps) {
  const [open, setOpen] = useState(false);
  const [menuStyle, setMenuStyle] = useState<React.CSSProperties>({});
  const [sq, setSq] = useState('');
  const btnRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    if (!open) return;
    function close(e: MouseEvent) {
      if (btnRef.current && !btnRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener('mousedown', close);
    return () => document.removeEventListener('mousedown', close);
  }, [open]);

  const handleOpen = () => {
    if (open) { setOpen(false); return; }
    const r = btnRef.current!.getBoundingClientRect();
    const mw = 240;
    const left = r.left + mw > window.innerWidth ? r.right - mw : r.left;
    setMenuStyle({
      position: 'fixed',
      top: r.bottom + 4,
      left: Math.max(8, left),
      width: mw,
      zIndex: 999999,
    });
    setOpen(true);
    setSq('');
  };

  const allSel = selected.length === 0;
  const dispItems = options
    .map((opt, i) => ({ opt, val: strMode ? opt : i }))
    .filter(({ opt }) => !sq || opt.toLowerCase().includes(sq.toLowerCase()));

  const toggle = (val: string | number) => {
    onChange(
      selected.includes(val)
        ? selected.filter((v) => v !== val)
        : [...selected, val]
    );
  };

  return (
    <>
      <button
        ref={btnRef}
        onClick={handleOpen}
        className="btn btn-secondary"
        style={{ minWidth: 134 }}
      >
        <span style={{ color: '#94A3B8', fontSize: 11 }}>{label}:</span>
        <span style={{ color: '#E2E8F0', fontWeight: 600 }}>
          {allSel ? 'All' : `${selected.length} sel.`}
        </span>
        <svg width="10" height="10" viewBox="0 0 10 10" fill="none" style={{
          transition: 'transform .2s',
          transform: open ? 'rotate(180deg)' : '',
        }}>
          <path d="M2 3.5L5 6.5L8 3.5" stroke="#64748B" strokeWidth="1.5" strokeLinecap="round" />
        </svg>
      </button>

      {open && createPortal(
        <div
          style={{
            ...menuStyle,
            background: '#1E293B',
            border: '1px solid rgba(255,255,255,.12)',
            borderRadius: 10,
            boxShadow: '0 16px 48px rgba(0,0,0,.7)',
            maxHeight: 320,
            overflowY: 'auto',
            display: 'flex',
            flexDirection: 'column',
          }}
          onMouseDown={(e) => e.stopPropagation()}
        >
          {searchable && (
            <div style={{ padding: '6px 8px', borderBottom: '1px solid rgba(255,255,255,.06)' }}>
              <input
                type="text"
                placeholder="Search..."
                value={sq}
                onChange={(e) => setSq(e.target.value)}
                autoFocus
                style={{
                  width: '100%',
                  background: '#0F172A',
                  border: '1px solid rgba(255,255,255,.12)',
                  borderRadius: 6,
                  padding: '4px 8px',
                  fontSize: 11,
                  color: 'white',
                  outline: 'none',
                }}
              />
            </div>
          )}

          {/* All (clear) option */}
          <div
            onClick={() => onChange([])}
            style={{
              padding: '8px 12px',
              cursor: 'pointer',
              fontSize: 12,
              color: allSel ? '#06B6D4' : '#64748B',
              fontStyle: 'italic',
              borderBottom: '1px solid rgba(255,255,255,.06)',
            }}
          >
            All (clear filter)
          </div>

          {dispItems.map(({ opt, val }) => {
            const isSel = selected.includes(val);
            return (
              <div
                key={String(val)}
                onClick={() => toggle(val)}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 10,
                  padding: '9px 14px',
                  cursor: 'pointer',
                  transition: 'background .15s',
                  background: isSel ? 'rgba(6,182,212,.08)' : 'transparent',
                  fontSize: 12,
                  color: '#CBD5E1',
                }}
                onMouseEnter={(e) => (e.currentTarget.style.background = 'rgba(255,255,255,.07)')}
                onMouseLeave={(e) => (e.currentTarget.style.background = isSel ? 'rgba(6,182,212,.08)' : 'transparent')}
              >
                <div style={{
                  width: 16, height: 16, borderRadius: 4,
                  border: isSel ? '2px solid #06B6D4' : '2px solid rgba(255,255,255,.2)',
                  background: isSel ? '#06B6D4' : 'transparent',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  flexShrink: 0,
                }}>
                  {isSel && (
                    <svg width="10" height="10" viewBox="0 0 10 10" fill="none">
                      <path d="M2 5L4 7L8 3" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                  )}
                </div>
                {colorMap && colorMap[opt] && (
                  <div style={{ width: 10, height: 10, borderRadius: '50%', background: colorMap[opt], flexShrink: 0 }} />
                )}
                <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{opt}</span>
              </div>
            );
          })}

          {dispItems.length === 0 && (
            <div style={{ padding: '12px', fontSize: 11, color: '#475569', textAlign: 'center' }}>No matches</div>
          )}
        </div>,
        document.body
      )}
    </>
  );
}

export default function FilterBar() {
  const { filters, setFilter, resetFilters, hasActiveFilters, filterOptions, filteredData, allData } = useDashboard();

  return (
    <div style={{
      background: 'rgba(15,23,42,.7)',
      borderBottom: '1px solid rgba(255,255,255,.05)',
    }}>
      <div style={{
        maxWidth: 1600,
        margin: '0 auto',
        padding: '10px 24px',
        display: 'flex',
        gap: 8,
        flexWrap: 'wrap',
        alignItems: 'center',
      }}>
        <span style={{
          fontSize: 10,
          fontWeight: 700,
          color: '#475569',
          letterSpacing: 1.2,
          textTransform: 'uppercase',
          marginRight: 4,
        }}>
          FILTERS
        </span>

        <MultiSelect
          label="Business Unit"
          options={[...BUS]}
          selected={filters.bu}
          onChange={(v) => setFilter('bu', v as number[])}
          colorMap={BU_COLORS}
        />
        <MultiSelect
          label="SRT Band"
          options={[...BANDS]}
          selected={filters.band}
          onChange={(v) => setFilter('band', v as number[])}
        />
        <MultiSelect
          label="Maintenance"
          options={[...MAINTENANCE_LABELS].slice(0, 3)}
          selected={filters.maintenance}
          onChange={(v) => setFilter('maintenance', v as number[])}
        />
        <MultiSelect
          label="Metering"
          options={[...METERING_LABELS]}
          selected={filters.metering}
          onChange={(v) => setFilter('metering', v as number[])}
        />
        <MultiSelect
          label="Voltage"
          options={[...VOLTAGE_LABELS]}
          selected={filters.voltage}
          onChange={(v) => setFilter('voltage', v as number[])}
        />
        <MultiSelect
          label="Ownership"
          options={[...OWNERSHIP_LABELS]}
          selected={filters.ownership}
          onChange={(v) => setFilter('ownership', v as number[])}
        />
        <MultiSelect
          label="Installation"
          options={[...INSTALLATION_LABELS].slice(0, 2)}
          selected={filters.installation}
          onChange={(v) => setFilter('installation', v as number[])}
        />
        <MultiSelect
          label="Commissioning"
          options={[...COMMISSIONING_LABELS].slice(0, 2)}
          selected={filters.commissioning}
          onChange={(v) => setFilter('commissioning', v as number[])}
        />

        {filterOptions && (
          <>
            <MultiSelect label="State" options={filterOptions.states} selected={filters.state} onChange={(v) => setFilter('state', v as string[])} strMode searchable />
            <MultiSelect label="UT" options={filterOptions.uts} selected={filters.ut} onChange={(v) => setFilter('ut', v as string[])} strMode searchable />
            <MultiSelect label="Feeder" options={filterOptions.feeders} selected={filters.feeder} onChange={(v) => setFilter('feeder', v as string[])} strMode searchable />
            <MultiSelect label="Year" options={filterOptions.years} selected={filters.year} onChange={(v) => setFilter('year', v as string[])} strMode />
          </>
        )}

        {/* Right: Count + Clear */}
        <div style={{ marginLeft: 'auto', display: 'flex', alignItems: 'center', gap: 10, fontSize: 12 }}>
          <span style={{ color: '#64748B' }}>
            Showing: <span style={{ color: '#06B6D4', fontWeight: 700 }}>{filteredData.length.toLocaleString()}</span>
            <span style={{ color: '#475569' }}> / {allData.length.toLocaleString()}</span>
          </span>
          {hasActiveFilters && (
            <button
              onClick={resetFilters}
              className="btn btn-danger"
              style={{ fontSize: 11, padding: '5px 12px' }}
            >
              ✕ Clear all
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
