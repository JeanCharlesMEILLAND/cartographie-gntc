import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@cartographie/shared/auth';
import { db } from '@cartographie/shared/db';
import { users } from '@cartographie/shared/db/schema';
import { eq, and, ne } from 'drizzle-orm';
import bcrypt from 'bcryptjs';
import { createUserSchema, updateUserSchema, parseBody } from '@cartographie/shared/utils';

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
  const parsed = parseBody(createUserSchema, body);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error }, { status: 400 });
  }
  const { email, password, name, role, operator } = parsed.data;

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

export async function PUT(request: NextRequest) {
  const session = await auth();
  if (!session || (session.user as Record<string, unknown>)?.role !== 'admin') {
    return NextResponse.json({ error: 'Non autorise' }, { status: 401 });
  }

  const body = await request.json();
  const parsed = parseBody(updateUserSchema, body);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error }, { status: 400 });
  }
  const { id, email, password, name, role, operator } = parsed.data;

  // Build update object
  const updateData: Record<string, unknown> = {};
  if (name !== undefined) updateData.name = name;
  if (role !== undefined) updateData.role = role;
  if (operator !== undefined) updateData.operator = operator || null;

  if (email !== undefined) {
    // Check email uniqueness (exclude current user)
    const existing = await db
      .select()
      .from(users)
      .where(and(eq(users.email, email), ne(users.id, id)))
      .limit(1);
    if (existing.length > 0) {
      return NextResponse.json({ error: 'Email deja utilise' }, { status: 409 });
    }
    updateData.email = email;
  }

  if (password) {
    updateData.passwordHash = await bcrypt.hash(password, 10);
  }

  if (Object.keys(updateData).length === 0) {
    return NextResponse.json({ error: 'Aucun champ a modifier' }, { status: 400 });
  }

  await db.update(users).set(updateData).where(eq(users.id, id));
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
