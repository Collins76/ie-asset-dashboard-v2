import type { CompactRecord, TransformerRecord, FilterState, Aggregation } from '@/types/dashboard';
import { BUS, BANDS, MAINTENANCE_LABELS, METERING_LABELS, BU_COLORS } from './constants';

// Expand compact array record to object
export function expandRecord(r: CompactRecord): TransformerRecord {
  return {
    bu: r[0],
    band: r[1],
    capacity: r[2],
    voltage: r[3],
    metering: r[4],
    maintenance: r[5],
    ownership: r[6],
    lat: r[7],
    lon: r[8],
    name: r[9],
    dtNumber: r[10],
    utName: r[11],
    feeder: r[12],
    installation: r[13],
    customer: r[14],
    address: r[15],
    meterNumber: r[16],
    commissioning: r[17],
    commissionDate: r[18],
    state: r[19],
  };
}

// Convert Supabase JSON object format to TransformerRecord
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function convertSupabaseRecord(r: any): TransformerRecord {
  // Map string BU to index
  const buStr = String(r.bu || '').toUpperCase();
  const buIdx = BUS.findIndex((b) => b === buStr);

  // Map SRT band string to index
  const bandStr = String(r.srt || '');
  const bandIdx = BANDS.findIndex((b) => b === bandStr);

  // Map voltage
  const fv = Number(r.fv || 11);
  const voltIdx = fv >= 33 ? 1 : 0;

  // Map metering status string to index
  const msStr = String(r.ms || '').toUpperCase();
  let meterIdx = 2; // UNMETERED default
  if (msStr.includes('METERED') && !msStr.includes('UN')) {
    meterIdx = msStr.includes('EST') ? 1 : 0;
  }

  // Map maintenance/device status to index
  const dsStr = String(r.ds || r.maint || '').toUpperCase();
  let maintIdx = 4; // Unknown
  if (dsStr.includes('ACTIVE') || dsStr.includes('HEALTH')) maintIdx = 0;
  else if (dsStr.includes('FAULT')) maintIdx = 1;
  else if (dsStr.includes('OUT')) maintIdx = 2;
  else if (dsStr.includes('INACT')) maintIdx = 3;

  // Map ownership
  const ownStr = String(r.own || '').toUpperCase();
  const ownIdx = ownStr.includes('PRIV') ? 1 : 0;

  // Map installation
  const ipStr = String(r.ip || '').toUpperCase();
  let instIdx = 2; // Unknown
  if (ipStr.includes('GROUND')) instIdx = 0;
  else if (ipStr.includes('POLE')) instIdx = 1;

  // Map commissioning
  const cosStr = String(r.cos || '').toUpperCase();
  let commIdx = 2; // Unknown
  if (cosStr === 'COMMISSIONED') commIdx = 0;
  else if (cosStr.includes('NOT')) commIdx = 1;

  // Extract year from date
  const cd = String(r.cd || '');
  const year = cd.length >= 4 ? cd.slice(0, 4) : '';

  return {
    bu: buIdx >= 0 ? buIdx : 0,
    band: bandIdx >= 0 ? bandIdx : 5,
    capacity: Number(r.cap || 0),
    voltage: voltIdx,
    metering: meterIdx,
    maintenance: maintIdx,
    ownership: ownIdx,
    lat: Number(r.lat || 0),
    lon: Number(r.lng || r.lon || 0),
    name: String(r.nom || r.name || ''),
    dtNumber: String(r.dt || ''),
    utName: String(r.nut || r.ut || ''),
    feeder: String(r.fn || r.feeder || ''),
    installation: instIdx,
    customer: String(r.cust || ''),
    address: String(r.addr || ''),
    meterNumber: String(r.mn || ''),
    commissioning: commIdx,
    commissionDate: year,
    state: String(r.st || ''),
  };
}

// Detect data format and parse accordingly
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function parseRecords(data: any[]): TransformerRecord[] {
  if (!data || data.length === 0) return [];

  // Check if first record is an array (compact) or object (Supabase JSON)
  const first = data[0];
  if (Array.isArray(first)) {
    return data.map((r) => expandRecord(r as CompactRecord));
  }
  // Object format from Supabase
  return data.map(convertSupabaseRecord);
}

// Normalize UT names
export function normUT(name: string): string {
  return name?.trim().toUpperCase() || '';
}

