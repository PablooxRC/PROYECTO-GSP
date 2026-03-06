import { pool } from '../db.js'
import bcrypt from 'bcrypt'
import ExcelJS from 'exceljs'
import nodemailer from 'nodemailer'
import fs from 'fs'
import os from 'os'
import path from 'path'

// Crear un nuevo admin (solo accesible por admins existentes)
export const createAdmin = async (req, res, next) => {
    if (!req.isAdmin) {
        return res.status(403).json({ message: 'Acceso denegado' })
    }

    const { ci, nombre, apellido, email, unidad, password } = req.body
    try {
        const hashedPassword = await bcrypt.hash(password, 10)
        const result = await pool.query(
            'INSERT INTO dirigente (ci, nombre, apellido, email, unidad, password, is_admin) VALUES ($1,$2,$3,$4,$5,$6, true) RETURNING *',
            [ci, nombre, apellido, email, unidad, hashedPassword]
        )
        return res.json(result.rows[0])
    } catch (error) {
        if (error.code === '23505') {
            return res.status(400).json({ message: 'Ya existe un dirigente con esos datos' })
        }
        next(error)
    }
}

// Listar admins
export const listAdmins = async (req, res, next) => {
    if (!req.isAdmin) return res.status(403).json({ message: 'Acceso denegado' })
    try {
        const result = await pool.query('SELECT ci, nombre, apellido, email, unidad, is_admin FROM dirigente WHERE is_admin = TRUE')
        return res.json(result.rows)
    } catch (error) {
        next(error)
    }
}

// Listar todos los dirigentes (no admins)
export const listDirigentes = async (req, res, next) => {
    if (!req.isAdmin) return res.status(403).json({ message: 'Acceso denegado' })
    try {
        const result = await pool.query(
            'SELECT ci, nombre, apellido, email, unidad, envio, create_at, nivel_formacion, es_colaborador FROM dirigente WHERE is_admin = FALSE ORDER BY create_at DESC'
        )
        return res.json(result.rows)
    } catch (error) {
        next(error)
    }
}

// Crear dirigente (solo admins pueden crear dirigentes desde el panel)
export const createDirigente = async (req, res, next) => {
    if (!req.isAdmin) return res.status(403).json({ message: 'Acceso denegado' })

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
        es_colaborador
    } = req.body

    try {
        const pwd = password || '12345678'
        const hashedPassword = await bcrypt.hash(pwd, 10)
        const gravatar = null
        const result = await pool.query(
            `INSERT INTO dirigente (ci, nombre, apellido, email, primer_nombre, segundo_nombre, primer_apellido, segundo_apellido, fecha_nacimiento, sexo, grupo, unidad, nivel_formacion, envio, password, gravatar, numero_deposito, monto, fecha_deposito, hora_deposito, es_colaborador) VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14,$15,$16,$17,$18,$19,$20,$21) RETURNING *`,
            [ci, `${primer_nombre || ''} ${primer_apellido || ''}`.trim(), `${primer_apellido || ''}`.trim(), email, primer_nombre, segundo_nombre, primer_apellido, segundo_apellido, fecha_nacimiento || null, sexo || null, grupo || null, unidad || null, nivel_formacion || null, envio || null, hashedPassword, gravatar, numero_deposito || null, monto || null, fecha_deposito || null, hora_deposito || null, es_colaborador || false]
        )
        return res.json(result.rows[0])
    } catch (error) {
        if (error.code === '23505') return res.status(400).json({ message: 'Ya existe un dirigente con ese CI o email' })
        next(error)
    }
}

// Actualizar dirigente
export const updateDirigente = async (req, res, next) => {
    if (!req.isAdmin) return res.status(403).json({ message: 'Acceso denegado' })
    
    const { ci } = req.params
    const { envio } = req.body
    
    try {
        const result = await pool.query(
            'UPDATE dirigente SET envio = $1 WHERE ci = $2 RETURNING *',
            [envio, ci]
        )
        
        if (result.rowCount === 0) {
            return res.status(404).json({ message: 'Dirigente no encontrado' })
        }
        
        return res.json(result.rows[0])
    } catch (error) {
        next(error)
    }
}

