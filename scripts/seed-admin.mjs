import { neon } from '@neondatabase/serverless';
import bcrypt from 'bcryptjs';

const sql = neon(process.env.DATABASE_URL);
const hash = await bcrypt.hash('admin2026', 10);

await sql`INSERT INTO users (email, password_hash, name, role) VALUES (${'admin@gntc.fr'}, ${hash}, ${'Admin GNTC'}, ${'admin'})`;
console.log('Admin user created: admin@gntc.fr / admin2026');
