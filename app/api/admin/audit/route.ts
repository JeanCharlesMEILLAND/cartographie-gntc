import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { db } from '@/lib/db';
import { auditLog } from '@/lib/db/schema';
import { desc } from 'drizzle-orm';

export async function GET(request: NextRequest) {
  const session = await auth();
  if (!session || (session.user as Record<string, unknown>)?.role !== 'admin') {
    return NextResponse.json({ error: 'Non autorisé' }, { status: 401 });
  }

  const { searchParams } = new URL(request.url);
  const limit = Math.min(parseInt(searchParams.get('limit') || '100'), 500);
  const offset = parseInt(searchParams.get('offset') || '0');

  const entries = await db
    .select()
    .from(auditLog)
    .orderBy(desc(auditLog.timestamp))
    .limit(limit)
    .offset(offset);

  return NextResponse.json(entries);
}
