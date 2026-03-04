import 'dotenv/config';
import { pool } from './src/db.js';

(async () => {
  try {
    await pool.query('ALTER TABLE registros DROP CONSTRAINT registros_scout_ci_fkey');
    await pool.query('ALTER TABLE registros ALTER COLUMN scout_ci TYPE VARCHAR(20)');
    await pool.query('ALTER TABLE registros ADD CONSTRAINT registros_scout_ci_fkey FOREIGN KEY (scout_ci) REFERENCES scouts(ci) ON DELETE CASCADE');
    console.log('Migración aplicada');
  } catch (e) {
    console.error(e);
  } finally {
    process.exit(0);
  }
})();