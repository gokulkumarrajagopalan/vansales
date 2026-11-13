import bcrypt from 'bcryptjs';
import { pool } from './pool.js';

async function main() {
  const hash = await bcrypt.hash('password123', 10);
  console.log('Setting password hash:', hash);
  const res = await pool.query(
    'UPDATE users SET password = $1 WHERE username = ANY($2::text[])',
    [hash, ['vansales1', 'admin']]
  );
  console.log('Successfully updated users count:', res.rowCount);
  await pool.end();
}

main().catch(console.error);
