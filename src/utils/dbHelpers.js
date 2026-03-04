/**
 * Helpers de base de datos
 * Funciones reutilizables para operaciones comunes
 */

import { logger } from './logger.js';
import { DatabaseError, NotFoundError } from './errorHandler.js';

/**
 * Ejecuta una query y retorna un resultado o null si no hay filas
 */
export const queryOne = async (pool, query, params = []) => {
  try {
    const result = await pool.query(query, params);
    return result.rows[0] || null;
  } catch (error) {
    logger.error('Error en queryOne', { query, error: error.message });
    throw new DatabaseError('Error consultando base de datos', error);
  }
};

/**
 * Ejecuta una query y retorna todas las filas
 */
export const queryMany = async (pool, query, params = []) => {
  try {
    const result = await pool.query(query, params);
    return result.rows;
  } catch (error) {
    logger.error('Error en queryMany', { query, error: error.message });
    throw new DatabaseError('Error consultando base de datos', error);
  }
};

/**
 * Ejecuta una query INSERT y retorna la fila creada
 */
export const insertOne = async (pool, query, params = []) => {
  try {
    const result = await pool.query(query, params);
    if (result.rows.length === 0) {
      throw new DatabaseError('No se pudo insertar el registro');
    }
    logger.info('Registro insertado', { table: query.includes('scouts') ? 'scouts' : 'dirigente' });
    return result.rows[0];
  } catch (error) {
    logger.error('Error en insertOne', { query, error: error.message });
    throw new DatabaseError('Error al insertar en base de datos', error);
  }
};

/**
 * Ejecuta una query UPDATE y retorna la fila actualizada
 */
export const updateOne = async (pool, query, params = []) => {
  try {
    const result = await pool.query(query, params);
    if (result.rows.length === 0) {
      throw new NotFoundError('Registro');
    }
    logger.info('Registro actualizado');
    return result.rows[0];
  } catch (error) {
    if (error instanceof NotFoundError) throw error;
    logger.error('Error en updateOne', { query, error: error.message });
    throw new DatabaseError('Error al actualizar en base de datos', error);
  }
};

/**
 * Ejecuta una query DELETE
 */
export const deleteOne = async (pool, query, params = []) => {
  try {
    const result = await pool.query(query, params);
    if (result.rowCount === 0) {
      throw new NotFoundError('Registro');
    }
    logger.info('Registro eliminado');
    return true;
  } catch (error) {
    if (error instanceof NotFoundError) throw error;
    logger.error('Error en deleteOne', { query, error: error.message });
    throw new DatabaseError('Error al eliminar de base de datos', error);
  }
};

/**
 * Ejecuta múltiples queries en una transacción
 */
export const transaction = async (pool, callback) => {
  const client = await pool.connect();
  try {
    await client.query('BEGIN');
    const result = await callback(client);
    await client.query('COMMIT');
    logger.success('Transacción completada');
    return result;
  } catch (error) {
    await client.query('ROLLBACK');
    logger.error('Transacción fallida', { error: error.message });
    throw new DatabaseError('Error en transacción de base de datos', error);
  } finally {
    client.release();
  }
};

/**
 * Pagina resultados de una query
 */
export const paginate = async (pool, query, params = [], page = 1, limit = 10) => {
  const offset = (page - 1) * limit;
  
  try {
    // Query con LIMIT y OFFSET
    const dataQuery = `${query} LIMIT $${params.length + 1} OFFSET $${params.length + 2}`;
    const countQuery = query.replace(/SELECT.*FROM/, 'SELECT COUNT(*) FROM');
    
    const [dataResult, countResult] = await Promise.all([
      pool.query(dataQuery, [...params, limit, offset]),
      pool.query(countQuery, params),
    ]);

    const total = parseInt(countResult.rows[0].count);
    const totalPages = Math.ceil(total / limit);

    return {
      data: dataResult.rows,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        totalPages,
        hasNextPage: page < totalPages,
        hasPrevPage: page > 1,
      },
    };
  } catch (error) {
    logger.error('Error en paginate', { error: error.message });
    throw new DatabaseError('Error al paginar resultados', error);
  }
};

/**
 * Ejecuta una query con reintentos automáticos
 */
export const queryWithRetry = async (pool, query, params = [], maxRetries = 3) => {
  let lastError;
  
  for (let i = 0; i < maxRetries; i++) {
    try {
      return await pool.query(query, params);
    } catch (error) {
      lastError = error;
      logger.warn(`Query reintentar (intento ${i + 1}/${maxRetries})`);
      
      // Espera exponencial: 100ms, 200ms, 400ms
      await new Promise(resolve => setTimeout(resolve, Math.pow(2, i) * 100));
    }
  }
  
  throw new DatabaseError('Error en query después de reintentos', lastError);
};
