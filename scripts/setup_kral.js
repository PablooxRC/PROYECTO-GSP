import "dotenv/config";
import fs from "node:fs/promises";
import ExcelJS from "exceljs";
import { createHash } from "node:crypto";
import { pool } from "../src/db.js";

// npm run kral:setup -- "ruta/al/kral 2026.xlsx"
// Sin archivo solamente aplica la migración. La importación es idempotente.
try {
  await pool.query(
    await fs.readFile(
      new URL("../database/migration_create_kral.sql", import.meta.url),
      "utf8",
    ),
  );
  const filename = process.argv[2];
  if (filename) {
    const workbook = new ExcelJS.Workbook();
    await workbook.xlsx.readFile(filename);
    const client = await pool.connect();
    let imported = 0,
      unknown = 0;
    try {
      await client.query("BEGIN");
      for (const sheet of workbook.worksheets.filter((s) =>
        s.name.startsWith("INVENTARIO"),
      )) {
        const name = sheet.name.match(/\((.+)\)/)?.[1] || sheet.name;
        const location = (
          await client.query(
            `INSERT INTO kral_locations(name,external) VALUES($1,$2)
          ON CONFLICT(name) DO UPDATE SET name=EXCLUDED.name RETURNING id`,
            [name, !name.includes("SAN AGUSTIN")],
          )
        ).rows[0];
        for (let rowNumber = 3; rowNumber <= sheet.rowCount; rowNumber++) {
          const row = sheet.getRow(rowNumber);
          const name = row.getCell(2).text.trim();
          if (!name) continue;
          const raw = row.getCell(4).text.trim();
          const match = raw.match(/^(\d+(?:[.,]\d+)?)\s*(.*)$/);
          const amount = match ? Number(match[1].replace(",", ".")) : 0;
          if (!match) unknown++;
          const sourceKey = createHash("sha256")
            .update(`${sheet.name}:${rowNumber}:${name}`)
            .digest("hex");
          const result = await client.query(
            `INSERT INTO kral_materials(location_id,reference,name,category,unit,measure,total,available,notes,source_key)
            VALUES($1,$2,$3,$4,$5,$6,$7,$7,$8,$9) ON CONFLICT(source_key) DO NOTHING`,
            [
              location.id,
              row.getCell(1).text,
              name,
              row.getCell(3).text.trim(),
              row.getCell(5).text.trim().toUpperCase() || "GRUPO",
              match?.[2] || "unidad",
              amount,
              !match
                ? `Cantidad por verificar. Valor original: ${raw || "(vacío)"}`
                : "",
              sourceKey,
            ],
          );
          imported += result.rowCount;
        }
      }
      await client.query("COMMIT");
      console.log(JSON.stringify({ imported, quantitiesToReview: unknown }));
    } catch (error) {
      await client.query("ROLLBACK");
      throw error;
    } finally {
      client.release();
    }
  }
  console.log("Kral: base de datos preparada.");
} catch (error) {
  console.error(error.message);
  process.exitCode = 1;
} finally {
  await pool.end();
}
