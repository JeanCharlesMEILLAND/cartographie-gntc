import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { db } from '@/lib/db';
import { operators, users } from '@/lib/db/schema';
import { eq } from 'drizzle-orm';
import { createOperatorSchema, updateOperatorSchema, parseBody } from '@/lib/validations';

export async function GET() {
  const session = await auth();
  if (!session) {
    return NextResponse.json({ error: 'Non autorisé' }, { status: 401 });
  }

  const role = (session.user as Record<string, unknown>)?.role as string;
  const userOperator = (session.user as Record<string, unknown>)?.operator as string | undefined;

  if (role === 'operator' && userOperator) {
    // Operator: only their own record
    const result = await db
      .select()
      .from(operators)
      .where(eq(operators.name, userOperator))
      .limit(1);
    return NextResponse.json(result);
  }

  // Admin: all operators
  const allOperators = await db
    .select()
    .from(operators)
    .orderBy(operators.name);

  return NextResponse.json(allOperators);
}

export async function POST(request: NextRequest) {
  const session = await auth();
  if (!session || (session.user as Record<string, unknown>)?.role !== 'admin') {
    return NextResponse.json({ error: 'Non autorisé' }, { status: 401 });
  }

  const body = await request.json();
  const parsed = parseBody(createOperatorSchema, body);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error }, { status: 400 });
  }
  const { name, ...optionalFields } = parsed.data;

  // Check duplicate name
  const existing = await db.select().from(operators).where(eq(operators.name, name)).limit(1);
  if (existing.length > 0) {
    return NextResponse.json({ error: 'Opérateur déjà existant' }, { status: 409 });
  }

  const [created] = await db.insert(operators).values({
    name,
    logo: optionalFields.logo || null,
    description: optionalFields.description || null,
    website: optionalFields.website || null,
    contactEmail: optionalFields.contactEmail || null,
    contactPhone: optionalFields.contactPhone || null,
    address: optionalFields.address || null,
    color: optionalFields.color || null,
  }).returning();

  return NextResponse.json({ success: true, operator: created });
}

export async function PUT(request: NextRequest) {
  const session = await auth();
  if (!session) {
    return NextResponse.json({ error: 'Non autorisé' }, { status: 401 });
  }

  const role = (session.user as Record<string, unknown>)?.role as string;
  const userOperator = (session.user as Record<string, unknown>)?.operator as string | undefined;

  const body = await request.json();
  const parsed = parseBody(updateOperatorSchema, body);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error }, { status: 400 });
  }
  const { id, ...fields } = parsed.data;

  // Verify ownership for operator role
  if (role === 'operator') {
    const [target] = await db.select().from(operators).where(eq(operators.id, id)).limit(1);
    if (!target || target.name !== userOperator) {
      return NextResponse.json({ error: 'Non autorisé: hors périmètre' }, { status: 403 });
    }
  }

  // Build update object with only allowed fields
  const updateData: Record<string, unknown> = { updatedAt: new Date() };
  const allowedFields = ['logo', 'description', 'website', 'contactEmail', 'contactPhone', 'address', 'color'];
  // Admin can also rename
  if (role === 'admin') allowedFields.push('name');

  for (const key of allowedFields) {
    if (key in fields) {
      updateData[key] = fields[key];
    }
  }

  await db.update(operators).set(updateData).where(eq(operators.id, id));

  const [updated] = await db.select().from(operators).where(eq(operators.id, id)).limit(1);
  return NextResponse.json({ success: true, operator: updated });
}

export async function DELETE(request: NextRequest) {
  const session = await auth();
  if (!session || (session.user as Record<string, unknown>)?.role !== 'admin') {
    return NextResponse.json({ error: 'Non autorisé' }, { status: 401 });
  }

  const { searchParams } = new URL(request.url);
  const id = searchParams.get('id');
  if (!id) {
    return NextResponse.json({ error: 'ID manquant' }, { status: 400 });
  }

  const numId = parseInt(id);

  // Check if users are linked to this operator
  const [op] = await db.select().from(operators).where(eq(operators.id, numId)).limit(1);
  if (!op) {
    return NextResponse.json({ error: 'Opérateur introuvable' }, { status: 404 });
  }

  const linkedUsers = await db.select().from(users).where(eq(users.operator, op.name)).limit(1);
  if (linkedUsers.length > 0) {
    return NextResponse.json({ error: 'Impossible: des utilisateurs sont liés à cet opérateur' }, { status: 409 });
  }

  await db.delete(operators).where(eq(operators.id, numId));
  return NextResponse.json({ success: true });
}
