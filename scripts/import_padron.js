/**
 * Script: import_padron.js
 * Importa todos los scouts y dirigentes del Excel "Registros 2025.xlsx"
 * hacia la tabla `padron` de PostgreSQL.
 *
 * Uso: node scripts/import_padron.js
 */

import ExcelJS from "exceljs";
import pg from "pg";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

const pool = new pg.Pool({
  port: 5432,
  host: "localhost",
  user: "postgres",
  password: "12345678",
  database: "Scouts",
});

function parseDate(val) {
  if (!val) return null;
  if (val instanceof Date) return val.toISOString().slice(0, 10);
  if (typeof val === "string") {
    // formato ISO ya viene desde ExcelJS
    return val.slice(0, 10);
  }
  return null;
}

function parseCi(val) {
  if (!val) return null;
  return String(val).trim();
}

/**
 * "Alvaro - papá" → { nombre: "Alvaro", parentesco: "papá" }
 * "Mamá"          → { nombre: "Mamá",   parentesco: null }
 */
function parseContacto(raw) {
  if (!raw) return { nombre: null, parentesco: null };
  const str = String(raw).trim();
  const dashIdx = str.indexOf(" - ");
  if (dashIdx !== -1) {
    return {
      nombre: str.slice(0, dashIdx).trim(),
      parentesco: str.slice(dashIdx + 3).trim(),
    };
  }
  return { nombre: str, parentesco: null };
}

async function importar() {
  const wbPath = path.join(__dirname, "..", "Registros 2025.xlsx");
  const wb = new ExcelJS.Workbook();
  await wb.xlsx.readFile(wbPath);

  const registros = [];

  // ── HOJA: EXPLORADORES (scouts) ──────────────────────────────────────────
  // Fila 1: encabezado fusionado, Fila 2: nombres de columnas, Fila 3+: datos
  const sheetScouts = wb.getWorksheet("EXPLORADORES");
  if (sheetScouts) {
    sheetScouts.eachRow((row, rowNum) => {
      if (rowNum < 3) return; // saltar cabeceras
      const ci = parseCi(row.getCell(2).value);
      if (!ci || ci === "Cedula de Identidad") return;

      const contactoRaw = row.getCell(18).value;
      const { nombre: cNombre, parentesco: cParentesco } =
        parseContacto(contactoRaw);

      registros.push({
        ci,
        primer_nombre: String(row.getCell(3).value || "").trim() || null,
        segundo_nombre: String(row.getCell(4).value || "").trim() || null,
        primer_apellido: String(row.getCell(5).value || "").trim() || null,
        segundo_apellido: String(row.getCell(6).value || "").trim() || null,
        fecha_nacimiento: parseDate(row.getCell(7).value),
        sexo:
          String(row.getCell(8).value || "")
            .trim()
            .charAt(0)
            .toUpperCase() || null,
        unidad: String(row.getCell(10).value || "").trim() || null,
        colegio: String(row.getCell(12).value || "").trim() || null,
        nivel_formacion: null,
        contacto_nombre: cNombre,
        contacto_parentesco: cParentesco,
        contacto_celular: row.getCell(19).value
          ? String(row.getCell(19).value).trim()
          : null,
      });
    });
  }

  // ── HOJA: Dirigentes ─────────────────────────────────────────────────────
  // Fila 1: nombres de columnas, Fila 2+: datos
  const sheetDir = wb.getWorksheet("Dirigentes");
  if (sheetDir) {
    sheetDir.eachRow((row, rowNum) => {
      if (rowNum < 2) return;
      const ci = parseCi(row.getCell(2).value);
      if (!ci || ci === "Cedula de Identidad") return;

      registros.push({
        ci,
        primer_nombre: String(row.getCell(3).value || "").trim() || null,
        segundo_nombre: String(row.getCell(4).value || "").trim() || null,
        primer_apellido: String(row.getCell(5).value || "").trim() || null,
        segundo_apellido: String(row.getCell(6).value || "").trim() || null,
        fecha_nacimiento: parseDate(row.getCell(7).value),
        sexo:
          String(row.getCell(8).value || "")
            .trim()
            .charAt(0)
            .toUpperCase() || null,
        unidad: String(row.getCell(10).value || "").trim() || null,
        colegio: null,
        nivel_formacion: String(row.getCell(11).value || "").trim() || null,
        contacto_nombre: null,
        contacto_parentesco: null,
        contacto_celular: null,
      });
    });
  }

  console.log(`Total registros a importar: ${registros.length}`);

  const client = await pool.connect();
  let insertados = 0;
  let omitidos = 0;

  try {
    for (const r of registros) {
      try {
        await client.query(
          `INSERT INTO padron (
            ci, primer_nombre, segundo_nombre, primer_apellido, segundo_apellido,
            fecha_nacimiento, sexo, unidad, colegio, nivel_formacion,
            contacto_nombre, contacto_parentesco, contacto_celular
          ) VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13)
          ON CONFLICT (ci) DO UPDATE SET
            primer_nombre       = EXCLUDED.primer_nombre,
            segundo_nombre      = EXCLUDED.segundo_nombre,
            primer_apellido     = EXCLUDED.primer_apellido,
            segundo_apellido    = EXCLUDED.segundo_apellido,
            fecha_nacimiento    = EXCLUDED.fecha_nacimiento,
            sexo                = EXCLUDED.sexo,
            unidad              = EXCLUDED.unidad,
            colegio             = COALESCE(EXCLUDED.colegio, padron.colegio),
            nivel_formacion     = COALESCE(EXCLUDED.nivel_formacion, padron.nivel_formacion),
            contacto_nombre     = COALESCE(EXCLUDED.contacto_nombre, padron.contacto_nombre),
            contacto_parentesco = COALESCE(EXCLUDED.contacto_parentesco, padron.contacto_parentesco),
            contacto_celular    = COALESCE(EXCLUDED.contacto_celular, padron.contacto_celular),
            updated_at          = CURRENT_TIMESTAMP`,
          [
            r.ci,
            r.primer_nombre,
            r.segundo_nombre,
            r.primer_apellido,
            r.segundo_apellido,
            r.fecha_nacimiento,
            r.sexo,
            r.unidad,
            r.colegio,
            r.nivel_formacion,
            r.contacto_nombre,
            r.contacto_parentesco,
            r.contacto_celular,
          ],
        );
        insertados++;
      } catch (err) {
        console.warn(`  ⚠ CI ${r.ci}: ${err.message}`);
        omitidos++;
      }
    }
  } finally {
    client.release();
  }

  await pool.end();
  console.log(`✓ Importados/actualizados: ${insertados}`);
  if (omitidos) console.log(`⚠ Omitidos por error:      ${omitidos}`);
}

importar().catch((e) => {
  console.error(e);
  process.exit(1);
});
