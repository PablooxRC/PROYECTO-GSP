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
            'SELECT ci, nombre, apellido, email, unidad, envio, create_at FROM dirigente WHERE is_admin = FALSE ORDER BY create_at DESC'
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
        password
    } = req.body

    try {
        const pwd = password || '12345678'
        const hashedPassword = await bcrypt.hash(pwd, 10)
        const gravatar = null
        const result = await pool.query(
            `INSERT INTO dirigente (ci, nombre, apellido, email, primer_nombre, segundo_nombre, primer_apellido, segundo_apellido, fecha_nacimiento, sexo, grupo, unidad, nivel_formacion, envio, password, gravatar) VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14,$15,$16) RETURNING *`,
            [ci, `${primer_nombre || ''} ${primer_apellido || ''}`.trim(), `${primer_apellido || ''}`.trim(), email, primer_nombre, segundo_nombre, primer_apellido, segundo_apellido, fecha_nacimiento || null, sexo || null, grupo || null, unidad || null, nivel_formacion || null, envio || null, hashedPassword, gravatar]
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
export const sendReport = async (req, res, next) => {
    if (!req.isAdmin) return res.status(403).json({ message: 'Acceso denegado' })

    const { from, to, recipient_email } = req.body
    // determinar rango
    const fromDate = from ? new Date(from) : null
    const toDate = to ? new Date(to) : null

    try {
        // Consultar registros según rango
        let registrosQuery = 'SELECT * FROM registros'
        const params = []
        if (fromDate && toDate) {
            registrosQuery += ' WHERE fecha_deposito BETWEEN $1 AND $2'
            params.push(fromDate.toISOString().slice(0,10), toDate.toISOString().slice(0,10))
        } else if (fromDate) {
            registrosQuery += ' WHERE fecha_deposito >= $1'
            params.push(fromDate.toISOString().slice(0,10))
        } else if (toDate) {
            registrosQuery += ' WHERE fecha_deposito <= $1'
            params.push(toDate.toISOString().slice(0,10))
        }

        registrosQuery += ' ORDER BY fecha_deposito NULLS LAST'
        const registrosRes = await pool.query(registrosQuery, params)

        // Obtener scouts y dirigentes completos
        const scoutsRes = await pool.query('SELECT * FROM scouts')
        // Leer siempre todas las columnas y detectar qué columnas existen
        const dirigentesRes = await pool.query('SELECT * FROM dirigente')

        // Generar Excel
        const workbook = new ExcelJS.Workbook()
        const rSheet = workbook.addWorksheet('Registros')
        const sSheet = workbook.addWorksheet('Scouts')
        const dSheet = workbook.addWorksheet('Dirigentes')

        // Registros columns
        rSheet.columns = [
            { header: 'ID', key: 'id', width: 10 },
            { header: 'Scout CI', key: 'scout_ci', width: 15 },
            { header: 'Unidad', key: 'unidad', width: 20 },
            { header: 'Etapa', key: 'etapa_progresion', width: 20 },
            { header: 'Colegio', key: 'colegio', width: 30 },
            { header: 'Curso', key: 'curso', width: 15 },
            { header: 'Numero Deposito', key: 'numero_deposito', width: 20 },
            { header: 'Fecha Deposito', key: 'fecha_deposito', width: 15 },
            { header: 'Monto', key: 'monto', width: 12 },
            { header: 'Envio', key: 'envio', width: 30 },
            { header: 'Contacto Nombre', key: 'contacto_nombre', width: 25 },
            { header: 'Contacto Parentesco', key: 'contacto_parentesco', width: 20 },
            { header: 'Contacto Celular', key: 'contacto_celular', width: 20 }
        ]

        registrosRes.rows.forEach(row => {
            rSheet.addRow({
                id: row.id,
                scout_ci: row.scout_ci,
                unidad: row.unidad,
                etapa_progresion: row.etapa_progresion,
                colegio: row.colegio,
                curso: row.curso,
                numero_deposito: row.numero_deposito,
                fecha_deposito: row.fecha_deposito ? new Date(row.fecha_deposito).toLocaleDateString() : null,
                monto: row.monto,
                envio: row.envio,
                contacto_nombre: row.contacto_nombre,
                contacto_parentesco: row.contacto_parentesco,
                contacto_celular: row.contacto_celular
            })
        })

        // Scouts sheet (flatten names)
        sSheet.columns = [
            { header: 'CI', key: 'ci', width: 15 },
            { header: 'Nombre', key: 'nombre', width: 25 },
            { header: 'Apellido', key: 'apellido', width: 25 },
            { header: 'Fecha Nacimiento', key: 'fecha_nacimiento', width: 15 },
            { header: 'Sexo', key: 'sexo', width: 8 },
            { header: 'Grupo', key: 'grupo', width: 12 },
            { header: 'Unidad', key: 'unidad', width: 18 },
            { header: 'Etapa', key: 'etapa', width: 12 },
            { header: 'Curso', key: 'curso', width: 12 }
        ]
        scoutsRes.rows.forEach(row => {
            sSheet.addRow({
                ci: row.ci,
                nombre: row.nombre,
                apellido: row.apellido,
                fecha_nacimiento: row.fecha_nacimiento || null,
                sexo: row.sexo || null,
                grupo: row.grupo || null,
                unidad: row.unidad || null,
                etapa: row.etapa || null,
                curso: row.curso || null
            })
        })

        // Dirigentes sheet
        // Detectar si la consulta devolvió columnas extendidas o básicas
        const fieldNames = dirigentesRes.fields.map(f => f.name)
        const hasExtended = fieldNames.includes('primer_nombre') || fieldNames.includes('primer_apellido') || fieldNames.includes('segundo_nombre') || fieldNames.includes('segundo_apellido') || fieldNames.includes('nivel_formacion')
        if (hasExtended) {
            dSheet.columns = [
                { header: 'CI', key: 'ci', width: 15 },
                { header: 'Primer Nombre', key: 'primer_nombre', width: 20 },
                { header: 'Segundo Nombre', key: 'segundo_nombre', width: 20 },
                { header: 'Primer Apellido', key: 'primer_apellido', width: 20 },
                { header: 'Segundo Apellido', key: 'segundo_apellido', width: 20 },
                { header: 'Fecha Nac', key: 'fecha_nacimiento', width: 15 },
                { header: 'Sexo', key: 'sexo', width: 8 },
                { header: 'Grupo', key: 'grupo', width: 12 },
                { header: 'Unidad', key: 'unidad', width: 18 },
                { header: 'Nivel Formacion', key: 'nivel_formacion', width: 25 }
            ]
            dirigentesRes.rows.forEach(row => {
                dSheet.addRow({
                    ci: row.ci,
                    primer_nombre: row.primer_nombre || null,
                    segundo_nombre: row.segundo_nombre || null,
                    primer_apellido: row.primer_apellido || null,
                    segundo_apellido: row.segundo_apellido || null,
                    fecha_nacimiento: row.fecha_nacimiento || null,
                    sexo: row.sexo || null,
                    grupo: row.grupo || null,
                    unidad: row.unidad || null,
                    nivel_formacion: row.nivel_formacion || null
                })
            })
        } else {
            dSheet.columns = [
                { header: 'CI', key: 'ci', width: 15 },
                { header: 'Nombre', key: 'nombre', width: 30 },
                { header: 'Apellido', key: 'apellido', width: 30 },
                { header: 'Fecha Nac', key: 'fecha_nacimiento', width: 15 },
                { header: 'Sexo', key: 'sexo', width: 8 },
                { header: 'Grupo', key: 'grupo', width: 12 },
                { header: 'Unidad', key: 'unidad', width: 18 }
            ]
            dirigentesRes.rows.forEach(row => {
                dSheet.addRow({
                    ci: row.ci,
                    nombre: row.nombre || null,
                    apellido: row.apellido || null,
                    fecha_nacimiento: row.fecha_nacimiento || null,
                    sexo: row.sexo || null,
                    grupo: row.grupo || null,
                    unidad: row.unidad || null
                })
            })
        }

        // Guardar workbook temporalmente
        const tmpDir = os.tmpdir()
        const fileName = `reporte_${Date.now()}.xlsx`
        const filePath = path.join(tmpDir, fileName)
        await workbook.xlsx.writeFile(filePath)

        // Enviar email con nodemailer
        const auth = {
            user: process.env.SMTP_USER,
            pass: process.env.SMTP_PASS
        }
        const transporter = process.env.SMTP_HOST ? nodemailer.createTransport({
            host: process.env.SMTP_HOST,
            port: parseInt(process.env.SMTP_PORT || '587', 10),
            secure: false,
            auth
        }) : nodemailer.createTransport({
            service: 'gmail',
            auth
        })

        const mailOptions = {
            from: process.env.FROM_EMAIL || process.env.SMTP_USER,
            to: recipient_email,
            subject: `Reporte de Registros ${from || ''} ${to || ''}`,
            text: 'Adjunto el reporte en formato Excel.',
            attachments: [
                { filename: fileName, path: filePath }
            ]
        }

        try {
            await transporter.sendMail(mailOptions)
        } catch (mailErr) {
            console.error('Error sending mail:', mailErr)
            throw mailErr
        }

        // Registrar en report_logs
        await pool.query('INSERT INTO report_logs (sent_by, "from", "to", recipient_email) VALUES ($1,$2,$3,$4)', [req.userCI, fromDate ? fromDate.toISOString().slice(0,10) : null, toDate ? toDate.toISOString().slice(0,10) : null, recipient_email || null])

        // eliminar archivo temporal
        fs.unlinkSync(filePath)

        return res.json({ message: 'Reporte enviado' })
    } catch (error) {
        console.error('sendReport error:', error)
        next(error)
    }
}
