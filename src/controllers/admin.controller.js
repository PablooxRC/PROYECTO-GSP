import { pool } from "../db.js";
import bcrypt from "bcrypt";
import ExcelJS from "exceljs";
import fs from "fs";
import os from "os";
import path from "path";
import {
  asyncHandler,
  NotFoundError,
  ConflictError,
} from "../utils/errorHandler.js";

// Crear admin (solo accesible por admins existentes)
export const createAdmin = asyncHandler(async (req, res) => {
  const { nombre, apellido, email, unidad, password } = req.body;
  const hashedPassword = await bcrypt.hash(password, 10);
  try {
    const result = await pool.query(
      "INSERT INTO dirigente (nombre, apellido, email, unidad, password, is_admin, admin_registrado) VALUES ($1,$2,$3,$4,$5, true, true) RETURNING *",
      [nombre, apellido, email, unidad, hashedPassword],
    );
    return res.json(result.rows[0]);
  } catch (error) {
    if (error.code === "23505")
      throw new ConflictError("Ya existe un dirigente con esos datos");
    throw error;
  }
});

// Listar admins
export const listAdmins = asyncHandler(async (req, res) => {
  const result = await pool.query(
    "SELECT ci, nombre, apellido, email, unidad, is_admin FROM dirigente WHERE is_admin = TRUE",
  );
  return res.json(result.rows);
});

// Listar dirigentes (para admin panel)
export const listDirigentes = asyncHandler(async (req, res) => {
  const result = await pool.query(
    "SELECT * FROM dirigente WHERE admin_registrado = TRUE AND is_admin = FALSE ORDER BY create_at DESC",
  );
  return res.json(result.rows);
});

// Obtener un dirigente por CI
export const getDirigente = asyncHandler(async (req, res) => {
  const { ci } = req.params;
  const result = await pool.query(
    "SELECT * FROM dirigente WHERE ci = $1 AND admin_registrado = TRUE AND is_admin = FALSE",
    [ci],
  );
  if (result.rowCount === 0) throw new NotFoundError("Dirigente");
  return res.json(result.rows[0]);
});

// Obtener dirigentes para reporte
export const getDirigentesForReport = asyncHandler(async (req, res) => {
  const result = await pool.query(
    "SELECT * FROM dirigente WHERE admin_registrado = TRUE AND is_admin = FALSE ORDER BY nombre",
  );
  return res.json(result.rows);
});

// Crear dirigente (solo admins pueden crear dirigentes desde el panel)
export const createDirigente = async (req, res, next) => {
  const {
    ci,
    primer_nombre,
    segundo_nombre,
    primer_apellido,
    segundo_apellido,
    email,
    fecha_nacimiento,
    sexo,
    grupo,
    unidad,
    nivel_formacion,
    envio,
    password,
    numero_deposito,
    monto,
    fecha_deposito,
    hora_deposito,
    es_colaborador,
  } = req.body;

  // CI es obligatorio
  if (!ci) {
    return res.status(400).json({ message: "CI es obligatorio" });
  }

  if (!primer_nombre) {
    return res.status(400).json({ message: "Primer nombre es obligatorio" });
  }

  if (!primer_apellido) {
    return res.status(400).json({ message: "Primer apellido es obligatorio" });
  }

  try {
    const pwd = password || "12345678";
    const hashedPassword = await bcrypt.hash(pwd, 10);
    const gravatar = null;

    console.log("Creando dirigente con datos:", {
      ci,
      primer_nombre,
      primer_apellido,
      es_colaborador,
    });

    const result = await pool.query(
      `INSERT INTO dirigente (ci, nombre, apellido, email, primer_nombre, segundo_nombre, primer_apellido, segundo_apellido, fecha_nacimiento, sexo, grupo, unidad, nivel_formacion, envio, password, gravatar, numero_deposito, monto, fecha_deposito, hora_deposito, es_colaborador, admin_registrado) VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14,$15,$16,$17,$18,$19,$20,$21,$22) RETURNING *`,
      [
        String(ci),
        `${primer_nombre || ""} ${primer_apellido || ""}`.trim(),
        `${primer_apellido || ""}`.trim(),
        email || null,
        primer_nombre,
        segundo_nombre,
        primer_apellido,
        segundo_apellido,
        fecha_nacimiento || null,
        sexo || null,
        grupo || null,
        unidad || null,
        nivel_formacion || null,
        envio || null,
        hashedPassword,
        gravatar,
        numero_deposito || null,
        monto || null,
        fecha_deposito || null,
        hora_deposito || null,
        es_colaborador || false,
        true,
      ],
    );
    return res.json(result.rows[0]);
  } catch (error) {
    console.error(
      "Error en createDirigente:",
      error.message,
      error.code,
      error.detail,
    );
    if (error.code === "23505")
      return res
        .status(400)
        .json({ message: "Ya existe un dirigente con ese CI o email" });
    next(error);
  }
};

