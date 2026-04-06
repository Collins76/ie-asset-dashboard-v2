import { NextResponse } from 'next/server';
import { put } from '@vercel/blob';

export async function POST(request: Request) {
  try {
    const formData = await request.formData();
    const file = formData.get('file') as File | null;
    const type = formData.get('type') as string || 'dashboard';

    if (!file) {
      return NextResponse.json({ error: 'No file provided' }, { status: 400 });
    }

    let jsonData: unknown;

    if (file.name.endsWith('.xlsx') || file.name.endsWith('.xls')) {
      // Dynamically import xlsx to parse Excel files
      const XLSX = await import('xlsx');
      const buffer = await file.arrayBuffer();
      const workbook = XLSX.read(buffer, { type: 'array' });
      const sheet = workbook.Sheets[workbook.SheetNames[0]];
      jsonData = XLSX.utils.sheet_to_json(sheet);
    } else if (file.name.endsWith('.json')) {
      const text = await file.text();
      jsonData = JSON.parse(text);
    } else if (file.name.endsWith('.csv')) {
      const XLSX = await import('xlsx');
      const text = await file.text();
      const workbook = XLSX.read(text, { type: 'string' });
      const sheet = workbook.Sheets[workbook.SheetNames[0]];
      jsonData = XLSX.utils.sheet_to_json(sheet);
    } else {
      return NextResponse.json({ error: 'Unsupported file format. Use .xlsx, .xls, .csv, or .json' }, { status: 400 });
    }

    // Upload to Vercel Blob
    const blob = await put(`${type}.json`, JSON.stringify(jsonData), {
      access: 'public',
      contentType: 'application/json',
      addRandomSuffix: false,
    });

    return NextResponse.json({
      success: true,
      url: blob.url,
      records: Array.isArray(jsonData) ? jsonData.length : 0,
    });
  } catch (error) {
    console.error('Upload error:', error);
    return NextResponse.json({ error: 'Upload failed' }, { status: 500 });
  }
}
