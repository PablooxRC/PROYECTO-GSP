import assert from "node:assert/strict";
import test from "node:test";

import {
  buildReportWorkbook,
  downloadReport,
} from "../src/controllers/admin.controller.js";
import { pool } from "../src/db.js";

test("buildReportWorkbook filtra scouts y dirigentes por el rango solicitado", async (t) => {
  const executedQueries = [];

  t.mock.method(pool, "query", async (query, params) => {
    executedQueries.push({ query, params });

    if (query.includes("FROM scouts")) {
      return {
        rows: [
          {
            ci: "SCOUT-1",
            primer_nombre: "Ana",
            primer_apellido: "Pérez",
            grupo: "Panda",
            unidad: "Jacala",
            etapa: "Saltador",
            colegio: "Colegio Uno",
            curso: "Primero",
          },
        ],
      };
    }

    return {
      rows: [
        {
          ci: "DIR-1",
          primer_nombre: "Luis",
          primer_apellido: "Rojas",
          grupo: "Panda",
          unidad: "Jacala",
          es_colaborador: false,
          is_admin: false,
        },
        {
          ci: "COL-1",
          primer_nombre: "María",
          primer_apellido: "Flores",
          grupo: "Panda",
          unidad: "Hathi",
          es_colaborador: true,
          is_admin: false,
        },
      ],
    };
  });

  const workbook = await buildReportWorkbook("2026-08-01", "2026-09-30");

  assert.equal(executedQueries.length, 2);
  assert.match(executedQueries[0].query, /r\.fecha_deposito >= \$1/);
  assert.match(executedQueries[0].query, /r\.fecha_deposito <= \$2/);
  assert.deepEqual(executedQueries[0].params, ["2026-08-01", "2026-09-30"]);

  assert.match(executedQueries[1].query, /fecha_deposito >= \$1/);
  assert.match(executedQueries[1].query, /fecha_deposito <= \$2/);
  assert.deepEqual(executedQueries[1].params, ["2026-08-01", "2026-09-30"]);

  assert.equal(workbook.getWorksheet("Lobatos").rowCount, 2);
  assert.equal(workbook.getWorksheet("Dirigentes").rowCount, 2);
  assert.equal(workbook.getWorksheet("Colaboradores").rowCount, 2);
});

test("downloadReport aplica los parámetros from y to al Excel descargado", async (t) => {
  const executedParams = [];

  t.mock.method(pool, "query", async (_query, params) => {
    executedParams.push(params);
    return { rows: [] };
  });

  const headers = new Map();
  let downloadedFile;
  const response = {
    setHeader(name, value) {
      headers.set(name, value);
    },
    send(value) {
      downloadedFile = value;
      return value;
    },
    status(code) {
      throw new Error(`Respuesta HTTP inesperada: ${code}`);
    },
  };

  await downloadReport(
    { query: { from: "2026-08-01", to: "2026-09-30" } },
    response,
  );

  assert.deepEqual(executedParams, [
    ["2026-08-01", "2026-09-30"],
    ["2026-08-01", "2026-09-30"],
  ]);
  assert.ok(downloadedFile.length > 0);
  assert.equal(
    headers.get("Content-Type"),
    "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
  );
});
