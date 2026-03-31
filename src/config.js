/**
 * Configuración centralizada del proyecto
 * Lee de variables de entorno con valores por defecto
 */

const getEnvVariable = (key, defaultValue = null, isRequired = false) => {
  const value = process.env[key] || defaultValue;

  if (!value && isRequired) {
    throw new Error(`Variable de entorno requerida no configurada: ${key}`);
  }

  return value;
};

const config = {
  // Servidor
  PORT: parseInt(getEnvVariable("PORT", "3000")),
  NODE_ENV: getEnvVariable("NODE_ENV", "development"),

  // Base de datos - Vercel Postgres (DATABASE_URL) o local
  DATABASE_URL: getEnvVariable("DATABASE_URL", null),
  DB_HOST: getEnvVariable("DB_HOST", "localhost"),
  DB_PORT: parseInt(getEnvVariable("DB_PORT", "5432")),
  DB_NAME: getEnvVariable("DB_NAME", "postgres"),
  DB_USER: getEnvVariable("DB_USER", "postgres"),
  DB_PASSWORD: getEnvVariable("DB_PASSWORD", "postgres"),
  DB_MAX_CONNECTIONS: parseInt(getEnvVariable("DB_MAX_CONNECTIONS", "10")),

  // JWT
  JWT_SECRET: getEnvVariable("JWT_SECRET", "xyz123"),
  JWT_EXPIRATION: getEnvVariable("JWT_EXPIRATION", "24h"),

  // CORS
  CORS_ORIGIN: getEnvVariable("CORS_ORIGIN", "http://localhost:5173"),
  VERCEL_URL: getEnvVariable("VERCEL_URL", null),

  // Rate Limiting
  RATE_LIMIT_WINDOW_MS: parseInt(
    getEnvVariable("RATE_LIMIT_WINDOW_MS", "15000"),
  ),
  RATE_LIMIT_MAX_REQUESTS: parseInt(
    getEnvVariable("RATE_LIMIT_MAX_REQUESTS", "100"),
  ),

  // Email
  EMAIL_HOST: getEnvVariable("EMAIL_HOST", ""),
  EMAIL_PORT: parseInt(getEnvVariable("EMAIL_PORT", "587")),
  EMAIL_USER: getEnvVariable("EMAIL_USER", ""),
  EMAIL_PASSWORD: getEnvVariable("EMAIL_PASSWORD", ""),
  EMAIL_FROM: getEnvVariable("EMAIL_FROM", "noreply@scouts.com"),

  // Seguridad
  BCRYPT_ROUNDS: parseInt(getEnvVariable("BCRYPT_ROUNDS", "10")),
  SESSION_SECRET: getEnvVariable("SESSION_SECRET", "session-secret-key"),

  // Paginación
  DEFAULT_PAGE_SIZE: parseInt(getEnvVariable("DEFAULT_PAGE_SIZE", "10")),
  MAX_PAGE_SIZE: parseInt(getEnvVariable("MAX_PAGE_SIZE", "100")),

  // Logging
  LOG_LEVEL: getEnvVariable("LOG_LEVEL", "info"),

  // URLs
  API_BASE_URL: getEnvVariable("API_BASE_URL", "http://localhost:3000/api"),
  FRONTEND_URL: getEnvVariable("FRONTEND_URL", "http://localhost:5173"),
};

// Validaciones en desarrollo
if (config.NODE_ENV === "development") {
  console.log("⚙️  Configuración cargada (desarrollo)");
}

// Validaciones en producción
if (config.NODE_ENV === "production") {
  if (config.JWT_SECRET === "xyz123") {
    throw new Error("SEGURIDAD: JWT_SECRET debe cambiar en producción");
  }
  if (config.SESSION_SECRET === "session-secret-key") {
    throw new Error("SEGURIDAD: SESSION_SECRET debe cambiar en producción");
  }
}

export default config;
