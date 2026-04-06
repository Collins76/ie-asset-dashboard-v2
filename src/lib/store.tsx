'use client';

import { createContext, useContext, useState, useCallback, useEffect, type ReactNode } from 'react';
import type { TransformerRecord, FilterState, Aggregation } from '@/types/dashboard';
import { parseRecords, applyFilters, computeAggregation, getFilterOptions, emptyFilters } from './data';

interface DashboardContextValue {
  allData: TransformerRecord[];
  filteredData: TransformerRecord[];
  aggregation: Aggregation | null;
  filters: FilterState;
  filterOptions: ReturnType<typeof getFilterOptions> | null;
  setFilter: (key: keyof FilterState, value: number[] | string[]) => void;
  resetFilters: () => void;
  isLoading: boolean;
  hasActiveFilters: boolean;
}

const DashboardContext = createContext<DashboardContextValue | null>(null);

export function DashboardProvider({ children }: { children: ReactNode }) {
  const [allData, setAllData] = useState<TransformerRecord[]>([]);
  const [filteredData, setFilteredData] = useState<TransformerRecord[]>([]);
  const [aggregation, setAggregation] = useState<Aggregation | null>(null);
  const [filters, setFilters] = useState<FilterState>(emptyFilters());
  const [filterOptions, setFilterOptions] = useState<ReturnType<typeof getFilterOptions> | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Load data on mount
  useEffect(() => {
    async function loadData() {
      try {
        const res = await fetch('/api/data');
        if (!res.ok) throw new Error('Failed to fetch data');
        const json = await res.json();
        const rawData = json.data || [];
        const expanded = parseRecords(rawData);
        setAllData(expanded);
        setFilteredData(expanded);
        setAggregation(computeAggregation(expanded));
        setFilterOptions(getFilterOptions(expanded));
      } catch (err) {
        console.error('Failed to load dashboard data:', err);
      } finally {
        setIsLoading(false);
      }
    }
    loadData();
  }, []);

  // Re-filter when filters change
  useEffect(() => {
    if (allData.length === 0) return;
    const filtered = applyFilters(allData, filters);
    setFilteredData(filtered);
    setAggregation(computeAggregation(filtered));
  }, [filters, allData]);

  const setFilter = useCallback((key: keyof FilterState, value: number[] | string[]) => {
    setFilters((prev) => ({ ...prev, [key]: value }));
  }, []);

  const resetFilters = useCallback(() => {
    setFilters(emptyFilters());
  }, []);

  const hasActiveFilters = Object.values(filters).some((v) => v.length > 0);

  return (
    <DashboardContext.Provider
      value={{
        allData,
        filteredData,
        aggregation,
        filters,
        filterOptions,
        setFilter,
        resetFilters,
        isLoading,
        hasActiveFilters,
      }}
    >
      {children}
    </DashboardContext.Provider>
  );
}

export function useDashboard() {
  const ctx = useContext(DashboardContext);
  if (!ctx) throw new Error('useDashboard must be used within DashboardProvider');
  return ctx;
}
