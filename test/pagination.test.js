import test from "node:test";
import assert from "node:assert/strict";
import { pageOptions, queryPage } from "../src/utils/pagination.js";

test("paginación: valida enteros y limita el tamaño a 100", () => {
  assert.deepEqual(pageOptions(), { page: 1, pageSize: 20 });
  assert.deepEqual(pageOptions({ page: "2", pageSize: "100" }), {
    page: 2,
    pageSize: 100,
  });
  for (const value of [
    "0",
    "-1",
    "1.5",
    "abc",
    "1e2",
    [],
    {},
    "9007199254740992",
  ]) {
    assert.throws(() => pageOptions({ page: value }), { status: 400 });
  }
  assert.throws(() => pageOptions({ pageSize: "101" }), { status: 400 });
});

test("paginación: cuenta con los mismos filtros y usa LIMIT/OFFSET parametrizados", async () => {
  const calls = [];
  const db = {
    query: async (sql, params) => {
      calls.push({ sql, params });
      return calls.length === 1
        ? { rows: [{ total: 23 }] }
        : { rows: [{ id: 21 }] };
    },
  };
  const result = await queryPage(
    db,
    "SELECT id FROM registros WHERE unidad=$1 ORDER BY id",
    ["Jacala"],
    { page: "2", pageSize: "20" },
  );
  assert.deepEqual(result, {
    items: [{ id: 21 }],
    pagination: { page: 2, pageSize: 20, total: 23, totalPages: 2 },
  });
  assert.deepEqual(calls[0].params, ["Jacala"]);
  assert.deepEqual(calls[1].params, ["Jacala", 20, 20]);
  assert.match(calls[1].sql, /LIMIT \$2 OFFSET \$3$/);
});

test("paginación: corrige páginas vacías tras eliminar y mantiene exportaciones completas", async () => {
  const db = {
    query: async (sql) => ({
      rows: sql.startsWith("SELECT COUNT") ? [{ total: 0 }] : [],
    }),
  };
  const result = await queryPage(
    db,
    "SELECT id FROM registros ORDER BY id",
    [],
    { page: "999" },
  );
  assert.deepEqual(result.pagination, {
    page: 1,
    pageSize: 20,
    total: 0,
    totalPages: 1,
  });
  assert.deepEqual(
    await queryPage(db, "SELECT id FROM registros ORDER BY id"),
    [],
  );
});