// Actualizar dirigente
export const updateDirigente = async (req, res, next) => {
  const { ci } = req.params;
  const {
    nombre,
    primer_nombre,
    segundo_nombre,
    apellido,
    primer_apellido,
    segundo_apellido,
    email,
    unidad,
    grupo,
    fecha_nacimiento,
    sexo,
    nivel_formacion,
    numero_deposito,
    monto,
    fecha_deposito,
    hora_deposito,
    envio,
    es_colaborador,
  } = req.body;

  try {
    const result = await pool.query(
      `UPDATE dirigente SET 
                nombre = COALESCE($1, nombre),
                primer_nombre = COALESCE($2, primer_nombre),
                segundo_nombre = COALESCE($3, segundo_nombre),
                apellido = COALESCE($4, apellido),
                primer_apellido = COALESCE($5, primer_apellido),
                segundo_apellido = COALESCE($6, segundo_apellido),
                email = COALESCE($7, email),
                unidad = COALESCE($8, unidad),
                grupo = COALESCE($9, grupo),
                fecha_nacimiento = COALESCE($10, fecha_nacimiento),
                sexo = COALESCE($11, sexo),
                nivel_formacion = COALESCE($12, nivel_formacion),
                numero_deposito = COALESCE($13, numero_deposito),
                monto = COALESCE($14, monto),
                fecha_deposito = COALESCE($15, fecha_deposito),
                hora_deposito = COALESCE($16, hora_deposito),
                envio = COALESCE($17, envio),
                es_colaborador = COALESCE($18, es_colaborador)
            WHERE ci = $19 RETURNING *`,
      [
        nombre || null,
        primer_nombre || null,
        segundo_nombre || null,
        apellido || null,
        primer_apellido || null,
        segundo_apellido || null,
        email || null,
        unidad || null,
        grupo || null,
        fecha_nacimiento || null,
        sexo || null,
        nivel_formacion || null,
        numero_deposito || null,
        monto || null,
        fecha_deposito || null,
        hora_deposito || null,
        envio || null,
        es_colaborador || null,
        ci,
      ],
    );

    if (result.rowCount === 0) {
      return res.status(404).json({ message: "Dirigente no encontrado" });
    }

    return res.json(result.rows[0]);
  } catch (error) {
    console.error("Error en updateDirigente:", error.message, error.detail);
    next(error);
  }
};

// Eliminar dirigente
export const deleteDirigente = async (req, res, next) => {
  const { ci } = req.params;

  try {
    const result = await pool.query(
      "DELETE FROM dirigente WHERE ci = $1 RETURNING *",
      [ci],
    );

    if (result.rowCount === 0) {
      return res.status(404).json({ message: "Dirigente no encontrado" });
    }

    return res.json({
      message: "Dirigente eliminado correctamente",
      data: result.rows[0],
    });
  } catch (error) {
    if (error.code === "23503") {
      return res.status(400).json({
        message:
          "No se puede eliminar: hay registros asociados a este dirigente",
      });
    }
    next(error);
  }
};

