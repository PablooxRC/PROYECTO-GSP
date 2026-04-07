import express from "express";
import morgan from "morgan";
import cookieParser from "cookie-parser";
import cors from "cors";

import config from "./config.js";
import { errorHandler, asyncHandler } from "./utils/errorHandler.js";
import { requestLogger } from "./utils/logger.js";
import {
  rateLimitMiddleware,
  strictRateLimitMiddleware,
} from "./utils/rateLimiter.js";
import { successResponse } from "./utils/response.js";
import { isAuth } from "./middlewares/auth.middleware.js";

// Routes
import taskRoutes from "./routes/scout.routes.js";
import authRoutes from "./routes/auth.routes.js";
import registroRoutes from "./routes/registro.routes.js";
import adminRoutes from "./routes/admin.routes.js";
import padronRoutes from "./routes/padron.routes.js";
import {
  signin,
  signup,
  signout,
  profile,
} from "./controllers/auth.controller.js";
import { validateSchema } from "./middlewares/validate.middleware.js";
import { signinSchema, signupSchema } from "./schemas/auth.schema.js";

const app = express();

// ============= MIDDLEWARES GLOBALES =============

// CORS - lista de orígenes permitidos
const allowedOrigins = [
  'https://gsp.vercel.app',
  config.CORS_ORIGIN,
  'http://localhost:5173',
].filter(Boolean);

console.log('🔧 CORS allowed origins:', allowedOrigins);

// CORS mejorado
app.use(
  cors({
    origin: function (origin, callback) {
      // Permitir requests sin origin (ej. mobile, curl, health checks)
      if (!origin) return callback(null, true);
      if (allowedOrigins.includes(origin)) {
        return callback(null, origin);
      }
      console.warn('⚠️ CORS blocked origin:', origin);
      return callback(new Error('Not allowed by CORS'));
    },
    credentials: true,
    methods: ["GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
    maxAge: 86400,
  }),
);

// Loggers
app.use(morgan("dev"));
app.use(requestLogger);

// Body parsers
app.use(cookieParser());
app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true, limit: "10mb" }));

// Rate Limiting (se aplica primero)
app.use(rateLimitMiddleware);

// ============= RUTAS PÚBLICAS =============

// Health Check
app.get(
  "/health",
  asyncHandler((req, res) => {
    return res.json(
      successResponse(
        { timestamp: new Date().toISOString(), uptime: process.uptime() },
        "Servidor en línea",
      ),
    );
  }),
);

// API Home
app.get(
  "/api",
  asyncHandler((req, res) => {
    return res.json(
      successResponse(
        {
          version: "1.0.0",
          name: "Scout Management System API",
          endpoints: {
            auth: "/api/auth",
            scouts: "/api/scouts",
            registros: "/api/registros",
            admin: "/api/admin",
          },
        },
        "Bienvenido a la API",
      ),
    );
  }),
);

// ============= RUTAS PROTEGIDAS =============

// Auth (con Rate Limiting estricto para login/signup)
app.use("/api/auth", strictRateLimitMiddleware, authRoutes);

// COMPATIBILIDAD: Rutas antiguas para mantener frontend funcionando
// /api/signin → /api/auth/signin
app.post(
  "/api/signin",
  strictRateLimitMiddleware,
  validateSchema(signinSchema),
  signin,
);
app.post(
  "/api/signup",
  strictRateLimitMiddleware,
  validateSchema(signupSchema),
  signup,
);
app.post("/api/signout", signout);
app.get("/api/profile", isAuth, profile);

// Scouts
app.use("/api", taskRoutes);

// Registros
app.use("/api/registros", registroRoutes);

// Admin
app.use("/api/admin", adminRoutes);

// Padrón
app.use("/api/padron", padronRoutes);

// ============= MANEJO DE ERRORES =============

// 404 - No encontrado
app.use((req, res) => {
  return res.status(404).json({
    success: false,
    error: {
      code: "NOT_FOUND",
      message: "Ruta no encontrada",
      path: req.path,
      method: req.method,
    },
  });
});

// Error handler global (DEBE SER EL ÚLTIMO)
app.use(errorHandler);

export default app;
