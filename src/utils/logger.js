/**
 * Logger estructurado para el proyecto
 * Proporciona logs consistentes con timestamp, nivel y contexto
 */

export const LOG_LEVELS = {
  DEBUG: 'DEBUG',
  INFO: 'INFO',
  WARN: 'WARN',
  ERROR: 'ERROR',
  SUCCESS: 'SUCCESS',
};

const COLORS = {
  DEBUG: '\x1b[36m',    // Cyan
  INFO: '\x1b[34m',     // Blue
  WARN: '\x1b[33m',     // Yellow
  ERROR: '\x1b[31m',    // Red
  SUCCESS: '\x1b[32m',  // Green
  RESET: '\x1b[0m',
};

const formatLog = (level, message, data = null) => {
  const timestamp = new Date().toISOString();
  const color = COLORS[level] || COLORS.INFO;
  const reset = COLORS.RESET;

  let output = `${color}[${timestamp}] [${level}]${reset} ${message}`;

  if (data) {
    output += `\n  ${JSON.stringify(data, null, 2)}`;
  }

  return output;
};

export const logger = {
  debug: (message, data = null) => {
    console.log(formatLog(LOG_LEVELS.DEBUG, message, data));
  },

  info: (message, data = null) => {
    console.log(formatLog(LOG_LEVELS.INFO, message, data));
  },

  warn: (message, data = null) => {
    console.warn(formatLog(LOG_LEVELS.WARN, message, data));
  },

  error: (message, data = null) => {
    console.error(formatLog(LOG_LEVELS.ERROR, message, data));
  },

  success: (message, data = null) => {
    console.log(formatLog(LOG_LEVELS.SUCCESS, message, data));
  },
};

/**
 * Middleware para loguear requests
 */
export const requestLogger = (req, res, next) => {
  const startTime = Date.now();

  res.on('finish', () => {
    const duration = Date.now() - startTime;
    const logLevel = res.statusCode >= 500 ? LOG_LEVELS.ERROR : 
                     res.statusCode >= 400 ? LOG_LEVELS.WARN :
                     LOG_LEVELS.SUCCESS;

    logger[logLevel.toLowerCase()](
      `${req.method} ${req.path}`,
      {
        status: res.statusCode,
        duration: `${duration}ms`,
        userCI: req.userCI || 'anonymous',
        ip: req.ip,
      }
    );
  });

  next();
};
