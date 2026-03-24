import { pool } from "../db.js";
import {
  asyncHandler,
  AuthorizationError,
  NotFoundError,
  ConflictError,
} from "../utils/errorHandler.js";

// Buscar una persona por CI (para auto-fill) — acceso público autenticado
export const getPadronByCi = asyncHandler(async (req, res) => {
  const { ci } = req.params;
  const result = await pool.query("SELECT * FROM padron WHERE ci = $1", [ci]);
  if (result.rowCount === 0) throw new NotFoundError("Registro en padrón");
  return res.json(result.rows[0]);
});

// Listar todo el padrón (solo admin)
export const listPadron = asyncHandler(async (req, res) => {
  if (!req.isAdmin) throw new AuthorizationError();
  const result = await pool.query(
    "SELECT * FROM padron ORDER BY primer_apellido, primer_nombre",
  );
  return res.json(result.rows);
});

// Crear entrada en el padrón (solo admin)
export const createPadron = asyncHandler(async (req, res) => {
  if (!req.isAdmin) throw new AuthorizationError();
  const {
    ci,
    primer_nombre,
    segundo_nombre,
    primer_apellido,
    segundo_apellido,
    fecha_nacimiento,
    sexo,
    unidad,
    colegio,
    nivel_formacion,
    contacto_nombre,
    contacto_parentesco,
    contacto_celular,
  } = req.body;

  if (!ci) return res.status(400).json({ message: "CI es obligatorio" });

  try {
    const result = await pool.query(
      `INSERT INTO padron (ci, primer_nombre, segundo_nombre, primer_apellido, segundo_apellido,
        fecha_nacimiento, sexo, unidad, colegio, nivel_formacion,
        contacto_nombre, contacto_parentesco, contacto_celular)
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13) RETURNING *`,
      [
        ci,
        primer_nombre,
        segundo_nombre,
        primer_apellido,
        segundo_apellido,
        fecha_nacimiento || null,
        sexo || null,
        unidad || null,
        colegio || null,
        nivel_formacion || null,
        contacto_nombre || null,
        contacto_parentesco || null,
        contacto_celular || null,
      ],
    );
    return res.status(201).json(result.rows[0]);
  } catch (error) {
    if (error.code === "23505")
      throw new ConflictError("Ya existe un registro con ese CI");
    throw error;
  }
});

// Actualizar entrada del padrón (solo admin)
export const updatePadron = asyncHandler(async (req, res) => {
  if (!req.isAdmin) throw new AuthorizationError();
  const { ci } = req.params;
  const {
    primer_nombre,
    segundo_nombre,
    primer_apellido,
    segundo_apellido,
    fecha_nacimiento,
    sexo,
    unidad,
    colegio,
    nivel_formacion,
    contacto_nombre,
    contacto_parentesco,
    contacto_celular,
  } = req.body;

  const result = await pool.query(
    `UPDATE padron SET
      primer_nombre = $1, segundo_nombre = $2, primer_apellido = $3, segundo_apellido = $4,
      fecha_nacimiento = $5, sexo = $6, unidad = $7, colegio = $8, nivel_formacion = $9,
      contacto_nombre = $10, contacto_parentesco = $11, contacto_celular = $12,
      updated_at = CURRENT_TIMESTAMP
     WHERE ci = $13 RETURNING *`,
    [
      primer_nombre,
      segundo_nombre,
      primer_apellido,
      segundo_apellido,
      fecha_nacimiento || null,
      sexo || null,
      unidad || null,
      colegio || null,
      nivel_formacion || null,
      contacto_nombre || null,
      contacto_parentesco || null,
      contacto_celular || null,
      ci,
    ],
  );
  if (result.rowCount === 0) throw new NotFoundError("Registro en padrón");
  return res.json(result.rows[0]);
});

// Eliminar entrada del padrón (solo admin)
export const deletePadron = asyncHandler(async (req, res) => {
  if (!req.isAdmin) throw new AuthorizationError();
  const { ci } = req.params;
  const result = await pool.query(
    "DELETE FROM padron WHERE ci = $1 RETURNING *",
    [ci],
  );
  if (result.rowCount === 0) throw new NotFoundError("Registro en padrón");
  return res.json({ message: "Registro eliminado correctamente" });
});
