import { NextResponse } from 'next/server';
import { TransportData } from '@/lib/types';
import fs from 'fs';
import path from 'path';

export async function GET() {
  try {
    const filePath = path.join(process.cwd(), 'data', 'current.json');

    if (!fs.existsSync(filePath)) {
      // Return empty data if no file uploaded yet
      const empty: TransportData = {
        platforms: [],
        routes: [],
        services: [],
        operators: [],
        unmatchedPlatforms: [],
        uploadedAt: '',
        fileName: '',
      };
      return NextResponse.json(empty);
    }

    const raw = fs.readFileSync(filePath, 'utf-8');
    const data: TransportData = JSON.parse(raw);

    return NextResponse.json(data);
  } catch (error) {
    console.error('Data read error:', error);
    return NextResponse.json(
      { error: 'Failed to read data' },
      { status: 500 }
    );
  }
}
