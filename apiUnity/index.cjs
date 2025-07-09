const express = require('express');
const https = require('https');
const fs = require('fs');
const cors = require('cors');
const { Pool } = require('pg');

const app = express();
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

const pool = new Pool({
    user: 'postgres',
    host: 'localhost',
    database: 'Scouts',
    password: '12345678',
    port: 5432,
});

// Ruta para login con CI
app.post('/login', async (req, res) => {
    const { ci } = req.body;
    if (!ci) return res.status(400).json({ message: 'CI es requerido' });

    try {
        const result = await pool.query('SELECT * FROM scouts WHERE ci = $1', [ci]);
        if (result.rows.length > 0) {
            const user = result.rows[0]; // Tomamos el primer (y único) registro encontrado
            res.json({
                success: true,
                message: 'Acceso concedido',
                ci: user.ci,
                nombre: user.nombre,
                apellido: user.apellido,
                unidad: user.unidad,
                rama: user.rama,
                etapa: user.etapa,
                dirigente_ci: user.dirigente_ci
            });
        } else {
            res.json({ success: false, message: 'CI no encontrado' });
        }
    } catch (err) {
        res.status(500).json({ success: false, message: 'Error del servidor', error: err.message });
    }
});

// Leer los certificados SSL
const options = {
    key: fs.readFileSync('server.key'),  // Ruta al archivo de clave privada
    cert: fs.readFileSync('server.crt')  // Ruta al archivo de certificado
};

// Crear servidor HTTPS
https.createServer(options, app).listen(3000, () => {
    console.log('Servidor HTTPS corriendo en https://localhost:3000');
});
