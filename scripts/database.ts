import 'dotenv/config';
import { migrate, pool } from '../backend/db';
import { syncCatalog } from '../backend/sync';
try {
  await migrate();
  if (process.argv.includes('--sync')) console.log(await syncCatalog());
  else console.log('PostgreSQL migrations applied.');
} catch (error) {
  console.error(error instanceof Error ? error.message : 'Database operation failed');
  process.exitCode = 1;
} finally {
  await pool.end();
}
