import { drizzle } from 'drizzle-orm/neon-http';

export async function testConnection() {
  const db = drizzle(process.env.DATABASE_URL);
  const result = await db.execute('select 1');
  return result;
}
