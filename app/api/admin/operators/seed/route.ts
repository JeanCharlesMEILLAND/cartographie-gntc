import { NextResponse } from 'next/server';
import { auth } from '@cartographie/shared/auth';
import { db } from '@cartographie/shared/db';
import { operators } from '@cartographie/shared/db/schema';
import { eq } from 'drizzle-orm';
import { OPERATOR_COLORS } from '@/lib/colors';
import { readTransportData } from '@/lib/db/transportData';

export async function POST() {
  const session = await auth();
  if (!session || (session.user as Record<string, unknown>)?.role !== 'admin') {
    return NextResponse.json({ error: 'Non autorisé' }, { status: 401 });
  }

  try {
    const data = await readTransportData();
    if (!data.uploadedAt) {
      return NextResponse.json({ error: 'Aucune donnée transport importée' }, { status: 404 });
    }

    const operatorNames: string[] = data.operators || [];

    let created = 0;
    let existing = 0;

    for (const name of operatorNames) {
      const exists = await db.select().from(operators).where(eq(operators.name, name)).limit(1);
      if (exists.length > 0) {
        existing++;
        continue;
      }

      await db.insert(operators).values({
        name,
        color: OPERATOR_COLORS[name] || null,
      });
      created++;
    }

    return NextResponse.json({ success: true, created, existing, total: operatorNames.length });
  } catch {
    return NextResponse.json({ error: 'Erreur lors du seed' }, { status: 500 });
  }
}