// Apply all filters to dataset
export function applyFilters(data: TransformerRecord[], filters: FilterState): TransformerRecord[] {
  return data.filter((r) => {
    if (filters.bu.length && !filters.bu.includes(r.bu)) return false;
    if (filters.band.length && !filters.band.includes(r.band)) return false;
    if (filters.maintenance.length && !filters.maintenance.includes(r.maintenance)) return false;
    if (filters.metering.length && !filters.metering.includes(r.metering)) return false;
    if (filters.voltage.length && !filters.voltage.includes(r.voltage)) return false;
    if (filters.ownership.length && !filters.ownership.includes(r.ownership)) return false;
    if (filters.installation.length && !filters.installation.includes(r.installation)) return false;
    if (filters.commissioning.length && !filters.commissioning.includes(r.commissioning)) return false;
    if (filters.state.length && !filters.state.includes(r.state)) return false;
    if (filters.ut.length && !filters.ut.includes(normUT(r.utName))) return false;
    if (filters.feeder.length && !filters.feeder.includes(r.feeder)) return false;
    if (filters.year.length && !filters.year.includes(r.commissionDate)) return false;
    if (filters.dtName.length && !filters.dtName.includes(r.name)) return false;
    return true;
  });
}

// Compute aggregation stats from filtered data
export function computeAggregation(data: TransformerRecord[]): Aggregation {
  const totalCount = data.length;
  let publicCount = 0, privateCount = 0, totalCapacity = 0;
  let meteredCount = 0, meteredEstCount = 0, unmeteredCount = 0;
  let healthyCount = 0, faultyCount = 0, outOfCircuitCount = 0, inactiveCount = 0;
  const utSet = new Set<string>();
  const feederSet = new Set<string>();

  // BU aggregations
  const buCap: Record<string, number> = {};
  const buCount: Record<string, number> = {};
  const buMaint: Record<string, { H: number; F: number; O: number }> = {};
  const bandMaint: Record<string, { H: number; F: number; O: number }> = {};

  // Capacity distribution
  let cap100 = 0, cap300 = 0, cap500 = 0, capOver = 0;

  // Voltage
  let v11 = 0, v33 = 0;

  for (const r of data) {
    // Ownership
    if (r.ownership === 0) publicCount++;
    else privateCount++;

    // Capacity
    totalCapacity += r.capacity;
    if (r.capacity <= 100) cap100++;
    else if (r.capacity <= 300) cap300++;
    else if (r.capacity <= 500) cap500++;
    else capOver++;

    // Metering
    if (r.metering === 0) meteredCount++;
    else if (r.metering === 1) meteredEstCount++;
    else unmeteredCount++;

    // Maintenance
    if (r.maintenance === 0) healthyCount++;
    else if (r.maintenance === 1) faultyCount++;
    else if (r.maintenance === 2) outOfCircuitCount++;
    else if (r.maintenance === 3) inactiveCount++;

    // Voltage
    if (r.voltage === 0) v11++;
    else v33++;

    // Unique counts
    if (r.utName) utSet.add(normUT(r.utName));
    if (r.feeder) feederSet.add(r.feeder);

    // BU aggregation
    const buName = BUS[r.bu] || 'Unknown';
    buCap[buName] = (buCap[buName] || 0) + r.capacity;
    buCount[buName] = (buCount[buName] || 0) + 1;

    if (!buMaint[buName]) buMaint[buName] = { H: 0, F: 0, O: 0 };
    if (r.maintenance === 0) buMaint[buName].H++;
    else if (r.maintenance === 1) buMaint[buName].F++;
    else if (r.maintenance === 2) buMaint[buName].O++;

    // Band aggregation
    const bandName = BANDS[r.band] || 'Unknown';
    if (!bandMaint[bandName]) bandMaint[bandName] = { H: 0, F: 0, O: 0 };
    if (r.maintenance === 0) bandMaint[bandName].H++;
    else if (r.maintenance === 1) bandMaint[bandName].F++;
    else if (r.maintenance === 2) bandMaint[bandName].O++;
  }

  const capacityByBU = Object.entries(buCap)
    .map(([bu, capacity]) => ({ bu, capacity, count: buCount[bu] || 0 }))
    .sort((a, b) => b.capacity - a.capacity);

  const maintenanceByBU = Object.entries(buMaint)
    .map(([bu, m]) => ({ bu, HEALTHY: m.H, FAULTY: m.F, OUT: m.O }))
    .sort((a, b) => (b.HEALTHY + b.FAULTY + b.OUT) - (a.HEALTHY + a.FAULTY + a.OUT));

  const maintenanceByBand = Object.entries(bandMaint)
    .map(([band, m]) => ({ band, HEALTHY: m.H, FAULTY: m.F, OUT: m.O }));

  return {
    totalCount,
    publicCount,
    privateCount,
    totalCapacity,
    meteredCount,
    meteredEstCount,
    unmeteredCount,
    healthyCount,
    faultyCount,
    outOfCircuitCount,
    inactiveCount,
    uniqueUTs: utSet.size,
    uniqueFeeders: feederSet.size,
    meteredPct: totalCount > 0 ? Math.round(((meteredCount + meteredEstCount) / totalCount) * 100) : 0,
    healthyPct: totalCount > 0 ? Math.round((healthyCount / totalCount) * 100) : 0,
    capacityByBU,
    meteringBreakdown: [
      { name: METERING_LABELS[0], value: meteredCount },
      { name: METERING_LABELS[1], value: meteredEstCount },
      { name: METERING_LABELS[2], value: unmeteredCount },
    ],
    maintenanceByBand,
    voltageSplit: [
      { name: '11kV', value: v11 },
      { name: '33kV', value: v33 },
    ],
    maintenanceByBU,
    capacityDistribution: [
      { name: '≤100 kVA', value: cap100 },
      { name: '101–300 kVA', value: cap300 },
      { name: '301–500 kVA', value: cap500 },
      { name: '>500 kVA', value: capOver },
    ],
  };
}

