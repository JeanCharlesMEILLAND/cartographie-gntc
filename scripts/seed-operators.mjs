import { neon } from '@neondatabase/serverless';
import bcrypt from 'bcryptjs';

const DATABASE_URL = process.env.DATABASE_URL;
if (!DATABASE_URL) {
  console.error('DATABASE_URL not set');
  process.exit(1);
}

const sql = neon(DATABASE_URL);

const operators = [
  { operator: 'Naviland Cargo', email: 'jean.martin@naviland.fr', name: 'Jean Martin' },
  { operator: 'Greenmodal', email: 'pierre.durand@greenmodal.fr', name: 'Pierre Durand' },
  { operator: 'VIIA', email: 'sophie.bernard@viia.com', name: 'Sophie Bernard' },
  { operator: 'Novatrans', email: 'marc.petit@novatrans.com', name: 'Marc Petit' },
  { operator: 'T3M', email: 'laurent.moreau@t3m.fr', name: 'Laurent Moreau' },
  { operator: 'Combronde', email: 'anne.leroy@combronde.com', name: 'Anne Leroy' },
  { operator: 'HUPAC', email: 'thomas.muller@hupac.ch', name: 'Thomas Müller' },
  { operator: 'Metrocargo italia srl', email: 'marco.rossi@metrocargo.it', name: 'Marco Rossi' },
  { operator: 'Cinerites', email: 'paul.girard@cinerites.fr', name: 'Paul Girard' },
  { operator: 'Delta Rail', email: 'david.lambert@deltarail.fr', name: 'David Lambert' },
  { operator: 'Froidcombi', email: 'nicolas.roux@froidcombi.fr', name: 'Nicolas Roux' },
  { operator: 'Be Modal Intermodal Transport', email: 'erik.janssen@bemodal.be', name: 'Erik Janssen' },
  { operator: 'Ambrogio Intermodal', email: 'luca.bianchi@ambrogio.it', name: 'Luca Bianchi' },
  { operator: 'Brittany Ferries', email: 'philippe.leclerc@brittanyferries.fr', name: 'Philippe Leclerc' },
  { operator: 'Transports Vigneron', email: 'jerome.vigneron@vigneron.fr', name: 'Jérôme Vigneron' },
  { operator: 'DB Cargo France', email: 'stefan.weber@dbcargo.fr', name: 'Stefan Weber' },
  { operator: 'Cargo Beamer', email: 'claire.dubois@cargobeamer.com', name: 'Claire Dubois' },
];

const PASSWORD = 'Gntc2024!';

async function main() {
  const hash = await bcrypt.hash(PASSWORD, 10);
  console.log(`Inserting ${operators.length} operator accounts...`);

  let created = 0;
  let skipped = 0;

  for (const op of operators) {
    try {
      await sql`
        INSERT INTO users (email, password_hash, name, role, operator)
        VALUES (${op.email}, ${hash}, ${op.name}, 'operator', ${op.operator})
        ON CONFLICT (email) DO NOTHING
      `;
      const result = await sql`SELECT id FROM users WHERE email = ${op.email}`;
      if (result.length > 0) {
        console.log(`  ✓ ${op.operator} → ${op.email} (id: ${result[0].id})`);
        created++;
      }
    } catch (err) {
      console.error(`  ✗ ${op.operator}: ${err.message}`);
      skipped++;
    }
  }

  console.log(`\nDone: ${created} accounts ready, ${skipped} errors`);
}

main().catch(console.error);
