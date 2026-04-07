import pg from "pg";
import config from "./config.js";

// Soporte para DATABASE_URL (Vercel Postgres) o config individual
const getPoolConfig = () => {
  // Modo 1: DATABASE_URL (Vercel Postgres, Railway, etc.)
  if (config.DATABASE_URL) {
    return {
      connectionString: config.DATABASE_URL,
      ssl:
        config.NODE_ENV === "production"
          ? { rejectUnauthorized: false }
          : false,
      max: config.DB_MAX_CONNECTIONS,
      idleTimeoutMillis: 30000,
      connectionTimeoutMillis: 10000,
    };
  }

  // Modo 2: Configuración individual (desarrollo local)
  return {
    host: config.DB_HOST,
    port: config.DB_PORT,
    user: config.DB_USER,
    password: config.DB_PASSWORD,
    database: config.DB_NAME,
    max: config.DB_MAX_CONNECTIONS,
    ssl: false,
  };
};

export const pool = new pg.Pool(getPoolConfig());

pool.on("connect", () => {
  console.log("✅ Conexión a BD establecida");
});

pool.on("error", (err) => {
  console.error("❌ Error inesperado en pool de BD:", err.message);
});
