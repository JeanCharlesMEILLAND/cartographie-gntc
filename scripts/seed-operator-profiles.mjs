import { neon } from '@neondatabase/serverless';

const DATABASE_URL = process.env.DATABASE_URL;
if (!DATABASE_URL) { console.error('DATABASE_URL not set'); process.exit(1); }
const sql = neon(DATABASE_URL);

const operators = [
  { name: 'Naviland Cargo', website: 'www.naviland-cargo.com', phone: '+33 1 41 05 33 01', address: 'Levallois-Perret (siège)' },
  { name: 'Greenmodal', website: 'novatrans-greenmodal.eu', email: 'contact@novatrans-greenmodal.eu', phone: '+33 4 75 00 47 00', address: '42 Rue de Ruffi, 13003 Marseille' },
  { name: 'VIIA', website: 'www.viia.com', email: 'info@viia.com', phone: '+33 4 68 81 56 74' },
  { name: 'Novatrans', website: 'www.novatrans.eu', email: 'contact.commercial@novatrans.eu', phone: '+33 1 85 34 49 11', address: '10 rue Vandrezanne, CS 91397, 75634 Paris Cedex 13' },
  { name: 'T3M', website: 'www.t3m.fr', email: 'sales@t3m.fr', phone: '+33 4 67 27 18 51', address: '11 Rue Maryse Bastié, ZI de la Lauze, 34430 Saint Jean de Védas' },
  { name: 'Combronde', website: 'www.groupecombronde.com', email: 'j.baudy@groupecombronde.com', phone: '+33 4 73 23 22 92', address: 'Groupe Combronde' },
  { name: 'HUPAC', website: 'www.hupac.com', email: 'line1@hupac.com', phone: '+41 58 855 81 10' },
  { name: 'Metrocargo italia srl', website: 'www.mercitalialogistics.com', phone: '+39 010 6520502' },
  { name: 'Cinerites', website: 'www.cinerites.fr', email: 'contact@cinerites.fr', phone: '+33 2 43 75 57 63' },
  { name: 'Delta Rail', website: 'www.deltarail.fr', email: 'contact@deltarail.fr', phone: '+33 4 42 70 71 80' },
  { name: 'Froidcombi' },
  { name: 'Be Modal Intermodal Transport', website: 'be-modal-solutions.fr' },
  { name: 'Ambrogio Intermodal', website: 'www.ambrogiointermodal.com', email: 'commercial.mg@ambrogiointermodal.com', phone: '+33 5 59 42 63 00', address: "14 avenue d'Alegera, BP 10036, 64990 Mouguerre" },
  { name: 'Brittany Ferries', website: 'www.brittany-ferries.fr' },
  { name: 'Transports Vigneron', website: 'www.transports-vigneron.fr', email: 'commercial@transports-vigneron.fr', phone: '+33 6 12 50 25 02' },
  { name: 'DB Cargo France', website: 'www.dbcargo.com/fr' },
  { name: 'Cargo Beamer', website: 'www.cargobeamer.com', email: 'sales@cargobeamer.com' },
];

async function main() {
  console.log(`Inserting ${operators.length} operator profiles...`);
  let created = 0;
  for (const op of operators) {
    try {
      await sql`
        INSERT INTO operators (name, website, contact_email, contact_phone, address)
        VALUES (${op.name}, ${op.website || null}, ${op.email || null}, ${op.phone || null}, ${op.address || null})
        ON CONFLICT (name) DO NOTHING
      `;
      console.log(`  ✓ ${op.name}`);
      created++;
    } catch (err) {
      console.error(`  ✗ ${op.name}: ${err.message}`);
    }
  }
  console.log(`\nDone: ${created} operator profiles created`);
}

main().catch(console.error);
