import "dotenv/config";
import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs/promises";
import { randomUUID } from "node:crypto";
import pg from "pg";
import express from "express";
import cookieParser from "cookie-parser";
import jwt from "jsonwebtoken";
import config from "../src/config.js";
import { pool } from "../src/db.js";
import routes from "../src/routes/kral.routes.js";

test(
  "Kral: autorización, aprobación atómica, concurrencia, rechazo y devolución",
  { skip: process.env.KRAL_INTEGRATION !== "1" },
  async (t) => {
    const schema = `kral_test_${randomUUID().replaceAll("-", "")}`;
    await pool.query(`CREATE SCHEMA "${schema}"`);
    const isolated = new pg.Pool({
      ...pool.options,
      password: pool.options.password,
      options: `-c search_path=${schema}`,
    });
    let server;
    try {
      await isolated.query(
        await fs.readFile(
          new URL("../database/migration_create_kral.sql", import.meta.url),
          "utf8",
        ),
      );
      t.mock.method(pool, "query", isolated.query.bind(isolated));
      t.mock.method(pool, "connect", isolated.connect.bind(isolated));
      const app = express();
      app.use(express.json(), cookieParser());
      app.use("/kral", routes);
      app.use((e, req, res, next) =>
        res.status(e.status || 500).json({ message: e.message }),
      );
      server = app.listen(0, "127.0.0.1");
      await new Promise((resolve) => server.once("listening", resolve));
      const base = `http://127.0.0.1:${server.address().port}/kral`;
      const admin = jwt.sign(
        { ci: "test-admin", unidad: "Grupo", is_admin: true },
        config.JWT_SECRET,
      );
      const member = jwt.sign(
        { ci: "test-member", unidad: "Jacala", is_admin: false },
        config.JWT_SECRET,
      );
      const other = jwt.sign(
        { ci: "test-other", unidad: "Hathi", is_admin: false },
        config.JWT_SECRET,
      );
      async function request(
        path,
        body,
        token = admin,
        method = body ? "POST" : "GET",
      ) {
        const response = await fetch(base + path, {
          method,
          headers: {
            "Content-Type": "application/json",
            ...(token ? { Authorization: `Bearer ${token}` } : {}),
          },
          body: body ? JSON.stringify(body) : undefined,
        });
        return { status: response.status, data: await response.json() };
      }
      assert.equal((await request("/inventory", null, null)).status, 401);
      assert.equal(
        (await request("/locations", { name: "Prohibida" }, member)).status,
        403,
      );
      const l = await request("/locations", {
        name: "Ubicación de prueba",
        external: true,
      });
      assert.equal(l.status, 201);
      const material = {
        location_id: l.data.id,
        name: "Cuerda",
        unit: "GRUPO",
        total: 10,
      };
      const m = await request("/materials", material);
      assert.equal(m.status, 201);
      const m2 = await request("/materials", {
        ...material,
        name: "Carpa",
        total: 1,
      });
      assert.equal(m2.status, 201);
      const page1 = await request('/materials?page=1&pageSize=1');
      const page2 = await request('/materials?page=2&pageSize=1');
      assert.equal(page1.data.pagination.total,2);
      assert.equal(page1.data.items[0].name,'Carpa');
      assert.equal(page2.data.items[0].name,'Cuerda');
      assert.equal((await request('/materials?search=Cuerda&pageSize=1')).data.pagination.total,1);
      assert.equal((await request('/materials?pageSize=101')).status,400);
      assert.equal((await request('/in-use?page=1')).data.pagination.total,0);
      const payload = {
        unit: "Unidad falsificada",
        place: "Campamento",
        purpose: "Actividad",
        use_at: "2026-10-01T10:00:00-04:00",
        return_at: "2026-10-02T18:00:00-04:00",
        items: [{ material_id: m.data.id, quantity: 6 }],
      };
      const a = await request("/requests", payload, member);
      const b = await request("/requests", payload, member);
      assert.equal(a.status, 201);
      assert.equal(a.data.unit, "Jacala");
      assert.equal(
        (await request(`/requests/${a.data.id}/approve`, {}, member)).status,
        403,
      );
      assert.equal((await request("/requests", null, other)).data.length, 0);
      assert.equal((await request('/requests?page=1&pageSize=1',null,other)).data.pagination.total,0);
      assert.equal((await request('/requests?page=2&pageSize=1',null,member)).data.pagination.total,2);
      const invalid = await request(
        "/requests",
        { ...payload, return_at: "2026-09-01T00:00:00Z" },
        member,
      );
      assert.equal(invalid.status, 400);
      const duplicate = await request(
        "/requests",
        { ...payload, items: [...payload.items, ...payload.items] },
        member,
      );
      assert.equal(duplicate.status, 400);
      const approvals = await Promise.all(
        [a, b].map((r) => request(`/requests/${r.data.id}/approve`, {})),
      );
      assert.deepEqual(approvals.map((r) => r.status).sort(), [200, 409]);
      const approved = [a, b][approvals.findIndex((r) => r.status === 200)].data
        .id;
      const pending = [a, b][approvals.findIndex((r) => r.status === 409)].data
        .id;
      let stock = (await request("/inventory")).data;
      assert.equal(Number(stock.materials[0].available), 1);
      assert.equal(
        Number(stock.materials.find((i) => i.id === m.data.id).available),
        4,
      );
      assert.equal(stock.inUse.length, 1);
      assert.equal(
        (
          await request(
            `/materials/${m.data.id}`,
            { ...material, total: 5 },
            admin,
            "PUT",
          )
        ).status,
        409,
      );
      assert.equal(
        (await request(`/requests/${approved}/approve`, {})).status,
        409,
      );
      assert.equal(
        (await request(`/requests/${pending}/reject`, { note: "Sin stock" }))
          .status,
        200,
      );
      const returns = await Promise.all([
        request(`/requests/${approved}/return`, {}),
        request(`/requests/${approved}/return`, {}),
      ]);
      assert.deepEqual(returns.map((r) => r.status).sort(), [200, 409]);
      stock = (await request("/inventory")).data;
      assert.equal(
        Number(stock.materials.find((i) => i.id === m.data.id).available),
        10,
      );
      assert.equal(stock.inUse.length, 0);
      // Si falla el segundo material, el descuento del primero se revierte.
      const multi = await request(
        "/requests",
        {
          ...payload,
          items: [
            { material_id: m.data.id, quantity: 2 },
            { material_id: m2.data.id, quantity: 1 },
          ],
        },
        member,
      );
      await request(
        `/materials/${m2.data.id}`,
        { ...material, name: "Carpa", total: 0 },
        admin,
        "PUT",
      );
      assert.equal(
        (await request(`/requests/${multi.data.id}/approve`, {})).status,
        409,
      );
      stock = (await request("/inventory")).data;
      assert.equal(
        Number(stock.materials.find((i) => i.id === m.data.id).available),
        10,
      );
    } catch (error) {
      console.error(error);
      throw error;
    } finally {
      if (server) await new Promise((resolve) => server.close(resolve));
      t.mock.restoreAll();
      await isolated.end();
      // Únicamente el esquema aislado creado por esta prueba.
      if (!/^kral_test_[a-f0-9]{32}$/.test(schema))
        throw new Error("Esquema de prueba inválido");
      await pool.query(`DROP SCHEMA "${schema}" CASCADE`);
      await pool.end();
    }
  },
);
