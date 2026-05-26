import "dotenv/config";
import { pool } from "../src/db.js";

const r = await pool.query(`
  SELECT table_name, column_name, data_type, character_maximum_length
  FROM information_schema.columns
  WHERE table_name IN ('scouts','registros','dirigente')
    AND column_name IN ('ci','scout_ci','dirigente_ci')
  ORDER BY table_name, column_name
`);
console.table(r.rows);
await pool.end();
