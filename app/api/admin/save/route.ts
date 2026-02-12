import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import fs from 'fs';
import path from 'path';

export async function POST(request: NextRequest) {
  const session = await auth();
  if (!session) {
    return NextResponse.json({ error: 'Non autorisé' }, { status: 401 });
  }

  const role = (session.user as Record<string, unknown>)?.role as string;
  const userOperator = (session.user as Record<string, unknown>)?.operator as string | undefined;

  try {
    const data = await request.json();
    const dataDir = path.join(process.cwd(), 'data');
    const filePath = path.join(dataDir, 'current.json');

    // Operator scope validation: only allow modifying own services
    if (role === 'operator' && userOperator) {
      if (fs.existsSync(filePath)) {
        const oldData = JSON.parse(fs.readFileSync(filePath, 'utf-8'));

        // Check platforms unchanged
        if (JSON.stringify(oldData.platforms) !== JSON.stringify(data.platforms)) {
          return NextResponse.json({ error: 'Non autorisé: modification des plateformes interdite' }, { status: 403 });
        }

        // Check other operators' services unchanged
        const otherServicesOld = oldData.services.filter(
          (s: { operator: string }) => s.operator !== userOperator
        );
        const otherServicesNew = data.services.filter(
          (s: { operator: string }) => s.operator !== userOperator
        );
        if (JSON.stringify(otherServicesOld) !== JSON.stringify(otherServicesNew)) {
          return NextResponse.json({ error: 'Non autorisé: modification hors périmètre' }, { status: 403 });
        }
      }
    }

    if (!fs.existsSync(dataDir)) {
      fs.mkdirSync(dataDir, { recursive: true });
    }
    fs.writeFileSync(filePath, JSON.stringify(data, null, 2), 'utf-8');
    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json({ error: 'Erreur sauvegarde' }, { status: 500 });
  }
}
