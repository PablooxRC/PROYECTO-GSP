import {pool} from '../db.js'
import bcrypt from 'bcrypt'
import {createAccessToken} from '../libs/jwt.js'
import md5 from 'md5'
import { asyncHandler, AuthenticationError, ConflictError } from '../utils/errorHandler.js'
import { sendSuccess } from '../utils/response.js'
import { queryOne } from '../utils/dbHelpers.js'

//acceder 
export const signin = asyncHandler(async (req, res) => {
    const {email, password} = req.body

    const user = await queryOne(pool, 'SELECT * FROM dirigente WHERE email = $1', [email])

    if (!user){
        throw new AuthenticationError('Datos incorrectos o usuario inexistente')
    }

    const validPassword = await bcrypt.compare(password, user.password)

    if (!validPassword){
        throw new AuthenticationError('La contraseña es incorrecta')
    }

    const token = await createAccessToken({ci: user.ci, unidad: user.unidad, is_admin: user.is_admin})

    res.cookie("token", token, {
            // httpOnly: true,
            secure: true,
            sameSite: "none",
            maxAge: 24 * 60 * 60 * 1000, // 1 day
    });
    sendSuccess(res, user, 'Sesión iniciada correctamente')
})

//Registrar dirigente
export const signup = asyncHandler(async (req, res, next) => {
    const { ci, nombre, apellido, email, unidad, password } = req.body;

    const hashedPassword = await bcrypt.hash(password, 10);

    const scoutImages = [
        'https://cdn.pixabay.com/photo/2024/02/15/14/20/ai-generated-8575506_1280.png',
        'https://cdn.pixabay.com/photo/2016/03/31/17/54/hat-1293993_1280.png',
        'https://cdn.pixabay.com/photo/2016/11/22/12/24/camp-1849133_1280.png'
    ];

    const randomImageUrl = scoutImages[Math.floor(Math.random() * scoutImages.length)];
    
    try {
        const user = await queryOne(
            pool,
            'INSERT INTO dirigente(ci, nombre, apellido, email, unidad, password, gravatar) VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING *',
            [ci, nombre, apellido, email, unidad, hashedPassword, randomImageUrl]
        );
        
        const token = await createAccessToken({ci: user.ci, unidad: user.unidad, is_admin: user.is_admin});
        res.cookie("token", token, {
            // httpOnly: true,
            secure: true,
            sameSite: "none",
            maxAge: 24 * 60 * 60 * 1000, // 1 day
        });

        sendSuccess(res, user, 'Cuenta creada correctamente', 201);
    } catch (error) {
        if (error.code == "23505") {
            throw new ConflictError('El email o CI ya está registrado');
        }
        throw error;
    }
});



//cerrar sesión
export const signout = asyncHandler((req, res) => {
    res.clearCookie('token');
    sendSuccess(res, null, 'Sesión cerrada correctamente');
})


//acceder al perfil
export const profile = asyncHandler(async (req, res) =>{
    const user = await queryOne(pool, 'SELECT * FROM dirigente WHERE ci = $1', [req.userCI]);
    sendSuccess(res, user, 'Perfil obtenido')
})
