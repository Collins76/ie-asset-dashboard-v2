// Business Unit names and colors
export const BUS = ['ABULE EGBA', 'AKOWONJO', 'IKEJA', 'IKORODU', 'OSHODI', 'SHOMOLU'] as const;
export const BU_COLORS: Record<string, string> = {
  'ABULE EGBA': '#06B6D4',
  'AKOWONJO': '#8B5CF6',
  'IKEJA': '#10B981',
  'IKORODU': '#F59E0B',
  'OSHODI': '#EF4444',
  'SHOMOLU': '#EC4899',
};

// SRT Bands
export const BANDS = ['Band A', 'Band B', 'Band C', 'Band D', 'Band E', 'Unknown'] as const;

// Maintenance status
export const MAINTENANCE_LABELS = ['HEALTHY', 'FAULTY', 'OUT OF CIRCUIT', 'INACTIVE', 'Unknown'] as const;
export const MAINT_COLORS: Record<number, string> = {
  0: '#10B981', // Healthy - green
  1: '#EF4444', // Faulty - red
  2: '#F59E0B', // Out of Circuit - amber
  3: '#F97316', // Inactive - orange
  4: '#94A3B8', // Unknown - gray
};

// Metering status
export const METERING_LABELS = ['METERED', 'METERED EST.', 'UNMETERED'] as const;
export const METER_COLORS: Record<string, string> = {
  'METERED': '#10B981',
  'METERED EST.': '#F59E0B',
  'UNMETERED': '#EF4444',
};

// Voltage labels
export const VOLTAGE_LABELS = ['11kV', '33kV'] as const;

// Ownership labels
export const OWNERSHIP_LABELS = ['PUBLIC', 'PRIVATE'] as const;

// Installation labels
export const INSTALLATION_LABELS = ['GROUND', 'POLE MOUNTED', 'Unknown'] as const;

// Commissioning labels
export const COMMISSIONING_LABELS = ['COMMISSIONED', 'NOT COMMISSIONED', 'Unknown'] as const;

// HT Line colors by BU
export const HT_LINE_COLORS: Record<string, string> = {
  'SHOMOLU': '#fecdd3',
  'OSHODI': '#ddd6fe',
  'IKORODU': '#a7f3d0',
  'IKEJA': '#a5f3fc',
  'AKOWONJO': '#fef08a',
  'ABULE EGBA': '#fed7aa',
  'ABULE_EGBA': '#fed7aa',
};

// Navigation items
export const NAV_ITEMS = [
  { label: 'Executive Summary', href: '/executive-summary', icon: 'chart-bar' },
  { label: 'Network Infrastructure', href: '/network-infrastructure', icon: 'server' },
  { label: 'Metering Analytics', href: '/metering-analytics', icon: 'gauge' },
  { label: 'Operational Status', href: '/operational-status', icon: 'activity' },
  { label: 'Upriser & Feeder Pillar', href: '/upriser-feeder-pillar', icon: 'zap' },
  { label: 'Geospatial DT Map', href: '/geospatial-dt-map', icon: 'map' },
  { label: 'Network Overview', href: '/network-overview', icon: 'globe' },
] as const;

// Capacity distribution buckets
export const CAPACITY_BUCKETS = ['≤100 kVA', '101–300 kVA', '301–500 kVA', '>500 kVA'] as const;
export const CAPACITY_BUCKET_COLORS = ['#06B6D4', '#10B981', '#F59E0B', '#EF4444'];

// Chart colors
export const VOLTAGE_COLORS = ['#06B6D4', '#A78BFA'];
