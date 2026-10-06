import "dotenv/config";
import test from "node:test";
import assert from "node:assert/strict";
import { randomUUID } from "node:crypto";
import pg from "pg";
import express from "express";
import { pool } from "../src/db.js";
import { getRegistros } from "../src/controllers/registro.controller.js";
import { getScouts } from "../src/controllers/scout.controller.js";
import { listPadron } from "../src/controllers/padron.controller.js";
import { reportPreview } from "../src/controllers/admin.controller.js";

test(
  "paginación SQL: filtros, permisos, páginas y totales de reportes",
  { skip: process.env.PAGINATION_INTEGRATION !== "1" },
  async (t) => {
    const schema = `pagination_test_${randomUUID().replaceAll("-", "")}`;
    await pool.query(`CREATE SCHEMA "${schema}"`);
    const isolated = new pg.Pool({
      ...pool.options,
      password: pool.options.password,
      options: `-c search_path=${schema}`,
    });
    let server;
    try {
      await isolated.query(`
      CREATE TABLE dirigente(ci text PRIMARY KEY,nombre text,apellido text,email text,unidad text,admin_registrado boolean,is_admin boolean,fecha_deposito date);
      CREATE TABLE scouts(ci text PRIMARY KEY,nombre text,apellido text,dirigente_ci text,create_at timestamp);
      CREATE TABLE registros(id int PRIMARY KEY,scout_ci text,dirigente_ci text,unidad text,fecha_deposito date);
      CREATE TABLE padron(ci text PRIMARY KEY,primer_nombre text,primer_apellido text);
      INSERT INTO dirigente VALUES('d1','Dirigente','Uno','','Jacala',true,false,'2026-09-30');
      INSERT INTO scouts VALUES('s1','Scout','Uno','d1','2026-08-01'),('s2','Scout','Dos','d2','2026-09-30 23:59:59'),('s3','Scout','Tres','d1','2026-08-01');
      INSERT INTO registros VALUES(1,'s1','d1','Jacala','2026-08-01'),(2,'s1','d1','Jacala','2026-09-30'),(3,'s2','d2','Hathi','2026-07-31'),(4,'s3','d1','Jacala','2026-10-01');
      INSERT INTO padron VALUES('1','Pablo','Uno'),('2','Ana','Dos');
    `);
      t.mock.method(pool, "query", isolated.query.bind(isolated));
      const app = express();
      app.use((req, res, next) => {
        req.isAdmin = req.headers["x-admin"] === "true";
        req.userCI = "d1";
        next();
      });
      app.get("/registros", getRegistros);
      app.get("/scouts", getScouts);
      app.get("/padron", listPadron);
      app.get("/preview", reportPreview);
      app.use((err, req, res, next) =>
        res.status(err.status || 500).json({ message: err.message }),
      );
      server = app.listen(0, "127.0.0.1");
      await new Promise((r) => server.once("listening", r));
      const read = async (path, admin = true) => {
        const response = await fetch(
          `http://127.0.0.1:${server.address().port}${path}`,
          { headers: { "x-admin": String(admin) } },
        );
        return { status: response.status, data: await response.json() };
      };
      const range = "from=2026-08-01&to=2026-09-30&page=1&pageSize=1";
      const records = await read(`/registros?${range}&unidad=Jacala`);
      assert.equal(records.status, 200);
      assert.equal(records.data.pagination.total, 2);
      assert.equal(records.data.items[0].id, 2);
      const owned = await read("/registros?page=1&pageSize=1", false);
      assert.equal(owned.data.pagination.total, 3);
      assert.equal(
        (await read("/scouts?page=1&pageSize=1", false)).data.pagination.total,
        2,
      );
      assert.equal((await read("/padron?page=1", false)).status, 403);
      assert.equal(
        (await read("/padron?search=Ana&page=1")).data.pagination.total,
        1,
      );
      const preview = await read(`/preview?${range}&section=scouts`);
      assert.equal(preview.status, 200);
      assert.equal(preview.data.pagination.total, 2);
      assert.equal(preview.data.items[0].ci, "s2");
      const leaders = await read(`/preview?${range}&section=dirigentes`);
      assert.equal(leaders.status, 200);
      assert.equal(leaders.data.items[0].registros_count, 2);
      assert.equal(
        (await read(`/preview?${range}&section=registros`)).data.pagination
          .total,
        2,
      );
      assert.equal(
        (await read("/preview?from=2026-10-01&to=2026-08-01")).status,
        400,
      );
      assert.equal((await read("/registros?page=0")).status, 400);
      assert.equal(
        (await read("/registros?page=999&pageSize=2")).data.pagination.page,
        2,
      );
    } finally {
      if (server) await new Promise((r) => server.close(r));
      t.mock.restoreAll();
      await isolated.end();
      if (!/^pagination_test_[a-f0-9]{32}$/.test(schema))
        throw new Error("Esquema inválido");
      await pool.query(`DROP SCHEMA "${schema}" CASCADE`);
      await pool.end();
    }
  },
);