// Format capacity for display
export function formatCapacity(kva: number): string {
  if (kva >= 1_000_000) return `${(kva / 1_000_000).toFixed(1)} GVA`;
  if (kva >= 1_000) return `${(kva / 1_000).toFixed(1)} MVA`;
  return `${kva.toLocaleString()} kVA`;
}

// Format number with commas
export function formatNumber(n: number): string {
  return n.toLocaleString();
}

// Get unique filter options from data
export function getFilterOptions(data: TransformerRecord[]) {
  const states = new Set<string>();
  const uts = new Set<string>();
  const feeders = new Set<string>();
  const years = new Set<string>();
  const dtNames = new Set<string>();

  for (const r of data) {
    if (r.state) states.add(r.state);
    if (r.utName) uts.add(normUT(r.utName));
    if (r.feeder) feeders.add(r.feeder);
    if (r.commissionDate && parseInt(r.commissionDate) > 2000) years.add(r.commissionDate);
    if (r.name) dtNames.add(r.name);
  }

  return {
    states: [...states].sort(),
    uts: [...uts].sort(),
    feeders: [...feeders].sort(),
    years: [...years].sort(),
    dtNames: [...dtNames].sort(),
  };
}

// Generate CSV from data
export function generateCSV(data: TransformerRecord[]): string {
  const headers = [
    'DT Name', 'DT Number', 'Business Unit', 'UT', 'Band', 'Feeder',
    'Capacity (kVA)', 'Voltage', 'Installation', 'Metering', 'Meter Number',
    'Status', 'Commissioning', 'Ownership', 'Latitude', 'Longitude',
    'Address', 'State', 'Customer', 'Year',
  ];

  const rows = data.map((r) => [
    r.name, r.dtNumber, BUS[r.bu] || '', normUT(r.utName), BANDS[r.band] || '', r.feeder,
    r.capacity, r.voltage === 0 ? '11kV' : '33kV',
    ['GROUND', 'POLE MOUNTED', 'Unknown'][r.installation] || '',
    METERING_LABELS[r.metering] || '', r.meterNumber,
    MAINTENANCE_LABELS[r.maintenance] || '',
    ['COMMISSIONED', 'NOT COMMISSIONED', 'Unknown'][r.commissioning] || '',
    r.ownership === 0 ? 'PUBLIC' : 'PRIVATE',
    r.lat, r.lon, r.address, r.state, r.customer, r.commissionDate,
  ]);

  const escape = (v: string | number) => {
    const s = String(v ?? '');
    return s.includes(',') || s.includes('"') || s.includes('\n') ? `"${s.replace(/"/g, '""')}"` : s;
  };

  return [headers.map(escape).join(','), ...rows.map((r) => r.map(escape).join(','))].join('\n');
}

// Default empty filter state
export function emptyFilters(): FilterState {
  return {
    bu: [], band: [], maintenance: [], metering: [], voltage: [],
    ownership: [], installation: [], commissioning: [],
    state: [], ut: [], feeder: [], year: [], dtName: [],
  };
}
