import 'dotenv/config';
import { migrate, pool } from '../backend/db';
import { syncCatalog } from '../backend/sync';

try {
  await migrate();
  const result = await syncCatalog();
  console.log(result);
} catch (error) {
  console.error(error instanceof Error ? error.message : 'Catalog sync failed');
  process.exitCode = 1;
} finally {
  await pool.end();
}