// ===============================
// HELPER: Construir workbook Excel de reporte
// ===============================
async function buildReportWorkbook() {
  const scoutsRes = await pool.query(`
    SELECT DISTINCT ON (s.ci) s.*, r.colegio, r.curso
    FROM scouts s
    LEFT JOIN registros r ON s.ci = r.scout_ci
    ORDER BY s.ci, r.id DESC
  `);

  const dirigentesRes = await pool.query(
    "SELECT * FROM dirigente WHERE admin_registrado = TRUE AND is_admin = FALSE",
  );

  const workbook = new ExcelJS.Workbook();
  const scoutsSheet = workbook.addWorksheet("Scouts");
  const dirigentesSheet = workbook.addWorksheet("Dirigentes");
  const colaboradoresSheet = workbook.addWorksheet("Colaboradores");

  const styleSheet = (sheet) => {
    sheet.views = [{ state: "frozen", ySplit: 1 }];
    const headerRow = sheet.getRow(1);
    headerRow.eachCell((cell) => {
      cell.fill = {
        type: "pattern",
        pattern: "solid",
        fgColor: { argb: "FFFFFF00" },
      };
      cell.font = { bold: true };
      cell.alignment = { vertical: "middle", horizontal: "center" };
    });
    sheet.eachRow((row) => {
      row.eachCell((cell) => {
        cell.border = {
          top: { style: "thin" },
          left: { style: "thin" },
          bottom: { style: "thin" },
          right: { style: "thin" },
        };
      });
    });
    if (sheet.columnCount > 0) {
      sheet.autoFilter = {
        from: { row: 1, column: 1 },
        to: { row: 1, column: sheet.columnCount },
      };
    }
  };

  // Hoja Scouts
  scoutsSheet.columns = [
    { header: "N° DE SECUENCIA", key: "secuencia", width: 15 },
    { header: "CÉDULA DE IDENTIDAD", key: "ci", width: 20 },
    { header: "PRIMER NOMBRE", key: "primer_nombre", width: 20 },
    { header: "SEGUNDO NOMBRE", key: "segundo_nombre", width: 20 },
    { header: "PRIMER APELLIDO", key: "primer_apellido", width: 20 },
    { header: "SEGUNDO APELLIDO", key: "segundo_apellido", width: 20 },
    { header: "GRUPO", key: "grupo", width: 12 },
    { header: "UNIDAD", key: "unidad", width: 18 },
    { header: "ETAPA", key: "etapa", width: 20 },
    { header: "FECHA NACIMIENTO", key: "fecha_nacimiento", width: 20 },
    { header: "SEXO", key: "sexo", width: 10 },
    { header: "COLEGIO", key: "colegio", width: 25 },
    { header: "CURSO", key: "curso", width: 12 },
  ];

  let secuencia = 1;
  scoutsRes.rows.forEach((row) => {
    scoutsSheet.addRow({
      secuencia: secuencia++,
      ci: row.ci?.toString().toUpperCase() || "",
      primer_nombre: row.primer_nombre?.toUpperCase() || "",
      segundo_nombre: row.segundo_nombre?.toUpperCase() || "",
      primer_apellido: row.primer_apellido?.toUpperCase() || "",
      segundo_apellido: row.segundo_apellido?.toUpperCase() || "",
      grupo: row.grupo?.toUpperCase() || "",
      unidad: row.unidad?.toUpperCase() || "",
      etapa: row.etapa?.toUpperCase() || "",
      fecha_nacimiento: row.fecha_nacimiento
        ? new Date(row.fecha_nacimiento).toLocaleDateString()
        : "",
      sexo: row.sexo?.toUpperCase() || "",
      colegio: row.colegio?.toUpperCase() || "",
      curso: row.curso?.toUpperCase() || "",
    });
  });

  // Hoja Dirigentes (no colaboradores)
  const dirColumns = [
    { header: "N° DE SECUENCIA", key: "secuencia", width: 15 },
    { header: "CI", key: "ci", width: 20 },
    { header: "NOMBRE", key: "nombre", width: 30 },
    { header: "APELLIDO", key: "apellido", width: 30 },
    { header: "EMAIL", key: "email", width: 30 },
    { header: "UNIDAD", key: "unidad", width: 20 },
    { header: "SEXO", key: "sexo", width: 10 },
    { header: "GRUPO", key: "grupo", width: 15 },
    { header: "FECHA NACIMIENTO", key: "fecha_nacimiento", width: 20 },
    { header: "NIVEL DE FORMACIÓN", key: "nivel_formacion", width: 22 },
  ];

  dirigentesSheet.columns = dirColumns;
  colaboradoresSheet.columns = dirColumns;

  const addDirRow = (sheet, row, seq) => {
    sheet.addRow({
      secuencia: seq,
      ci: row.ci?.toString().toUpperCase() || "",
      nombre: row.nombre?.toUpperCase() || "",
      apellido: row.apellido?.toUpperCase() || "",
      email: row.email || "",
      unidad: row.unidad?.toUpperCase() || "",
      sexo: row.sexo?.toUpperCase() || "",
      grupo: row.grupo?.toUpperCase() || "",
      fecha_nacimiento: row.fecha_nacimiento
        ? new Date(row.fecha_nacimiento).toLocaleDateString()
        : "",
      nivel_formacion: row.nivel_formacion?.toUpperCase() || "",
    });
  };

  secuencia = 1;
  dirigentesRes.rows
    .filter((d) => !d.es_colaborador)
    .forEach((row) => addDirRow(dirigentesSheet, row, secuencia++));

  secuencia = 1;
  dirigentesRes.rows
    .filter((d) => d.es_colaborador && !d.is_admin)
    .forEach((row) => addDirRow(colaboradoresSheet, row, secuencia++));

  styleSheet(scoutsSheet);
  styleSheet(dirigentesSheet);
  styleSheet(colaboradoresSheet);

  return workbook;
}

