import { z } from "zod";
import { queryPage } from "../utils/pagination.js";
import { pool } from "../db.js";
import { AppError } from "../utils/errorHandler.js";

const text = (max) => z.string().trim().min(1).max(max);
const quantity = z.number().finite().min(0).max(999999999).multipleOf(0.001);
const materialSchema = z.object({
  location_id: z.number().int().positive(),
  reference: z.string().trim().max(50).default(""),
  name: text(250),
  category: z.string().trim().max(160).default(""),
  unit: text(160),
  measure: text(80).default("unidad"),
  total: quantity,
  notes: z.string().max(4000).default(""),
});
const requestSchema = z
  .object({
    unit: text(160),
    place: text(250),
    purpose: text(4000),
    use_at: z.string().datetime({ offset: true }),
    return_at: z.string().datetime({ offset: true }),
    items: z
      .array(
        z.object({
          material_id: z.number().int().positive(),
          quantity: quantity.refine((n) => n > 0),
        }),
      )
      .min(1)
      .max(100),
  })
  .refine(
    (v) => Date.parse(v.return_at) >= Date.parse(v.use_at),
    "La devolución debe ser posterior al uso",
  )
  .refine(
    (v) => new Set(v.items.map((i) => i.material_id)).size === v.items.length,
    "No repitas materiales",
  );
