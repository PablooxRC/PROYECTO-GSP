import { ValidationError } from '../utils/errorHandler.js';

/**
 * Middleware para validar request body contra un schema Zod
 * @param {Object} schema - Schema Zod para validar
 */
export const validateSchema = (schema) => async (req, res, next) => {
    try {
        await schema.parse(req.body);
        next();
    } catch (error) {
        if (Array.isArray(error.errors)) {
            // Retorna el primer error de forma clara
            const firstError = error.errors[0];
            const fieldName = firstError.path.join('.');
            const message = firstError.message;
            
            return res.status(400).json({
                success: false,
                error: {
                    code: 'VALIDATION_ERROR',
                    message,
                    field: fieldName
                }
            });
        }
        return res.status(400).json({
            success: false,
            error: {
                code: 'VALIDATION_ERROR',
                message: error.message || 'Error de validación'
            }
        });
    }
};
