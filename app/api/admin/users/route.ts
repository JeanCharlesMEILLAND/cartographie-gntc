import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { db } from '@/lib/db';
import { users } from '@/lib/db/schema';
import { eq } from 'drizzle-orm';
import bcrypt from 'bcryptjs';

export async function GET() {
  const session = await auth();
  if (!session || (session.user as Record<string, unknown>)?.role !== 'admin') {
    return NextResponse.json({ error: 'Non autorise' }, { status: 401 });
  }

  const allUsers = await db
    .select({
      id: users.id,
      email: users.email,
      name: users.name,
      role: users.role,
      operator: users.operator,
    })
    .from(users);

  return NextResponse.json(allUsers);
}

export async function POST(request: NextRequest) {
  const session = await auth();
  if (!session || (session.user as Record<string, unknown>)?.role !== 'admin') {
    return NextResponse.json({ error: 'Non autorise' }, { status: 401 });
  }

  const body = await request.json();
  const { email, password, name, role, operator } = body;

  if (!email || !password || !name) {
    return NextResponse.json({ error: 'Champs requis manquants' }, { status: 400 });
  }

  // Check duplicate email
  const existing = await db.select().from(users).where(eq(users.email, email)).limit(1);
  if (existing.length > 0) {
    return NextResponse.json({ error: 'Email deja utilise' }, { status: 409 });
  }

  const passwordHash = await bcrypt.hash(password, 10);

  await db.insert(users).values({
    email,
    passwordHash,
    name,
    role: role || 'operator',
    operator: operator || null,
  });

  return NextResponse.json({ success: true });
}

export async function DELETE(request: NextRequest) {
  const session = await auth();
  if (!session || (session.user as Record<string, unknown>)?.role !== 'admin') {
    return NextResponse.json({ error: 'Non autorise' }, { status: 401 });
  }

  const { searchParams } = new URL(request.url);
  const id = searchParams.get('id');
  if (!id) {
    return NextResponse.json({ error: 'ID manquant' }, { status: 400 });
  }

  await db.delete(users).where(eq(users.id, parseInt(id)));
  return NextResponse.json({ success: true });
}
