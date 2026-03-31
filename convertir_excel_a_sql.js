/**
 * Script: convertir_excel_a_sql.js
 * Lee Registros 2025.xlsx y genera SQL INSERT para la tabla padrón
 *
 * Uso: node convertir_excel_a_sql.js
 */

import ExcelJS from "exceljs";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

function parseDate(val) {
  if (!val) return "NULL";

  let dateStr = "";

  // Si es Date object de ExcelJS
  if (val instanceof Date) {
    dateStr = val.toISOString().slice(0, 10);
  } else if (typeof val === "string") {
    dateStr = val.trim().slice(0, 10);
  } else {
    return "NULL";
  }

  // Validar formato YYYY-MM-DD
  if (!/^\d{4}-\d{2}-\d{2}$/.test(dateStr)) {
    return "NULL"; // Fecha inválida
  }

  // Validar que sea fecha válida
  try {
    const date = new Date(dateStr);
    if (isNaN(date.getTime())) {
      return "NULL";
    }
  } catch (e) {
    return "NULL";
  }

  return `'${dateStr}'`;
}

function parseCi(val) {
  if (!val) return null;
  return String(val).trim();
}

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

function escapeSql(val) {
  if (!val || val === null) return "NULL";
  let str = String(val).trim();
  if (str === "") return "NULL";

  // Normalizar Unicode y limpiar caracteres problemáticos
  try {
    str = str
      .normalize("NFKD") // Descomposición compatible
      .split("")
      .map((char) => {
        const code = char.charCodeAt(0);
        // Permitir: ASCII imprimible (32-126), espacio (32), latinos extendidos
        if ((code >= 32 && code <= 126) || (code >= 192 && code <= 255)) {
          return char;
        }
        // Remover caracteres de control y especiales
        return "";
      })
      .join("")
      .trim();
  } catch (e) {
    str = str.replace(/[^\x20-\x7E\xC0-\xFF]/g, "").trim();
  }

  if (str === "") return "NULL";
  return `'${str.replace(/'/g, "''")}'`;
}

async function convertir() {
  const wbPath = path.join(__dirname, "Registros 2025.xlsx");

  if (!fs.existsSync(wbPath)) {
    console.error("❌ Archivo no encontrado:", wbPath);
    process.exit(1);
  }

  const wb = new ExcelJS.Workbook();
  await wb.xlsx.readFile(wbPath);

  const registros = [];

  // ── LEER HOJA: EXPLORADORES (scouts) ──────────────────────────────────────
  const sheetScouts = wb.getWorksheet("EXPLORADORES");
  console.log("📖 Leyendo hoja EXPLORADORES...");

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

  console.log(`✅ Se leyeron ${registros.length} registros`);

  // ── GENERAR SQL INSERT ─────────────────────────────────────────────────────
  let sqlContent = `# 📋 SQL INSERT PARA TABLA PADRÓN (${registros.length} REGISTROS)

**Copia y pega en Railway Console:**

\`\`\`sql
-- ============================================
-- INSERTAR TODOS LOS REGISTROS DEL PADRÓN
-- ============================================

INSERT INTO padron (ci, primer_nombre, segundo_nombre, primer_apellido, segundo_apellido, fecha_nacimiento, sexo, unidad, colegio, nivel_formacion, contacto_nombre, contacto_parentesco, contacto_celular) 
VALUES
`;

  registros.forEach((reg, idx) => {
    const linha = `(
  ${escapeSql(reg.ci)},
  ${escapeSql(reg.primer_nombre)},
  ${escapeSql(reg.segundo_nombre)},
  ${escapeSql(reg.primer_apellido)},
  ${escapeSql(reg.segundo_apellido)},
  ${reg.fecha_nacimiento},
  ${escapeSql(reg.sexo)},
  ${escapeSql(reg.unidad)},
  ${escapeSql(reg.colegio)},
  ${escapeSql(reg.nivel_formacion)},
  ${escapeSql(reg.contacto_nombre)},
  ${escapeSql(reg.contacto_parentesco)},
  ${escapeSql(reg.contacto_celular)}
)${idx < registros.length - 1 ? "," : ""}`;

    sqlContent += linha + "\n";
  });

  sqlContent += `ON CONFLICT (ci) DO NOTHING;

-- Verificar inserciones
SELECT COUNT(*) as "Total Registros en Padrón" FROM padron;

-- Ver primeros 10 registros
SELECT ci, primer_nombre, primer_apellido, fecha_nacimiento, sexo FROM padron ORDER BY ci LIMIT 10;
\`\`\`

---

## ✅ PASOS:

1. **Copia TODO el SQL anterior**
2. **Abre Railway Console**: PostgreSQL → Connect → Console
3. **Pega el SQL**
4. **Presiona Enter**
5. **Espera 1-2 minutos** (son ${registros.length} registros)
6. **Verifica al final** con el SELECT

---

## 📊 RESUMEN:

- **Total Registros**: ${registros.length}
- **Archivo**: Registros 2025.xlsx
- **Tabla**: padron
- **Fecha Generación**: ${new Date().toLocaleString()}
`;

  // ── GUARDAR ARCHIVO ───────────────────────────────────────────────────────
  const outputPath = path.join(__dirname, "SQL_INSERT_PADRON_COMPLETO.md");
  fs.writeFileSync(outputPath, sqlContent);
  console.log(`\n✅ Archivo generado: ${outputPath}`);
  console.log(`📦 Tamaño: ${(sqlContent.length / 1024).toFixed(2)} KB`);
  console.log(`\n🎯 Ahora copia y pega el SQL en Railway Console`);
}

convertir().catch((err) => {
  console.error("❌ Error:", err.message);
  process.exit(1);
});
