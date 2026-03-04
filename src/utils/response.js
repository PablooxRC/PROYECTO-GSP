/**
 * Sistema centralizado de respuestas API
 * Proporciona respuestas consistentes en todo el proyecto
 */

/**
 * Formato estándar de respuesta exitosa
 */
export const successResponse = (data, message = 'Operación exitosa', meta = null) => {
  return {
    success: true,
    message,
    data,
    ...(meta && { meta }),
  };
};

/**
 * Formato estándar de respuesta de error
 */
export const errorResponse = (code, message, field = null) => {
  return {
    success: false,
    error: {
      code,
      message,
      ...(field && { field }),
    },
  };
};

/**
 * Método helper para enviar respuesta exitosa
 */
export const sendSuccess = (res, data, message = 'Operación exitosa', status = 200) => {
  return res.status(status).json(successResponse(data, message));
};

/**
 * Método helper para enviar respuesta de error
 */
export const sendError = (res, code, message, status = 400, field = null) => {
  return res.status(status).json(errorResponse(code, message, field));
};

/**
 * Meta datos de paginación
 */
export const paginationMeta = (page, limit, total, search = null) => {
  const totalPages = Math.ceil(total / limit);
  return {
    page: parseInt(page) || 1,
    limit: parseInt(limit) || 10,
    total,
    totalPages,
    hasNextPage: page < totalPages,
    hasPrevPage: page > 1,
    ...(search && { search }),
  };
};
