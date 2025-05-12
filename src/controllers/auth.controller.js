import {pool} from '../db.js'
import bcrypt from 'bcrypt'
import {createAccessToken} from '../libs/jwt.js'
export const signin = (req, res) => res.send('ingresando')

//Registrar dirigente
export const signup = async (req, res) => {
    const { ci, nombre, apellido, email, unidad, password } = req.body;
    try {

        const hashedPassword = await bcrypt.hash(password, 10)
        const result = await pool.query(
            'INSERT INTO dirigente(ci, nombre, apellido, email, unidad, password) VALUES ($1, $2, $3, $4, $5, $6) RETURNING *',
            [ci, nombre, apellido, email, unidad, hashedPassword]
        );
        
        const token = await createAccessToken({ci: result.rows[0].ci})

        res.cookie('token', token, {
            httpOnly: true,
            sameSite: 'none',
            maxAge: 24 * 60 * 60 * 1000
        })
        return res.json(result.rows[0])
    } catch (error) {

        if (error.code == "23505") {
            return res.status(400).json({
                message: "Ya hay un dirigente con esos datos"
            });
        }
        return res.status(500).json({ message: "Error del servidor" });
    }
};


export const signout = (req, res) => res.send('cerrando sesion')

export const profile = (req, res) => res.send('perfil del dirigente')
