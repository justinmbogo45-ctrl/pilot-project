import 'dotenv/config';
import { migrate, pool } from '../backend/db';
try {
  await migrate();
  console.log('PostgreSQL migrations applied.');
} catch (error) {
  console.error(error instanceof Error ? error.message : 'Database operation failed');
  process.exitCode = 1;
} finally {
  await pool.end();
}