function parse(schema, value) {
  const result = schema.safeParse(value);
  if (!result.success)
    throw new AppError(
      result.error.issues.map((i) => i.message).join(". "),
      400,
    );
  return result.data;
}
function id(value) {
  return parse(z.coerce.number().int().positive(), value);
}
async function transaction(work) {
  const client = await pool.connect();
  try {
    await client.query("BEGIN");
    const value = await work(client);
    await client.query("COMMIT");
    return value;
  } catch (error) {
    await client.query("ROLLBACK");
    throw error;
  } finally {
    client.release();
  }
}
export async function inventory(req, res) {
  const [locations, materials, inUse] = await Promise.all([
    pool.query("SELECT * FROM kral_locations ORDER BY external, name"),
    pool.query(`SELECT m.*, l.name AS location, l.external, m.total-m.available AS in_use
      FROM kral_materials m JOIN kral_locations l ON l.id=m.location_id ORDER BY l.name,m.name,m.id`),
    pool.query(`SELECT i.material_id, i.quantity, r.id AS request_id, r.unit, r.place, r.use_at, r.return_at
      FROM kral_request_items i JOIN kral_requests r ON r.id=i.request_id WHERE r.status='approved' ORDER BY r.return_at`),
  ]);
  res.json({
    locations: locations.rows,
    materials: materials.rows,
    inUse: inUse.rows,
  });
}
export async function listLocations(req, res) {
  res.json(
    (await pool.query("SELECT * FROM kral_locations ORDER BY external,name,id"))
      .rows,
  );
}
export async function listMaterials(req, res) {
  res.json(
    await queryPage(
      pool,
      `SELECT m.*,l.name AS location,l.external,m.total-m.available AS in_use
    FROM kral_materials m JOIN kral_locations l ON l.id=m.location_id
    WHERE ($1::int IS NULL OR m.location_id=$1)
      AND concat_ws(' ',m.name,m.category,m.unit) ILIKE $2
      AND (NOT $3::boolean OR m.available>0) ORDER BY l.name,m.name,m.id`,
      [
        req.query.location_id ? id(req.query.location_id) : null,
        `%${String(req.query.search || "")}%`,
        req.query.availableOnly === "true",
      ],
      { page: "1", ...req.query },
    ),
  );
}
export async function listInUse(req, res) {
  res.json(
    await queryPage(
      pool,
      `SELECT i.material_id,i.quantity,m.name,r.id AS request_id,r.unit,r.place,r.use_at,r.return_at
    FROM kral_request_items i JOIN kral_requests r ON r.id=i.request_id JOIN kral_materials m ON m.id=i.material_id
    WHERE r.status='approved' AND ($1::int IS NULL OR m.location_id=$1)
      AND concat_ws(' ',m.name,m.category,m.unit) ILIKE $2 ORDER BY r.return_at,r.id,m.id`,
      [
        req.query.location_id ? id(req.query.location_id) : null,
        `%${String(req.query.search || "")}%`,
      ],
      { page: "1", ...req.query },
    ),
  );
}
export async function createLocation(req, res) {
  const v = parse(
    z.object({
      name: text(160),
      external: z.boolean().default(false),
      description: z.string().max(4000).default(""),
    }),
    req.body,
  );
  const result = await pool.query(
    `INSERT INTO kral_locations(name,external,description) VALUES($1,$2,$3)
    ON CONFLICT(name) DO NOTHING RETURNING *`,
    [v.name, v.external, v.description],
  );
  if (!result.rowCount)
    throw new AppError("Ya existe una ubicación con ese nombre", 409);
  res.status(201).json(result.rows[0]);
}
export async function saveMaterial(req, res) {
  const v = parse(materialSchema, req.body);
  const result = await transaction(async (c) => {
    if (
      !(
        await c.query("SELECT id FROM kral_locations WHERE id=$1", [
          v.location_id,
        ])
      ).rowCount
    )
      throw new AppError("Ubicación no encontrada", 400);
    const args = [
      v.location_id,
      v.reference,
      v.name,
      v.category,
      v.unit,
      v.measure,
      v.total,
      v.notes,
    ];
    if (!req.params.id)
      return (
        await c.query(
          `INSERT INTO kral_materials(location_id,reference,name,category,unit,measure,total,available,notes)
      VALUES($1,$2,$3,$4,$5,$6,$7,$7,$8) RETURNING *`,
          args,
        )
      ).rows[0];
    const old = (
      await c.query("SELECT * FROM kral_materials WHERE id=$1 FOR UPDATE", [
        id(req.params.id),
      ])
    ).rows[0];
    if (!old) throw new AppError("Material no encontrado", 404);
    if (v.total < Number(old.total) - Number(old.available))
      throw new AppError(
        "El total no puede ser menor que la cantidad en uso",
        409,
      );
    if (
      Number(old.total) > Number(old.available) &&
      (old.location_id !== v.location_id || old.measure !== v.measure)
    )
      throw new AppError(
        "Devuelve el material antes de cambiar su ubicación o presentación",
        409,
      );
    return (
      await c.query(
        `UPDATE kral_materials SET location_id=$1,reference=$2,name=$3,category=$4,unit=$5,measure=$6,
      available=$7-(total-available),total=$7,notes=$8 WHERE id=$9 RETURNING *`,
        [...args, old.id],
      )
    ).rows[0];
  });
  res.status(req.params.id ? 200 : 201).json(result);
}
export async function listRequests(req, res) {
  const result = await queryPage(
    pool,
    `SELECT r.*, COALESCE((SELECT json_agg(json_build_object(
    'material_id',m.id,'name',m.name,'location',l.name,'measure',m.measure,'quantity',i.quantity) ORDER BY m.id)
    FROM kral_request_items i JOIN kral_materials m ON m.id=i.material_id
    JOIN kral_locations l ON l.id=m.location_id WHERE i.request_id=r.id),'[]'::json) AS items
    FROM kral_requests r WHERE ($1::boolean OR r.requester_ci=$2) ORDER BY r.created_at DESC,r.id DESC`,
    [req.isAdmin, String(req.userCI)],
    req.query,
  );
  res.json(result);
}
export async function createRequest(req, res) {
  const v = parse(requestSchema, {
    ...req.body,
    unit: req.isAdmin ? req.body.unit : req.userUnidad,
  });
  const result = await transaction(async (c) => {
    for (const item of v.items) {
      const m = (
        await c.query("SELECT available FROM kral_materials WHERE id=$1", [
          item.material_id,
        ])
      ).rows[0];
      if (!m) throw new AppError("Material no encontrado", 400);
      if (Number(m.available) < item.quantity)
        throw new AppError("Cantidad solicitada superior a la disponible", 409);
    }
    const r = (
      await c.query(
        `INSERT INTO kral_requests(requester_ci,unit,place,purpose,use_at,return_at)
      VALUES($1,$2,$3,$4,$5,$6) RETURNING *`,
        [String(req.userCI), v.unit, v.place, v.purpose, v.use_at, v.return_at],
      )
    ).rows[0];
    for (const i of v.items)
      await c.query("INSERT INTO kral_request_items VALUES($1,$2,$3)", [
        r.id,
        i.material_id,
        i.quantity,
      ]);
    return r;
  });
  res.status(201).json(result);
}
export async function changeRequest(req, res) {
  const action = parse(
    z.enum(["approve", "reject", "return"]),
    req.params.action,
  );
  const note = parse(z.string().trim().max(4000), req.body.note ?? "");
  const result = await transaction(async (c) => {
    const r = (
      await c.query("SELECT * FROM kral_requests WHERE id=$1 FOR UPDATE", [
        id(req.params.id),
      ])
    ).rows[0];
    if (!r) throw new AppError("Solicitud no encontrada", 404);
    if (r.status !== (action === "return" ? "approved" : "pending"))
      throw new AppError(
        "La solicitud ya fue procesada o no permite esta acción",
        409,
      );
    if (action !== "reject") {
      // Orden estable de bloqueo: solicitudes simultáneas nunca sobreasignan stock.
      const items = (
        await c.query(
          "SELECT * FROM kral_request_items WHERE request_id=$1 ORDER BY material_id",
          [r.id],
        )
      ).rows;
      for (const i of items) {
        const updated =
          action === "approve"
            ? await c.query(
                "UPDATE kral_materials SET available=available-$1 WHERE id=$2 AND available >= $1 RETURNING id",
                [i.quantity, i.material_id],
              )
            : await c.query(
                "UPDATE kral_materials SET available=available+$1 WHERE id=$2 AND available+$1 <= total RETURNING id",
                [i.quantity, i.material_id],
              );
        if (!updated.rowCount)
          throw new AppError(
            "Stock insuficiente o inconsistente. Actualiza el inventario y revisa la solicitud.",
            409,
          );
      }
    }
    if (action === "return")
      return (
        await c.query(
          `UPDATE kral_requests SET status='returned',returned_by=$2,returned_at=now() WHERE id=$1 RETURNING *`,
          [r.id, String(req.userCI)],
        )
      ).rows[0];
    return (
      await c.query(
        `UPDATE kral_requests SET status=$2,decided_by=$3,decided_at=now(),decision_note=$4 WHERE id=$1 RETURNING *`,
        [
          r.id,
          action === "approve" ? "approved" : "rejected",
          String(req.userCI),
          note,
        ],
      )
    ).rows[0];
  });
  res.json(result);
}
