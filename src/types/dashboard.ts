// Transformer record - expanded from compact array format
export interface TransformerRecord {
  bu: number;
  band: number;
  capacity: number;
  voltage: number;
  metering: number;
  maintenance: number;
  ownership: number;
  lat: number;
  lon: number;
  name: string;
  dtNumber: string;
  utName: string;
  feeder: string;
  installation: number;
  customer: string;
  address: string;
  meterNumber: string;
  commissioning: number;
  commissionDate: string;
  state: string;
}

// Compact array format from data source (20 indices)
export type CompactRecord = [
  number, number, number, number, number,
  number, number, number, number, string,
  string, string, string, number, string,
  string, string, number, string, string
];

// Filter state
export interface FilterState {
  bu: number[];
  band: number[];
  maintenance: number[];
  metering: number[];
  voltage: number[];
  ownership: number[];
  installation: number[];
  commissioning: number[];
  state: string[];
  ut: string[];
  feeder: string[];
  year: string[];
  dtName: string[];
}

// KPI aggregation
export interface Aggregation {
  totalCount: number;
  publicCount: number;
  privateCount: number;
  totalCapacity: number;
  meteredCount: number;
  meteredEstCount: number;
  unmeteredCount: number;
  healthyCount: number;
  faultyCount: number;
  outOfCircuitCount: number;
  inactiveCount: number;
  uniqueUTs: number;
  uniqueFeeders: number;
  meteredPct: number;
  healthyPct: number;
  capacityByBU: { bu: string; capacity: number; count: number }[];
  meteringBreakdown: { name: string; value: number }[];
  maintenanceByBand: { band: string; HEALTHY: number; FAULTY: number; OUT: number }[];
  voltageSplit: { name: string; value: number }[];
  maintenanceByBU: { bu: string; HEALTHY: number; FAULTY: number; OUT: number }[];
  capacityDistribution: { name: string; value: number }[];
}

// GeoJSON types for network overlay
export interface NetworkFeature {
  type: 'Feature';
  properties: Record<string, string | number | undefined>;
  geometry: {
    type: string;
    coordinates: number[] | number[][] | number[][][];
  };
}

export interface NetworkGeoJSON {
  type: 'FeatureCollection';
  features: NetworkFeature[];
}
