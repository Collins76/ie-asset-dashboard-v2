import { NextResponse } from 'next/server';
import { list } from '@vercel/blob';

const SUPABASE_DATA_URL = 'https://blxuwvxitbbjhzgucvhp.supabase.co/storage/v1/object/public/dashboard-assets/dashboard_data.js';
const SUPABASE_UPRISER_URL = 'https://blxuwvxitbbjhzgucvhp.supabase.co/storage/v1/object/public/dashboard-assets/upriser_feeder_pillar.js';
const SUPABASE_NETWORK_URL = 'https://blxuwvxitbbjhzgucvhp.supabase.co/storage/v1/object/public/dashboard-assets/ie_network_overview.js';

const BUS = ['ABULE EGBA', 'AKOWONJO', 'IKEJA', 'IKORODU', 'OSHODI', 'SHOMOLU'];
const BANDS = ['Band A', 'Band B', 'Band C', 'Band D', 'Band E', 'Unknown'];

// Convert a Supabase JSON record to compact array format [20 fields]
// eslint-disable-next-line @typescript-eslint/no-explicit-any
function toCompact(r: any): any[] {
  const buIdx = Math.max(0, BUS.findIndex((b) => b === String(r.bu || '').toUpperCase()));
  const bandIdx = BANDS.findIndex((b) => b === String(r.srt || ''));

  const fv = Number(r.fv || 11);
  const voltIdx = fv >= 33 ? 1 : 0;

  const msStr = String(r.ms || '').toUpperCase();
  let meterIdx = 2;
  if (msStr.includes('METERED') && !msStr.includes('UN')) {
    meterIdx = msStr.includes('EST') ? 1 : 0;
  }

  const dsStr = String(r.ds || r.maint || '').toUpperCase();
  let maintIdx = 4;
  if (dsStr.includes('ACTIVE') || dsStr.includes('HEALTH')) maintIdx = 0;
  else if (dsStr.includes('FAULT')) maintIdx = 1;
  else if (dsStr.includes('OUT')) maintIdx = 2;
  else if (dsStr.includes('INACT')) maintIdx = 3;

  const ownIdx = String(r.own || '').toUpperCase().includes('PRIV') ? 1 : 0;

  const ipStr = String(r.ip || '').toUpperCase();
  let instIdx = 2;
  if (ipStr.includes('GROUND')) instIdx = 0;
  else if (ipStr.includes('POLE')) instIdx = 1;

  const cosStr = String(r.cos || '').toUpperCase();
  let commIdx = 2;
  if (cosStr === 'COMMISSIONED') commIdx = 0;
  else if (cosStr.includes('NOT')) commIdx = 1;

  const cd = String(r.cd || '');
  const year = cd.length >= 4 ? cd.slice(0, 4) : '';

  return [
    buIdx, bandIdx >= 0 ? bandIdx : 5, Number(r.cap || 0), voltIdx, meterIdx,
    maintIdx, ownIdx, Number(r.lat || 0), Number(r.lng || r.lon || 0),
    String(r.nom || r.name || ''), String(r.dt || ''), String(r.nut || r.ut || ''),
    String(r.fn || r.feeder || ''), instIdx, String(r.cust || ''),
    String(r.addr || ''), String(r.mn || ''), commIdx, year, String(r.st || ''),
  ];
}

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const type = searchParams.get('type') || 'dashboard';

  try {
    // Try Vercel Blob first
    const blobName = `${type}.json`;
    try {
      const { blobs } = await list({ prefix: blobName });
      if (blobs.length > 0) {
        const res = await fetch(blobs[0].url);
        const data = await res.json();
        return NextResponse.json({ data, source: 'blob' }, {
          headers: { 'Cache-Control': 'public, s-maxage=300, stale-while-revalidate=600' },
        });
      }
    } catch {
      // Blob not configured, fall through
    }

    // Fallback: fetch from Supabase
    let url = SUPABASE_DATA_URL;
    if (type === 'upriser') url = SUPABASE_UPRISER_URL;
    if (type === 'network') url = SUPABASE_NETWORK_URL;

    const res = await fetch(url, { next: { revalidate: 3600 } });
    const text = await res.text();

    const jsonMatch = text.match(/=\s*(\[[\s\S]*?\])\s*;?\s*$/);
    if (!jsonMatch) {
      // Try as GeoJSON object
      const objMatch = text.match(/=\s*(\{[\s\S]*\})\s*;?\s*$/);
      if (objMatch) {
        const data = JSON.parse(objMatch[1]);
        return NextResponse.json({ data, source: 'supabase' }, {
          headers: { 'Cache-Control': 'public, s-maxage=300, stale-while-revalidate=600' },
        });
      }
      return NextResponse.json({ error: 'Failed to parse data' }, { status: 500 });
    }

    const rawData = JSON.parse(jsonMatch[1]);

    // Convert dashboard data to compact format server-side
    let data;
    if (type === 'dashboard' && rawData.length > 0 && !Array.isArray(rawData[0])) {
      data = rawData.map(toCompact);
    } else {
      data = rawData;
    }

    return NextResponse.json({ data, source: 'supabase' }, {
      headers: { 'Cache-Control': 'public, s-maxage=300, stale-while-revalidate=600' },
    });
  } catch (error) {
    console.error('Data fetch error:', error);
    return NextResponse.json({ error: 'Failed to load data' }, { status: 500 });
  }
}
