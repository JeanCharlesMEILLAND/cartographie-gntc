import { NextResponse } from 'next/server';
import { auth } from '@cartographie/shared/auth';
import { db } from '@cartographie/shared/db';
import { registrations } from '@cartographie/shared/db/schema';
import { eq, desc } from 'drizzle-orm';

export async function GET() {
  const session = await auth();
  if (!session || (session.user as Record<string, unknown>)?.role !== 'admin') {
    return NextResponse.json({ error: 'Non autorisé' }, { status: 401 });
  }

  const rows = await db.select().from(registrations).orderBy(desc(registrations.createdAt));
  return NextResponse.json(rows);
}

export async function PATCH(request: Request) {
  const session = await auth();
  if (!session || (session.user as Record<string, unknown>)?.role !== 'admin') {
    return NextResponse.json({ error: 'Non autorisé' }, { status: 401 });
  }

  const body = await request.json();
  const { id, status, notes } = body;

  if (!id || !status) {
    return NextResponse.json({ error: 'ID et statut requis' }, { status: 400 });
  }

  await db.update(registrations)
    .set({ status, notes: notes ?? undefined, updatedAt: new Date() })
    .where(eq(registrations.id, id));

  return NextResponse.json({ success: true });
}
