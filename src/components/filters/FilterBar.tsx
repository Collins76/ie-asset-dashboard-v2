'use client';

import { useState, useRef, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useDashboard } from '@/lib/store';
import {
  BUS, BANDS, MAINTENANCE_LABELS, METERING_LABELS,
  VOLTAGE_LABELS, OWNERSHIP_LABELS, INSTALLATION_LABELS,
  COMMISSIONING_LABELS, BU_COLORS,
} from '@/lib/constants';
import type { FilterState } from '@/types/dashboard';

interface MultiSelectProps {
  label: string;
  options: { label: string; value: string | number }[];
  selected: (string | number)[];
  onChange: (values: (string | number)[]) => void;
  colorMap?: Record<string, string>;
  searchable?: boolean;
}

function MultiSelect({ label, options, selected, onChange, colorMap, searchable }: MultiSelectProps) {
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState('');
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const filtered = searchable && search
    ? options.filter((o) => String(o.label).toLowerCase().includes(search.toLowerCase()))
    : options;

  const toggle = (val: string | number) => {
    onChange(
      selected.includes(val)
        ? selected.filter((v) => v !== val)
        : [...selected, val]
    );
  };

  return (
    <div className="relative" ref={ref}>
      <button
        onClick={() => setOpen(!open)}
        className={`
          flex items-center gap-2 px-3 py-2 rounded-lg text-xs font-medium
          transition-all duration-200 whitespace-nowrap
          ${selected.length > 0
            ? 'bg-cyan-500/15 text-cyan-300 border border-cyan-500/30'
            : 'bg-white/[0.05] text-[#94a3b8] border border-white/10 hover:border-white/20'
          }
        `}
      >
        {label}
        {selected.length > 0 && (
          <span className="bg-cyan-500/30 text-cyan-200 text-[10px] px-1.5 py-0.5 rounded-full font-bold">
            {selected.length}
          </span>
        )}
        <svg className={`w-3 h-3 transition-transform ${open ? 'rotate-180' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: -8, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -8, scale: 0.95 }}
            transition={{ duration: 0.15 }}
            className="absolute top-full left-0 mt-1 z-50 min-w-[200px] max-h-[280px] overflow-y-auto
              bg-[#0f172a]/98 backdrop-blur-xl border border-white/10 rounded-xl shadow-2xl"
          >
            {searchable && (
              <div className="p-2 border-b border-white/[0.07]">
                <input
                  type="text"
                  placeholder="Search..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-1.5 text-xs text-white outline-none focus:border-cyan-500/50"
                />
              </div>
            )}
            {filtered.map((opt) => (
              <div
                key={String(opt.value)}
                onClick={() => toggle(opt.value)}
                className="flex items-center gap-2.5 px-3 py-2 cursor-pointer hover:bg-white/[0.05] transition-colors"
              >
                <div className={`w-4 h-4 rounded border flex items-center justify-center transition-colors ${
                  selected.includes(opt.value) ? 'bg-cyan-500 border-cyan-500' : 'border-white/20'
                }`}>
                  {selected.includes(opt.value) && (
                    <svg className="w-3 h-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                    </svg>
                  )}
                </div>
                {colorMap && colorMap[opt.label] && (
                  <div className="w-2.5 h-2.5 rounded-full shrink-0" style={{ background: colorMap[opt.label] }} />
                )}
                <span className="text-xs text-[#cbd5e1] truncate">{opt.label}</span>
              </div>
            ))}
            {filtered.length === 0 && (
              <div className="px-3 py-4 text-xs text-[#475569] text-center">No matches</div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

export default function FilterBar() {
  const { filters, setFilter, resetFilters, hasActiveFilters, filterOptions } = useDashboard();

  return (
    <motion.div
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      className="sticky top-0 z-30 bg-[#0a0a0f]/90 backdrop-blur-xl border-b border-white/[0.07] px-6 py-3"
    >
      <div className="flex items-center gap-2 overflow-x-auto scrollbar-hide pb-1">
        <span className="text-[10px] font-bold text-[#475569] uppercase tracking-widest shrink-0 mr-1">Filters</span>

        <MultiSelect
          label="BU"
          options={BUS.map((b, i) => ({ label: b, value: i }))}
          selected={filters.bu}
          onChange={(v) => setFilter('bu', v as number[])}
          colorMap={Object.fromEntries(BUS.map((b) => [b, BU_COLORS[b]]))}
        />

        <MultiSelect
          label="SRT Band"
          options={BANDS.map((b, i) => ({ label: b, value: i }))}
          selected={filters.band}
          onChange={(v) => setFilter('band', v as number[])}
        />

        <MultiSelect
          label="Maintenance"
          options={MAINTENANCE_LABELS.slice(0, 3).map((l, i) => ({ label: l, value: i }))}
          selected={filters.maintenance}
          onChange={(v) => setFilter('maintenance', v as number[])}
        />

        <MultiSelect
          label="Metering"
          options={METERING_LABELS.map((l, i) => ({ label: l, value: i }))}
          selected={filters.metering}
          onChange={(v) => setFilter('metering', v as number[])}
        />

        <MultiSelect
          label="Voltage"
          options={VOLTAGE_LABELS.map((l, i) => ({ label: l, value: i }))}
          selected={filters.voltage}
          onChange={(v) => setFilter('voltage', v as number[])}
        />

        <MultiSelect
          label="Ownership"
          options={OWNERSHIP_LABELS.map((l, i) => ({ label: l, value: i }))}
          selected={filters.ownership}
          onChange={(v) => setFilter('ownership', v as number[])}
        />

        <MultiSelect
          label="Installation"
          options={INSTALLATION_LABELS.slice(0, 2).map((l, i) => ({ label: l, value: i }))}
          selected={filters.installation}
          onChange={(v) => setFilter('installation', v as number[])}
        />

        <MultiSelect
          label="Commission"
          options={COMMISSIONING_LABELS.slice(0, 2).map((l, i) => ({ label: l, value: i }))}
          selected={filters.commissioning}
          onChange={(v) => setFilter('commissioning', v as number[])}
        />

        {filterOptions && (
          <>
            <MultiSelect
              label="State"
              options={filterOptions.states.map((s) => ({ label: s, value: s }))}
              selected={filters.state}
              onChange={(v) => setFilter('state', v as string[])}
              searchable
            />
            <MultiSelect
              label="UT"
              options={filterOptions.uts.map((u) => ({ label: u, value: u }))}
              selected={filters.ut}
              onChange={(v) => setFilter('ut', v as string[])}
              searchable
            />
            <MultiSelect
              label="Feeder"
              options={filterOptions.feeders.map((f) => ({ label: f, value: f }))}
              selected={filters.feeder}
              onChange={(v) => setFilter('feeder', v as string[])}
              searchable
            />
            <MultiSelect
              label="Year"
              options={filterOptions.years.map((y) => ({ label: y, value: y }))}
              selected={filters.year}
              onChange={(v) => setFilter('year', v as string[])}
            />
          </>
        )}

        {hasActiveFilters && (
          <button
            onClick={resetFilters}
            className="shrink-0 px-3 py-2 rounded-lg text-xs font-medium bg-red-500/15 text-red-400 border border-red-500/25 hover:bg-red-500/25 transition-colors"
          >
            Clear All
          </button>
        )}
      </div>
    </motion.div>
  );
}
