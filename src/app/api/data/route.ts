import { NextResponse } from 'next/server';
import { list, head } from '@vercel/blob';

const SUPABASE_DATA_URL = 'https://blxuwvxitbbjhzgucvhp.supabase.co/storage/v1/object/public/dashboard-assets/dashboard_data.js';
const SUPABASE_UPRISER_URL = 'https://blxuwvxitbbjhzgucvhp.supabase.co/storage/v1/object/public/dashboard-assets/upriser_feeder_pillar.js';
const SUPABASE_NETWORK_URL = 'https://blxuwvxitbbjhzgucvhp.supabase.co/storage/v1/object/public/dashboard-assets/ie_network_overview.js';

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
      // Blob not configured or empty, fall through to Supabase
    }

    // Fallback: fetch from Supabase
    let url = SUPABASE_DATA_URL;
    if (type === 'upriser') url = SUPABASE_UPRISER_URL;
    if (type === 'network') url = SUPABASE_NETWORK_URL;

    const res = await fetch(url, { next: { revalidate: 3600 } });
    const text = await res.text();

    // The Supabase JS files assign to a global variable. Extract the JSON data.
    // Format: var DASHBOARD_DATA = [...]; or var OV_UPRISER_DATA = [...];
    const jsonMatch = text.match(/=\s*(\[[\s\S]*\])\s*;?\s*$/);
    if (!jsonMatch) {
      return NextResponse.json({ error: 'Failed to parse data' }, { status: 500 });
    }

    const data = JSON.parse(jsonMatch[1]);
    return NextResponse.json({ data, source: 'supabase' }, {
      headers: { 'Cache-Control': 'public, s-maxage=300, stale-while-revalidate=600' },
    });
  } catch (error) {
    console.error('Data fetch error:', error);
    return NextResponse.json({ error: 'Failed to load data' }, { status: 500 });
  }
}