// Eliminar dirigente
export const deleteDirigente = async (req, res, next) => {
    if (!req.isAdmin) return res.status(403).json({ message: 'Acceso denegado' })
    
    const { ci } = req.params
    
    try {
        const result = await pool.query(
            'DELETE FROM dirigente WHERE ci = $1 RETURNING *',
            [ci]
        )
        
        if (result.rowCount === 0) {
            return res.status(404).json({ message: 'Dirigente no encontrado' })
        }
        
        return res.json({ message: 'Dirigente eliminado correctamente', data: result.rows[0] })
    } catch (error) {
        if (error.code === '23503') {
            return res.status(400).json({ message: 'No se puede eliminar: hay registros asociados a este dirigente' })
        }
        next(error)
    }
}

// Enviar reporte por email (Excel) con registros filtrados por fecha
export const sendReport = async (req, res) => {

    if (!req.isAdmin)
        return res.status(403).json({ message: 'Acceso denegado' })

    const { from, to, recipient_email, imagenBase64 } = req.body

    if (!recipient_email)
        return res.status(400).json({ message: 'El email es requerido' })

    try {

        // ===============================
        // CONSULTAS
        // ===============================

        const registrosRes = await pool.query(`
            SELECT 
                s.ci as scout_ci,
                s.primer_nombre,
                s.segundo_nombre,
                s.primer_apellido,
                s.segundo_apellido,
                s.grupo,
                s.unidad,
                s.etapa,
                s.fecha_nacimiento,
                s.sexo,
                r.colegio,
                r.curso
            FROM scouts s
            LEFT JOIN (
                SELECT DISTINCT ON (scout_ci) scout_ci, colegio, curso, id
                FROM registros
                ORDER BY scout_ci, id DESC
            ) r ON s.ci = r.scout_ci
            ORDER BY s.ci
        `)

        const scoutsRes = await pool.query(`
            SELECT DISTINCT ON (s.ci) s.*, r.colegio, r.curso
            FROM scouts s
            LEFT JOIN registros r ON s.ci = r.scout_ci
            ORDER BY s.ci, r.id DESC
        `)

        const dirigentesRes = await pool.query('SELECT * FROM dirigente')

        // ===============================
        // CREAR EXCEL
        // ===============================

        const workbook = new ExcelJS.Workbook()
        const rSheet = workbook.addWorksheet('Registros')
        const sSheet = workbook.addWorksheet('Scouts')
        const dSheet = workbook.addWorksheet('Dirigentes')

        // ===============================
        // FUNCIÓN DE ESTILO SEGURA
        // ===============================

        const styleSheet = (sheet) => {

            sheet.views = [{ state: 'frozen', ySplit: 1 }]

            const headerRow = sheet.getRow(1)

            headerRow.eachCell((cell) => {
                cell.fill = {
                    type: 'pattern',
                    pattern: 'solid',
                    fgColor: { argb: 'FFFFFF00' }
                }

                cell.font = { bold: true }

                cell.alignment = {
                    vertical: 'middle',
                    horizontal: 'center'
                }
            })

            sheet.eachRow((row) => {
                row.eachCell((cell) => {
                    cell.border = {
                        top: { style: 'thin' },
                        left: { style: 'thin' },
                        bottom: { style: 'thin' },
                        right: { style: 'thin' }
                    }
                })
            })

            if (sheet.columnCount > 0) {
                sheet.autoFilter = {
                    from: { row: 1, column: 1 },
                    to: { row: 1, column: sheet.columnCount }
                }
            }
        }

        // ===============================
        // COLUMNAS BASE
        // ===============================

        const baseColumns = [
            { header: 'N° DE SECUENCIA', key: 'secuencia', width: 15 },
            { header: 'CÉDULA DE IDENTIDAD', key: 'ci', width: 20 },
            { header: 'PRIMER NOMBRE', key: 'primer_nombre', width: 20 },
            { header: 'SEGUNDO NOMBRE', key: 'segundo_nombre', width: 20 },
            { header: 'PRIMER APELLIDO', key: 'primer_apellido', width: 20 },
            { header: 'SEGUNDO APELLIDO', key: 'segundo_apellido', width: 20 },
            { header: 'GRUPO', key: 'grupo', width: 12 },
            { header: 'UNIDAD', key: 'unidad', width: 18 },
            { header: 'ETAPA', key: 'etapa', width: 20 },
            { header: 'FECHA NACIMIENTO', key: 'fecha_nacimiento', width: 20 },
            { header: 'SEXO', key: 'sexo', width: 10 },
            { header: 'COLEGIO', key: 'colegio', width: 25 },
            { header: 'CURSO', key: 'curso', width: 12 }
        ]

        rSheet.columns = baseColumns
        sSheet.columns = [...baseColumns]

        let secuencia = 1

        registrosRes.rows.forEach(row => {
            rSheet.addRow({
                secuencia: secuencia++,
                ci: row.scout_ci?.toString().toUpperCase() || '',
                primer_nombre: row.primer_nombre?.toUpperCase() || '',
                segundo_nombre: row.segundo_nombre?.toUpperCase() || '',
                primer_apellido: row.primer_apellido?.toUpperCase() || '',
                segundo_apellido: row.segundo_apellido?.toUpperCase() || '',
                grupo: row.grupo?.toUpperCase() || '',
                unidad: row.unidad?.toUpperCase() || '',
                etapa: row.etapa?.toUpperCase() || '',
                fecha_nacimiento: row.fecha_nacimiento ? new Date(row.fecha_nacimiento).toLocaleDateString() : '',
                sexo: row.sexo?.toUpperCase() || '',
                colegio: row.colegio?.toUpperCase() || '',
                curso: row.curso?.toUpperCase() || ''
            })
        })

        secuencia = 1

        scoutsRes.rows.forEach(row => {
            sSheet.addRow({
                secuencia: secuencia++,
                ci: row.ci?.toString().toUpperCase() || '',
                primer_nombre: row.primer_nombre?.toUpperCase() || '',
                segundo_nombre: row.segundo_nombre?.toUpperCase() || '',
                primer_apellido: row.primer_apellido?.toUpperCase() || '',
                segundo_apellido: row.segundo_apellido?.toUpperCase() || '',
                grupo: row.grupo?.toUpperCase() || '',
                unidad: row.unidad?.toUpperCase() || '',
                etapa: row.etapa?.toUpperCase() || '',
                fecha_nacimiento: row.fecha_nacimiento ? new Date(row.fecha_nacimiento).toLocaleDateString() : '',
                sexo: row.sexo?.toUpperCase() || '',
                colegio: row.colegio?.toUpperCase() || '',
                curso: row.curso?.toUpperCase() || ''
            })
        })

        dSheet.columns = [
            { header: 'CI', key: 'ci', width: 15 },
            { header: 'Nombre', key: 'nombre', width: 30 },
            { header: 'Apellido', key: 'apellido', width: 30 },
            { header: 'Fecha Nac', key: 'fecha_nacimiento', width: 15 },
            { header: 'Sexo', key: 'sexo', width: 10 },
            { header: 'Grupo', key: 'grupo', width: 15 },
            { header: 'Unidad', key: 'unidad', width: 20 }
        ]

        dirigentesRes.rows.forEach(row => {
            dSheet.addRow({
                ci: row.ci || '',
                nombre: row.nombre || '',
                apellido: row.apellido || '',
                fecha_nacimiento: row.fecha_nacimiento || '',
                sexo: row.sexo || '',
                grupo: row.grupo || '',
                unidad: row.unidad || ''
            })
        })

        styleSheet(rSheet)
        styleSheet(sSheet)
        styleSheet(dSheet)

        // ===============================
        // GUARDAR EXCEL
        // ===============================

        const tmpDir = os.tmpdir()
        const filePath = path.join(tmpDir, 'inscripciones.xlsx')
        await workbook.xlsx.writeFile(filePath)

        // ===============================
        // PREPARAR EMAIL
        // ===============================

        const attachments = [
            { filename: 'inscripciones.xlsx', path: filePath }
        ]

        if (imagenBase64) {
            attachments.push({
                filename: 'comprobante.png',
                content: Buffer.from(
                    imagenBase64.includes('base64,')
                        ? imagenBase64.split('base64,')[1]
                        : imagenBase64,
                    'base64'
                ),
                cid: 'logo_cid'
            })
        }

        const transporter = nodemailer.createTransport({
            service: 'gmail',
            auth: {
                user: process.env.SMTP_USER,
                pass: process.env.SMTP_PASS
            }
        })

        await transporter.sendMail({
            from: process.env.SMTP_USER,
            to: recipient_email,
            subject: `Reporte de Inscripciones`,
            text: 'Adjunto el reporte en Excel.',
            html: `
                <h3>Reporte de Inscripciones</h3>
                <p>Adjunto se encuentra el reporte en formato Excel - Grupo Scout Panda.</p>
                ${imagenBase64 ? '<hr><img src="cid:logo_cid" style="max-width:200px;" />' : ''}
            `,
            attachments
        })

        fs.unlinkSync(filePath)

        return res.json({ message: 'Reporte enviado correctamente' })

    } catch (error) {
        console.error('ERROR:', error)
        return res.status(500).json({
            message: 'Error interno',
            error: error.message
        })
    }
}