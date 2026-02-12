import { NextRequest, NextResponse } from 'next/server';
import { parseTransportExcel } from '@/lib/parseExcel';
import { TransportData } from '@/lib/types';
import fs from 'fs';
import path from 'path';

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const file = formData.get('file') as File | null;

    if (!file) {
      return NextResponse.json({ error: 'No file provided' }, { status: 400 });
    }

    if (!file.name.endsWith('.xlsx') && !file.name.endsWith('.xls')) {
      return NextResponse.json({ error: 'File must be .xlsx or .xls' }, { status: 400 });
    }

    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    const { platforms, routes, services, operators, unmatchedPlatforms } =
      await parseTransportExcel(buffer);

    const transportData: TransportData = {
      platforms,
      routes,
      services,
      operators,
      unmatchedPlatforms,
      uploadedAt: new Date().toISOString(),
      fileName: file.name,
    };

    // Save to data/current.json
    const dataDir = path.join(process.cwd(), 'data');
    if (!fs.existsSync(dataDir)) {
      fs.mkdirSync(dataDir, { recursive: true });
    }
    fs.writeFileSync(
      path.join(dataDir, 'current.json'),
      JSON.stringify(transportData, null, 2),
      'utf-8'
    );

    return NextResponse.json({
      success: true,
      stats: {
        platforms: platforms.length,
        routes: routes.length,
        operators: operators.length,
        unmatched: unmatchedPlatforms.length,
        unmatchedList: unmatchedPlatforms,
      },
    });
  } catch (error) {
    console.error('Upload error:', error);
    return NextResponse.json(
      { error: 'Failed to parse Excel file' },
      { status: 500 }
    );
  }
}
