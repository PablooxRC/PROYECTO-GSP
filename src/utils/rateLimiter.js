/**
 * Rate Limiting para proteger contra abuso
 * Implementa límite de requests por IP/usuario
 */

import config from '../config.js';
import { AuthenticationError } from './errorHandler.js';

const requestCounts = new Map();

/**
 * Limpia los contadores antiguos cada cierto tiempo
 */
const cleanupOldCounts = () => {
  const now = Date.now();
  for (const [key, data] of requestCounts.entries()) {
    if (now - data.firstRequest > config.RATE_LIMIT_WINDOW_MS) {
      requestCounts.delete(key);
    }
  }
};

setInterval(cleanupOldCounts, config.RATE_LIMIT_WINDOW_MS);

/**
 * Middleware de Rate Limiting
 */
export const rateLimitMiddleware = (req, res, next) => {
  const key = req.userCI || req.ip; // Usa CI del usuario si está autenticado, sino la IP
  const now = Date.now();

  if (!requestCounts.has(key)) {
    requestCounts.set(key, { count: 1, firstRequest: now });
    next();
    return;
  }

  const data = requestCounts.get(key);
  
  // Si pasó la ventana de tiempo, reinicia el contador
  if (now - data.firstRequest > config.RATE_LIMIT_WINDOW_MS) {
    requestCounts.set(key, { count: 1, firstRequest: now });
    next();
    return;
  }

  // Incrementa el contador
  data.count++;

  // Verifica si excede el límite
  if (data.count > config.RATE_LIMIT_MAX_REQUESTS) {
    const retryAfter = Math.ceil((data.firstRequest + config.RATE_LIMIT_WINDOW_MS - now) / 1000);
    
    res.set('Retry-After', retryAfter);
    return res.status(429).json({
      success: false,
      error: {
        code: 'RATE_LIMIT_EXCEEDED',
        message: `Demasiadas solicitudes. Intenta de nuevo en ${retryAfter} segundos`,
        retryAfter,
      },
    });
  }

  next();
};

/**
 * Rate Limiting estricto para endpoints críticos (login, registro)
 */
export const strictRateLimitMiddleware = (req, res, next) => {
  const key = `strict_${req.ip}`;
  const limit = 5; // 5 intentos
  const window = 15000; // 15 segundos
  const now = Date.now();

  if (!requestCounts.has(key)) {
    requestCounts.set(key, { count: 1, firstRequest: now });
    next();
    return;
  }

  const data = requestCounts.get(key);
  
  if (now - data.firstRequest > window) {
    requestCounts.set(key, { count: 1, firstRequest: now });
    next();
    return;
  }

  data.count++;

  if (data.count > limit) {
    const retryAfter = Math.ceil((data.firstRequest + window - now) / 1000);
    
    res.set('Retry-After', retryAfter);
    return res.status(429).json({
      success: false,
      error: {
        code: 'RATE_LIMIT_EXCEEDED',
        message: `Demasiados intentos. Intenta de nuevo en ${retryAfter} segundos`,
        retryAfter,
      },
    });
  }

  next();
};
