const express = require('express');
const cors = require('cors');
const { Pool } = require('pg');
const { spawn } = require('child_process');
const fs = require('fs');
const path = require('path');
const axios = require('axios');

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
    ssl: false
});

const instructionPath = path.join(__dirname, 'tokens.txt');

let instruction = '';

try {
    instruction = fs.readFileSync(instructionPath, 'utf8');
    console.log('Instruction cargada correctamente');
} catch (err) {
    console.error('Error leyendo instruction.txt:', err);
}

async function queryOllama(prompt) {
    const fullInput = `${instruction}\nPregunta: ${prompt}\nRespuesta:`;

    try {
        const response = await axios.post('http://localhost:11434/api/generate', {
            model: 'gsp',
            prompt: fullInput,
            stream: false
        });

        return response.data.response.trim();
    } catch (error) {
        throw new Error(error.response?.data || error.message);
    }
}

// Ruta para login
app.post('/login', async (req, res) => {
    const { ci } = req.body;
    if (!ci) return res.status(400).json({ message: 'CI es requerido' });

    try {
        const result = await pool.query('SELECT * FROM scouts WHERE ci = $1', [ci]);
        if (result.rows.length > 0) {
            const user = result.rows[0];
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

app.post('/save-wrong-answers', async (req, res) => {
    const { ci, answers } = req.body;

    if (!ci || !answers || answers.length === 0) {
        return res.status(400).json({ success: false, message: 'Datos incompletos' });
    }

    try {
        for (const ans of answers) {
            await pool.query(`
                UPDATE scouts
                SET preguntas_mal_contestadas = preguntas_mal_contestadas || to_jsonb($1::text)
                WHERE ci = $2
            `, [ans.pregunta, ci]);
        }

        res.json({ success: true, message: 'Preguntas mal contestadas guardadas correctamente' });

    } catch (err) {
        console.error('Error guardando en la base de datos:', err);
        res.status(500).json({ success: false, message: 'Error al guardar preguntas', error: err.message });
    }
});


app.post('/ollama', async (req, res) => {
    const { ci } = req.body;
    if (!ci) return res.status(400).json({ message: 'CI es requerido' });

    try {
        // Obtener preguntas mal contestadas del scout
        const result = await pool.query(
            `SELECT preguntas_mal_contestadas FROM scouts WHERE ci = $1`,
            [ci]
        );

        if (result.rows.length === 0) {
            return res.status(404).json({ success: false, message: 'CI no encontrado' });
        }

        const preguntasMal = result.rows[0].preguntas_mal_contestadas;
        if (!preguntasMal || preguntasMal.length === 0) {
            return res.json({ success: true, message: 'No hay preguntas mal contestadas', respuestas: [] });
        }

        const respuestas = [];

        // Suponiendo que preguntas_mal_contestadas es un array de strings (preguntas)
        for (const pregunta of preguntasMal) {
            const respuesta = await queryOllama(pregunta);
            respuestas.push({ pregunta, respuesta });
        }

        res.json({ success: true, respuestas });

    } catch (err) {
        console.error('Error en /ollama:', err);
        res.status(500).json({ success: false, message: 'Error al consultar el modelo', error: err.message });
    }
});


app.post('/update-score', async (req, res) => {
    const { ci, puntaje } = req.body;
    if (!ci || puntaje == null) {
        return res.status(400).json({ success: false, message: 'CI y puntaje son requeridos' });
    }
    try {
        await pool.query('UPDATE scouts SET puntaje = puntaje + $1 WHERE ci = $2', [puntaje, ci]);
        res.json({ success: true, message: 'Puntaje sumado' });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Error al actualizar puntaje', error: error.message });
    }
});


// Iniciar servidor HTTP
app.listen(4000, () => {
    console.log('Servidor HTTP corriendo en http://localhost:4000');
});
