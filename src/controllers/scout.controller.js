import { pool } from "../db.js";

// Seleccionar todos los scouts
export const getScouts = async (req, res, next) => {
  try {
    const result = await pool.query(
      "SELECT * FROM scouts WHERE dirigente_ci = $1",
      [req.userCI],
    );
    return res.json(result.rows);
  } catch (error) {
    next(error);
  }
};

// Seleccionar todos los scouts (Admin)
export const getScoutsAdmin = async (req, res, next) => {
  try {
    if (!req.isAdmin) {
      return res.status(403).json({ message: "No autorizado" });
    }

    const { from, to } = req.query;
    let query = "SELECT * FROM scouts";
    let params = [];
    let whereConditions = [];

    if (from) {
      whereConditions.push(`create_at >= $${params.length + 1}`);
      params.push(from);
    }

    if (to) {
      whereConditions.push(`create_at <= $${params.length + 1}`);
      params.push(to);
    }

    if (whereConditions.length > 0) {
      query += ` WHERE ${whereConditions.join(" AND ")}`;
    }

    query += ` ORDER BY create_at DESC NULLS LAST`;

    const result = await pool.query(query, params);
    return res.json(result.rows);
  } catch (error) {
    next(error);
  }
};

// Seleccionar Scout específico
export const getScout = async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT s.*, r.colegio, r.hora_deposito
       FROM scouts s
       LEFT JOIN registros r ON r.scout_ci = s.ci
       WHERE s.ci = $1
       LIMIT 1`,
      [req.params.ci],
    );
    if (result.rowCount == 0) {
      return res.status(404).json({ message: "No existe un Scout con ese CI" });
    }
    return res.json(result.rows[0]);
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

// Creación de scouts (inserta también un registro en `registros`)
export const createScout = async (req, res, next) => {
  const {
    ci,
    primer_nombre,
    segundo_nombre,
    primer_apellido,
    segundo_apellido,
    fecha_nacimiento,
    sexo,
    grupo,
    rama,
    unidad,
    etapa,
    colegio,
    curso,
    numero_deposito,
    monto,
    hora_deposito,
    es_beca,
    tipo_beca,
    contacto_emergencia_nombre_parentesco,
    contacto_emergencia_celular,
    envio,
  } = req.body;

  const client = await pool.connect();
  try {
    // Inicio transacción
    await client.query("BEGIN");

    // Determinar dirigente_ci: solo si el usuario existe en tabla dirigente
    let dirigenteCi = null;
    if (req.userCI && !String(req.userCI).startsWith('P')) {
      const dirCheck = await client.query('SELECT ci FROM dirigente WHERE ci = $1', [req.userCI]);
      if (dirCheck.rowCount > 0) {
        dirigenteCi = req.userCI;
      }
    }

    const nombre =
      `${primer_nombre || ""}${segundo_nombre ? " " + segundo_nombre : ""}`.trim();
    const apellido =
      `${primer_apellido || ""}${segundo_apellido ? " " + segundo_apellido : ""}`.trim();

    const insertScout = await client.query(
      `INSERT INTO scouts (
        ci, primer_nombre, segundo_nombre, primer_apellido, segundo_apellido,
        nombre, apellido, fecha_nacimiento, sexo, grupo, rama, unidad, etapa, curso,
        numero_deposito, monto, es_beca, tipo_beca, contacto_emergencia_nombre_parentesco,
        contacto_emergencia_celular, envio, dirigente_ci
      ) VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14,$15,$16,$17,$18,$19,$20,$21,$22) RETURNING *`,
      [
        ci,
        primer_nombre,
        segundo_nombre,
        primer_apellido,
        segundo_apellido,
        nombre,
        apellido,
        fecha_nacimiento,
        sexo,
        grupo || "PANDA",
        rama,
        unidad,
        etapa,
        curso,
        numero_deposito,
        monto,
        es_beca || false,
        tipo_beca,
        contacto_emergencia_nombre_parentesco,
        contacto_emergencia_celular,
        envio,
        dirigenteCi,
      ],
    );

    const createdScout = insertScout.rows[0];

    // Preparar datos para registros: parsear contacto en nombre/parentesco
    let contacto_nombre = null;
    let contacto_parentesco = null;
    if (contacto_emergencia_nombre_parentesco) {
      const parts = contacto_emergencia_nombre_parentesco
        .split("-")
        .map((p) => p.trim());
      if (parts.length === 1) {
        contacto_nombre = parts[0];
      } else {
        contacto_nombre = parts[0];
        contacto_parentesco = parts[1];
      }
    }

    const fecha_deposito = new Date().toISOString().slice(0, 10);

    await client.query(
      `INSERT INTO registros (
        scout_ci, unidad, etapa_progresion, colegio, curso,
        numero_deposito, fecha_deposito, monto, envio,
        contacto_parentesco, contacto_nombre, contacto_celular, hora_deposito, dirigente_ci
      ) VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14)`,
      [
        ci,
        unidad || null,
        etapa || null,
        colegio || null,
        curso || null,
        numero_deposito || null,
        fecha_deposito,
        monto || null,
        envio || null,
        contacto_parentesco,
        contacto_nombre,
        contacto_emergencia_celular || null,
        hora_deposito || null,
        dirigenteCi,
      ],
    );

    await client.query("COMMIT");

    return res.json(createdScout);
  } catch (error) {
    await client.query("ROLLBACK");
    if (error.code == "23505") {
      return res.status(409).json({ message: "Ya existe un scout con ese CI" });
    }
    next(error);
  } finally {
    client.release();
  }
};

// Actualizando scout
export const updateScout = async (req, res, next) => {
  const ciViejo = req.params.ci;
  const {
    ci: ciNuevo,
    primer_nombre,
    segundo_nombre,
    primer_apellido,
    segundo_apellido,
    fecha_nacimiento,
    sexo,
    grupo,
    rama,
    unidad,
    etapa,
    colegio,
    curso,
    numero_deposito,
    monto,
    fecha_deposito,
    hora_deposito,
    es_beca,
    tipo_beca,
    contacto_emergencia_nombre_parentesco,
    contacto_emergencia_celular,
    envio,
  } = req.body;

  const nombre =
    `${primer_nombre || ""}${segundo_nombre ? " " + segundo_nombre : ""}`.trim();
  const apellido =
    `${primer_apellido || ""}${segundo_apellido ? " " + segundo_apellido : ""}`.trim();

  const client = await pool.connect();
  try {
    await client.query("BEGIN");

    // Construir dinámicamente la condición WHERE según si es admin
    let whereClause = "WHERE ci = $22";
    const params = [
      ciNuevo,
      primer_nombre,
      segundo_nombre,
      primer_apellido,
      segundo_apellido,
      nombre,
      apellido,
      fecha_nacimiento,
      sexo,
      grupo || "PANDA",
      rama,
      unidad,
      etapa,
      curso,
      numero_deposito,
      monto,
      es_beca || false,
      tipo_beca,
      contacto_emergencia_nombre_parentesco,
      contacto_emergencia_celular,
      envio,
      ciViejo,
    ];

    // Si no es admin, filtrar también por dirigente_ci
    if (!req.isAdmin) {
      whereClause = "WHERE ci = $22 AND dirigente_ci = $23";
      params.push(req.userCI);
    }

    const result = await client.query(
      `UPDATE scouts SET ci = $1, primer_nombre = $2, segundo_nombre = $3, primer_apellido = $4, segundo_apellido = $5, nombre = $6, apellido = $7, fecha_nacimiento = $8, sexo = $9, grupo = $10, rama = $11, unidad = $12, etapa = $13, curso = $14, numero_deposito = $15, monto = $16, es_beca = $17, tipo_beca = $18, contacto_emergencia_nombre_parentesco = $19, contacto_emergencia_celular = $20, envio = $21 ${whereClause} RETURNING *`,
      params,
    );

    if (result.rowCount == 0) {
      await client.query("ROLLBACK");
      return res.status(404).json({ message: "No existe un scout con ese CI" });
    }

    // Actualizar colegio, fecha_deposito y hora_deposito en la tabla registros correspondiente al scout
    await client.query(
      `UPDATE registros SET unidad = $1, etapa_progresion = $2, curso = $3, colegio = $4, fecha_deposito = $5, hora_deposito = $6, updated_at = CURRENT_TIMESTAMP WHERE scout_ci = $7`,
      [
        unidad || null,
        etapa || null,
        curso || null,
        colegio || null,
        fecha_deposito || null,
        hora_deposito || null,
        ciViejo,
      ],
    );

    await client.query("COMMIT");
    return res.json(result.rows[0]);
  } catch (error) {
    await client.query("ROLLBACK");
    next(error);
  } finally {
    client.release();
  }
};

// Eliminar Scout
export const deleteScout = async (req, res) => {
  const result = await pool.query("DELETE FROM scouts WHERE ci = $1", [
    req.params.ci,
  ]);
  if (result.rowCount == 0) {
    return res.status(404).json({ message: "No existe un scout con ese ci" });
  }
  return res.send(`Scout ${req.params.ci} eliminado`);
};
