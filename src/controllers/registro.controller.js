import { pool } from '../db.js'

// Obtener todos los registros del dirigente
export const getRegistros = async (req, res, next) => {
    try {
        const { from, to } = req.query;
        let query = `
            SELECT r.*, 
                   s.nombre AS scout_nombre, s.apellido AS scout_apellido,
                   d.nombre AS dirigente_nombre, d.apellido AS dirigente_apellido, d.email AS dirigente_email, d.unidad AS dirigente_unidad
            FROM registros r 
            LEFT JOIN scouts s ON r.scout_ci = s.ci
            LEFT JOIN dirigente d ON r.dirigente_ci = d.ci
        `;
        let params = [];
        let whereConditions = [];

        if (!req.isAdmin) {
            whereConditions.push(`r.dirigente_ci = $${params.length + 1}`);
            params.push(req.userCI);
        }

        if (from) {
            whereConditions.push(`r.fecha_deposito >= $${params.length + 1}`);
            params.push(from);
        }

        if (to) {
            whereConditions.push(`r.fecha_deposito <= $${params.length + 1}`);
            params.push(to);
        }

        if (whereConditions.length > 0) {
            query += ` WHERE ${whereConditions.join(' AND ')}`;
        }

        query += ` ORDER BY r.fecha_deposito DESC NULLS LAST`;

        const result = await pool.query(query, params);
        return res.json(result.rows);
    } catch (error) {
        next(error);
    }
}

// Obtener lista de unidades (para filtro en admin)
export const getUnidades = async (req, res, next) => {
    try {
        let result;
        if (req.isAdmin) {
            result = await pool.query('SELECT DISTINCT unidad FROM registros WHERE unidad IS NOT NULL ORDER BY unidad');
        } else {
            result = await pool.query('SELECT DISTINCT unidad FROM registros WHERE unidad IS NOT NULL AND dirigente_ci = $1 ORDER BY unidad', [req.userCI]);
        }
        const unidades = result.rows.map(r => r.unidad).filter(Boolean);
        return res.json(unidades);
    } catch (error) {
        next(error);
    }
}

// Obtener registros por scout
export const getRegistrosByScout = async (req, res, next) => {
    try {
        const { scout_ci } = req.params
        let result;
        if (req.isAdmin) {
            result = await pool.query(`
                SELECT r.*, s.nombre AS scout_nombre, s.apellido AS scout_apellido 
                FROM registros r 
                LEFT JOIN scouts s ON r.scout_ci = s.ci 
                WHERE r.scout_ci = $1 
                ORDER BY r.fecha_deposito DESC NULLS LAST
            `, [scout_ci]);
        } else {
            result = await pool.query(`
                SELECT r.*, s.nombre AS scout_nombre, s.apellido AS scout_apellido 
                FROM registros r 
                LEFT JOIN scouts s ON r.scout_ci = s.ci 
                WHERE r.scout_ci = $1 AND r.dirigente_ci = $2 
                ORDER BY r.fecha_deposito DESC NULLS LAST
            `, [scout_ci, req.userCI]);
        }
        return res.json(result.rows)
    } catch (error) {
        next(error)
    }
}

// Obtener un registro específico
export const getRegistro = async (req, res, next) => {
    try {
        const { id } = req.params
        let result;
        if (req.isAdmin) {
            result = await pool.query(`
                SELECT r.*, s.nombre AS scout_nombre, s.apellido AS scout_apellido 
                FROM registros r 
                LEFT JOIN scouts s ON r.scout_ci = s.ci 
                WHERE r.id = $1
            `, [id]);
        } else {
            result = await pool.query(`
                SELECT r.*, s.nombre AS scout_nombre, s.apellido AS scout_apellido 
                FROM registros r 
                LEFT JOIN scouts s ON r.scout_ci = s.ci 
                WHERE r.id = $1 AND r.dirigente_ci = $2
            `, [id, req.userCI]);
        }

        if (result.rowCount === 0) {
            return res.status(404).json({ message: 'No existe un registro con ese ID' });
        }

        return res.json(result.rows[0]);
    } catch (error) {
        next(error);
    }
}

// Crear registro
export const createRegistro = async (req, res, next) => {
    const {
        scout_ci,
        unidad,
        etapa_progresion,
        colegio,
        curso,
        numero_deposito,
        fecha_deposito,
        monto,
        envio,
        contacto_parentesco,
        contacto_nombre,
        contacto_celular
    } = req.body

    try {
        // Verificar que el scout existe. Si no es admin, verificar pertenencia.
        let scoutCheck;
        if (req.isAdmin) {
            scoutCheck = await pool.query('SELECT * FROM scouts WHERE ci = $1', [scout_ci]);
        } else {
            scoutCheck = await pool.query('SELECT * FROM scouts WHERE ci = $1 AND dirigente_ci = $2', [scout_ci, req.userCI]);
        }

        if (scoutCheck.rowCount === 0) {
            return res.status(404).json({ message: 'Scout no encontrado o no pertenece a este dirigente' });
        }

        const result = await pool.query(`INSERT INTO registros (
                scout_ci, unidad, etapa_progresion, colegio, curso,
                numero_deposito, fecha_deposito, monto, envio,
                contacto_parentesco, contacto_nombre, contacto_celular,
                dirigente_ci
            ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13) RETURNING *`, [
            scout_ci, unidad, etapa_progresion, colegio, curso,
            numero_deposito, fecha_deposito, monto, envio,
            contacto_parentesco, contacto_nombre, contacto_celular,
            req.userCI
        ])

        return res.json(result.rows[0])
    } catch (error) {
        next(error)
    }
}

// Actualizar registro
export const updateRegistro = async (req, res, next) => {
    const { id } = req.params
    const {
        scout_ci,
        unidad,
        etapa_progresion,
        colegio,
        curso,
        numero_deposito,
        fecha_deposito,
        monto,
        envio,
        contacto_parentesco,
        contacto_nombre,
        contacto_celular
    } = req.body

    try {
        const result = await pool.query(
            `UPDATE registros SET
                scout_ci = $1, unidad = $2, etapa_progresion = $3, colegio = $4,
                curso = $5, numero_deposito = $6, fecha_deposito = $7, monto = $8,
                envio = $9, contacto_parentesco = $10, contacto_nombre = $11,
                contacto_celular = $12, updated_at = CURRENT_TIMESTAMP
            WHERE id = $13 AND dirigente_ci = $14 RETURNING *`,
            [
                scout_ci, unidad, etapa_progresion, colegio, curso,
                numero_deposito, fecha_deposito, monto, envio,
                contacto_parentesco, contacto_nombre, contacto_celular,
                id, req.userCI
            ]
        )

        if (result.rowCount === 0) {
            return res.status(404).json({
                message: "Registro no encontrado"
            })
        }

        return res.json(result.rows[0])
    } catch (error) {
        next(error)
    }
}

// Eliminar registro
export const deleteRegistro = async (req, res, next) => {
    try {
        const { id } = req.params
        
        const result = await pool.query(
            'DELETE FROM registros WHERE id = $1 AND dirigente_ci = $2',
            [id, req.userCI]
        )

        if (result.rowCount === 0) {
            return res.status(404).json({
                message: "Registro no encontrado"
            })
        }

        return res.json({
            message: "Registro eliminado correctamente"
        })
    } catch (error) {
        next(error)
    }
}
