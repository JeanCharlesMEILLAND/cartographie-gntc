import { NextResponse } from 'next/server';
import { db } from '@cartographie/shared/db';
import { registrations } from '@cartographie/shared/db/schema';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { company, activity, contact, email, phone, website, description } = body;

    if (!company || !activity || !contact || !email) {
      return NextResponse.json({ error: 'Champs obligatoires manquants' }, { status: 400 });
    }

    const [row] = await db.insert(registrations).values({
      company,
      activity,
      contact,
      email,
      phone: phone || null,
      website: website || null,
      description: description || null,
    }).returning();

    return NextResponse.json({ success: true, id: row.id });
  } catch (err) {
    console.error('Registration error:', err);
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 });
  }
}
