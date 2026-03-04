import 'dotenv/config';
import app from './app.js';
import { pool } from './db.js';
import config from './config.js';
import { logger } from './utils/logger.js';

// ============= GRACEFUL SHUTDOWN =============
let isShuttingDown = false;

const gracefulShutdown = async () => {
  if (isShuttingDown) return;
  isShuttingDown = true;

  logger.warn('Iniciando shutdown graceful...');

  // Cerrar nuevas conexiones
  server.close(() => {
    logger.info('Servidor HTTP cerrado');
  });

  // Cerrar pool de base de datos
  try {
    await pool.end();
    logger.success('Conexiones a BD cerradas');
  } catch (error) {
    logger.error('Error cerrando BD:', error.message);
  }

  process.exit(0);
};

process.on('SIGTERM', gracefulShutdown);
process.on('SIGINT', gracefulShutdown);

// ============= MANEJO DE EXCEPCIONES NO CAPTURADAS =============
process.on('uncaughtException', (error) => {
  logger.error('Excepción no capturada:', {
    message: error.message,
    stack: error.stack,
  });
  process.exit(1);
});

process.on('unhandledRejection', (reason, promise) => {
  logger.error('Promesa rechazada no manejada:', {
    reason,
    promise: promise.toString(),
  });
});

// ============= INICIO DEL SERVIDOR =============
const startServer = async () => {
  try {
    // Verificar conexión a BD
    try {
      const result = await pool.query('SELECT NOW()');
      logger.success('Conexión a BD establecida', {
        database: config.DB_NAME,
        host: config.DB_HOST,
      });
    } catch (dbError) {
      throw new Error(`No se pudo conectar a la BD: ${dbError.message}`);
    }

    // Iniciar servidor
    const server = app.listen(config.PORT, () => {
      logger.success('Servidor iniciado', {
        port: config.PORT,
        environment: config.NODE_ENV,
        url: `http://localhost:${config.PORT}`,
      });
      logger.info('API disponible en:', {
        health: `http://localhost:${config.PORT}/health`,
        api: `http://localhost:${config.PORT}/api`,
      });
    });

    return server;
  } catch (error) {
    logger.error('Error iniciando servidor:', error.message);
    process.exit(1);
  }
};

const server = await startServer();



