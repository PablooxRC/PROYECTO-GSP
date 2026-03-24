import "dotenv/config";
import { pool } from "../src/db.js";

const r1 = await pool.query("DELETE FROM registros");
console.log("Registros eliminados:", r1.rowCount);
const r2 = await pool.query("DELETE FROM scouts");
console.log("Scouts eliminados:", r2.rowCount);
process.exit(0);
