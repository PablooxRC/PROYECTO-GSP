import jwt from 'jsonwebtoken';
import config from '../config.js';
import { AuthenticationError } from '../utils/errorHandler.js';
import { logger } from '../utils/logger.js';

/**
 * Middleware de autenticación
 * Valida JWT del token en cookies o header Authorization
 */
export const isAuth = (req, res, next) => {
    // Intentar obtener token de cookies o del header Authorization
    let token = req.cookies.token;
    
    if (!token) {
        const authHeader = req.headers.authorization;
        if (authHeader && authHeader.startsWith('Bearer ')) {
            token = authHeader.slice(7); // Extraer token sin "Bearer "
        }
    }

    if (!token) {
        return res.status(401).json({
            success: false,
            error: {
                code: 'AUTHENTICATION_ERROR',
                message: 'No se proporcionó token de autenticación'
            }
        });
    }

    try {
        jwt.verify(token, config.JWT_SECRET, (err, decoded) => {
            if (err) {
                logger.warn('Token inválido o expirado', { error: err.message });
                return res.status(401).json({
                    success: false,
                    error: {
                        code: 'AUTHENTICATION_ERROR',
                        message: 'Token inválido o expirado'
                    }
                });
            }
            
            // Asignar datos del usuario al request
            req.userCI = decoded.ci;
            req.userUnidad = decoded.unidad || null;
            req.isAdmin = !!decoded.is_admin;
            
            next();
        });
    } catch (error) {
        return res.status(401).json({
            success: false,
            error: {
                code: 'AUTHENTICATION_ERROR',
                message: error.message
            }
        });
    }
};
