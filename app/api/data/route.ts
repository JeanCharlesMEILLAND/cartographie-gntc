import { NextResponse } from 'next/server';
import { readTransportData } from '@/lib/db/transportData';

export async function GET() {
  try {
    const data = await readTransportData();
    return NextResponse.json(data);
  } catch (error) {
    console.error('Data read error:', error);
    return NextResponse.json(
      { error: 'Failed to read data' },
      { status: 500 }
    );
  }
}