// Enviar reporte por email (Excel) con registros filtrados por fecha
export const sendReport = async (req, res) => {
  const { from, to, recipient_email, imagenBase64, mensaje } = req.body;

  if (!recipient_email)
    return res.status(400).json({ message: "El email es requerido" });

  try {
    const workbook = await buildReportWorkbook();
    const buffer = await workbook.xlsx.writeBuffer();

    const attachment = [
      {
        content: buffer.toString("base64"),
        name: "inscripciones.xlsx",
      },
    ];

    if (imagenBase64) {
      const base64Data = imagenBase64.includes("base64,")
        ? imagenBase64.split("base64,")[1]
        : imagenBase64;
      attachment.push({
        content: base64Data,
        name: "comprobante.png",
      });
    }

    const senderEmail = process.env.BREVO_SENDER_EMAIL || "pabloox73@gmail.com";
    const senderName = process.env.BREVO_SENDER_NAME || "Grupo Scout Panda";

    const safeMsg = mensaje
      ? mensaje.replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/\n/g, "<br>")
      : null;

    const response = await fetch("https://api.brevo.com/v3/smtp/email", {
      method: "POST",
      headers: {
        "api-key": process.env.BREVO_API_KEY,
        "Content-Type": "application/json",
        Accept: "application/json",
      },
      body: JSON.stringify({
        sender: { name: senderName, email: senderEmail },
        to: [{ email: recipient_email }],
        subject: "Reporte de Inscripciones - Grupo Scout Panda",
        htmlContent: `
          <h3>Reporte de Inscripciones</h3>
          <p>Adjunto se encuentra el reporte en formato Excel - Grupo Scout Panda.</p>
          ${safeMsg ? `<hr><p><strong>Mensaje:</strong></p><p>${safeMsg}</p>` : ""}
        `,
        attachment,
      }),
    });

    const data = await response.json();

    if (!response.ok) {
      console.error("Brevo error:", data);
      return res.status(500).json({ message: "Error enviando email", error: data.message || JSON.stringify(data) });
    }

    return res.json({ message: "Reporte enviado correctamente", messageId: data.messageId });
  } catch (error) {
    console.error("ERROR sendReport:", error);
    return res.status(500).json({
      message: "Error interno",
      error: error.message,
    });
  }
};

// Descargar reporte en Excel
export const downloadReport = async (req, res) => {
  try {
    const workbook = await buildReportWorkbook();
    const buffer = await workbook.xlsx.writeBuffer();

    res.setHeader(
      "Content-Type",
      "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
    );
    res.setHeader(
      "Content-Disposition",
      `attachment; filename="inscripciones-${new Date().toISOString().split("T")[0]}.xlsx"`,
    );

    return res.send(buffer);
  } catch (error) {
    console.error("Error descargando reporte:", error);
    return res.status(500).json({
      message: "Error descargando reporte",
      error: error.message,
    });
  }
};
