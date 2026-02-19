import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@cartographie/shared/auth';
import { db } from '@cartographie/shared/db';
import { ports } from '@cartographie/shared/db/schema';
import { eq } from 'drizzle-orm';

// GET: list all ports
export async function GET() {
  const session = await auth();
  if (!session) return NextResponse.json({ error: 'Non autorisé' }, { status: 401 });

  const allPorts = await db.select().from(ports).orderBy(ports.name);
  return NextResponse.json(allPorts);
}

// POST: add a manual port
export async function POST(request: NextRequest) {
  const session = await auth();
  if (!session) return NextResponse.json({ error: 'Non autorisé' }, { status: 401 });

  const role = (session.user as Record<string, unknown>)?.role as string;
  if (role !== 'admin') return NextResponse.json({ error: 'Admin requis' }, { status: 403 });

  const body = await request.json();
  const { name, latitude, longitude, nature, commune, operator, cargo } = body;

  if (!name || !latitude || !longitude) {
    return NextResponse.json({ error: 'name, latitude, longitude requis' }, { status: 400 });
  }

  const [inserted] = await db.insert(ports).values({
    name,
    latitude: String(latitude),
    longitude: String(longitude),
    nature: nature || 'Fluvial',
    source: 'manual',
    commune: commune || null,
    operator: operator || null,
    cargo: cargo || null,
    hasCommerce: 1,
    visible: 1,
  }).returning();

  return NextResponse.json(inserted, { status: 201 });
}

// PUT: update a port
export async function PUT(request: NextRequest) {
  const session = await auth();
  if (!session) return NextResponse.json({ error: 'Non autorisé' }, { status: 401 });

  const role = (session.user as Record<string, unknown>)?.role as string;
  if (role !== 'admin') return NextResponse.json({ error: 'Admin requis' }, { status: 403 });

  const body = await request.json();
  const { id, ...updates } = body;

  if (!id) return NextResponse.json({ error: 'id requis' }, { status: 400 });

  // Build update object with only provided fields
  const updateData: Record<string, unknown> = { updatedAt: new Date() };
  const allowedFields = ['name', 'latitude', 'longitude', 'nature', 'commune', 'operator', 'gestion', 'zone', 'cargo', 'hasCommerce', 'visible'];
  for (const field of allowedFields) {
    if (updates[field] !== undefined) {
      updateData[field] = updates[field];
    }
  }

  await db.update(ports).set(updateData).where(eq(ports.id, Number(id)));
  return NextResponse.json({ ok: true });
}

// DELETE: remove a port
export async function DELETE(request: NextRequest) {
  const session = await auth();
  if (!session) return NextResponse.json({ error: 'Non autorisé' }, { status: 401 });

  const role = (session.user as Record<string, unknown>)?.role as string;
  if (role !== 'admin') return NextResponse.json({ error: 'Admin requis' }, { status: 403 });

  const { searchParams } = new URL(request.url);
  const id = searchParams.get('id');
  if (!id) return NextResponse.json({ error: 'id requis' }, { status: 400 });

  await db.delete(ports).where(eq(ports.id, Number(id)));
  return NextResponse.json({ ok: true });
}
