import pg from "pg";
import config from "./config.js";

export const pool = new pg.Pool({
  host: config.DB_HOST,
  port: config.DB_PORT,
  user: config.DB_USER,
  password: config.DB_PASSWORD,
  database: config.DB_NAME,
  max: config.DB_MAX_CONNECTIONS,
});

pool.on("connect", () => {
  console.log("Conexión a BD establecida");
});

pool.on("error", (err) => {
  console.error("Error inesperado en pool de BD:", err.message);
});
