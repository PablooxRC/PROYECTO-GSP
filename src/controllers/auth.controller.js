import {pool} from '../db.js'
import bcrypt from 'bcrypt'
import {createAccessToken} from '../libs/jwt.js'
import md5 from 'md5'

//acceder 
export const signin = async (req, res) => {
    const {email, password} = req.body

    const result = await pool.query ('SELECT * FROM dirigente WHERE email = $1', [email])

    if (result.rowCount == 0){
        return res.status(400).json({
            message: "Datos incorrectos o usuario inexistente"
        })
    }

    const validPassword = await bcrypt.compare(password, result.rows[0].password)

    if (!validPassword){
        return res.status(400).json({
            message: 'La contraseña es incorrecta'
        })
    }

   const token = await createAccessToken({ci: result.rows[0].ci})

    res.cookie('token', token, {
        httpOnly: true,
        sameSite: 'none',
        maxAge: 24 * 60 * 60 * 1000
    })
    return res.json(result.rows[0]);
}

//Registrar dirigente
export const signup = async (req, res, next) => {
    const { ci, nombre, apellido, email, unidad, password } = req.body;
    try {

        const hashedPassword = await bcrypt.hash(password, 10);

        const scoutImages = [
            'https://cdn.pixabay.com/photo/2024/02/15/14/20/ai-generated-8575506_1280.png',
            'https://cdn.pixabay.com/photo/2016/03/31/17/54/hat-1293993_1280.png',
            'https://cdn.pixabay.com/photo/2016/11/22/12/24/camp-1849133_1280.png'
        ];

        const randomImageUrl = scoutImages[Math.floor(Math.random() * scoutImages.length)];
        const result = await pool.query(
            'INSERT INTO dirigente(ci, nombre, apellido, email, unidad, password, gravatar) VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING *',
            [ci, nombre, apellido, email, unidad, hashedPassword, randomImageUrl]
        );
        
        const token = await createAccessToken({ci: result.rows[0].ci});

        res.cookie('token', token, {
            httpOnly: true,
            sameSite: 'none',
            maxAge: 24 * 60 * 60 * 1000
        });

        return res.json(result.rows[0]);

    } catch (error) {

        if (error.code == "23505") {
            return res.status(400).json({
                message: "Ya hay un dirigente con esos datos"
            });
        }

        next(error);
        return res.status(500).json({ message: "Error del servidor" });
    }
};



//cerrar sesión
export const signout = (req, res) => {
    res.clearCookie('token');
    res.sendStatus(200);
}


//acceder al perfil
export const profile = async (req, res) =>{
    const result = await pool.query('SELECT * FROM dirigente WHERE ci = $1', [req.userCI]);
    return res.json(result.rows[0])
}
