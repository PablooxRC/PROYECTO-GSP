# 🚀 DESPLIEGUE VERCEL + VERCEL POSTGRES (Gratuito Para Siempre)

**Tiempo total**: 45-60 minutos  
**Costo**: $0 USD POR SIEMPRE  
**Dificultad**: ⭐⭐ (Intermedio)

---

## ✅ LO QUE LOGRARÁS

```
┌──────────────────────────────────────────────────┐
│ TU SISTEMA EN:                                   │
│                                                  │
│ 🌐 Frontend React:   tu-app.vercel.app          │
│ 🔌 Backend Node.js:  api.tu-app.vercel.app      │
│ 🗄️  BD PostgreSQL:   Vercel Postgres (gratis)   │
│                                                  │
│ TOTAL: $0 USD, Para Siempre                     │
└──────────────────────────────────────────────────┘
```

---

## 📋 REQUISITOS PREVIOS

- [ ] Cuenta en GitHub (https://github.com)
- [ ] Git instalado en tu máquina
- [ ] Proyecto committeado en GitHub
- [ ] Cuenta en Vercel (https://vercel.com) → Conectar con GitHub

---

## 🎯 PASO 1: PREPARAR TU REPOSITORIO

### 1.1 Crear estructura Vercel

Vercel requiere que el backend esté en carpeta `api/`:

```bash
# Desde la raíz del proyecto
cd d:\PROYECTO DE GRADO 2025\Software

# Crear carpeta para servidor Express
mkdir -p api
```

### 1.2 Mover archivos del servidor

```bash
# Copiar todo el contenido de src/ a api/
# MANTÉN el src/ original por si acaso

# Copia estos archivos:
cp -r src/* api/
cp package.json api/
cp database/ api/ -r
cp scripts/ api/ -r
```

### 1.3 Crear `api/index.js` (punto de entrada para Vercel)

Este archivo será el que Vercel ejecute:

```bash
# El contenido será similar a src/index.js, pero optimizado para serverless
```

### 1.4 Actualizar `api/package.json`

Solo el backend necesita estas dependencias en `api/`:

```json
{
  "name": "gsp-api",
  "version": "1.0.0",
  "type": "module",
  "scripts": {
    "dev": "nodemon index.js",
    "start": "node index.js"
  },
  "dependencies": {
    "express": "^4.21.2",
    "cors": "^2.8.5",
    "dotenv": "^16.1.4",
    "pg": "^8.15.6",
    "jsonwebtoken": "^9.0.2",
    "bcrypt": "^6.0.0",
    "cookie-parser": "^1.4.7",
    "morgan": "^1.10.0",
    "nodemailer": "^6.9.4",
    "axios": "^1.11.0",
    "uuid": "^13.0.0",
    "zod": "^3.24.4"
  },
  "devDependencies": {
    "nodemon": "^3.1.10"
  }
}
```

### 1.5 Crear `vercel.json` (configuración de Vercel)

En la raíz del proyecto:

```json
{
  "version": 2,
  "buildCommand": "cd frontend && npm install && npm run build",
  "public": "frontend/dist",
  "functions": {
    "api/**/*.js": {
      "memory": 1024,
      "maxDuration": 30
    }
  },
  "env": {
    "NODE_ENV": "production"
  },
  "rewrites": [
    {
      "source": "/api/(.*)",
      "destination": "/api"
    }
  ]
}
```

---

## 🗄️ PASO 2: CREAR VERCEL POSTGRES

### 2.1 Ir a Vercel Console

1. Abre https://vercel.com
2. Inicia sesión con tu cuenta GitHub
3. Ve a **Storage** (en la barra lateral)

### 2.2 Crear BD PostgreSQL

1. Click en **"Create Database"** → **PostgreSQL**
2. Dale un nombre: `gsp-production`
3. Región: Elige la más cercana a ti
4. **CREATE**

### 2.3 Obtener CONNECTION STRING

1. En la DB recién creada, ve a **"Connect"**
2. Copia la cadena en `.env.local` (tipo PostgreSQL)
3. Debería verse así:
   ```
   postgresql://user:password@host:5432/dbname
   ```

---

## 🔧 PASO 3: CONFIGURAR VARIABLES DE ENTORNO

### 3.1 En Vercel (Production)

1. Ve a tu proyecto en Vercel
2. **Settings** → **Environment Variables**
3. Agrega estas variables:

| Variable         | Valor                                   |
| ---------------- | --------------------------------------- |
| `NODE_ENV`       | `production`                            |
| `DATABASE_URL`   | `postgresql://...` (de Vercel Postgres) |
| `JWT_SECRET`     | `tu-secret-largo-y-seguro`              |
| `SESSION_SECRET` | `tu-otro-secret`                        |
| `CORS_ORIGIN`    | `https://tu-app.vercel.app`             |
| `LOG_LEVEL`      | `info`                                  |
| `PORT`           | `3000`                                  |

### 3.2 Variables locales para desarrollo

Crea `.env.local` en la raíz:

```env
NODE_ENV=development
PORT=3000
DATABASE_URL=postgresql://user:password@...
JWT_SECRET=dev-secret-123
SESSION_SECRET=dev-session-456
CORS_ORIGIN=http://localhost:5173
LOG_LEVEL=debug
VERCEL_URL=http://localhost:3000
```

---

## 📦 PASO 4: ACTUALIZAR CONFIGURACIÓN EXPRESS

### 4.1 Modificar `api/app.js`

Agregar soporte para URLs dinámicas:

```javascript
import config from "./config.js";

// Detectar URL dinámicamente
const FRONTEND_URL = process.env.VERCEL_URL
  ? `https://${process.env.VERCEL_URL}`
  : config.CORS_ORIGIN;

const VERCEL_ENVIRONMENT = process.env.VERCEL_ENV || "development";

// CORS mejorado
app.use(
  cors({
    origin: FRONTEND_URL,
    credentials: true,
    methods: ["GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
    maxAge: 86400,
  }),
);

// Health check para Vercel
app.get("/api/health", (req, res) => {
  res.json({
    status: "ok",
    environment: VERCEL_ENVIRONMENT,
    timestamp: new Date().toISOString(),
  });
});
```

### 4.2 Modificar `api/db.js`

Asegurar que el pool de conexiones no se bloquee:

```javascript
import pg from "pg";
const { Pool } = pg;

const connectionConfig = {
  connectionString: process.env.DATABASE_URL,
  ssl:
    process.env.NODE_ENV === "production"
      ? { rejectUnauthorized: false }
      : false,
  max: 20,
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 2000,
};

export const pool = new Pool(connectionConfig);

pool.on("error", (err) => {
  console.error("Error en pool inesperado:", err);
});

export default pool;
```

### 4.3 Modificar `api/config.js`

```javascript
export default {
  NODE_ENV: process.env.NODE_ENV || "development",
  PORT: process.env.PORT || 3000,
  DATABASE_URL: process.env.DATABASE_URL,
  JWT_SECRET: process.env.JWT_SECRET,
  SESSION_SECRET: process.env.SESSION_SECRET,
  CORS_ORIGIN: process.env.CORS_ORIGIN || "http://localhost:5173",
  LOG_LEVEL: process.env.LOG_LEVEL || "info",
  API_URL: process.env.VERCEL_URL
    ? `https://${process.env.VERCEL_URL}/api`
    : `http://localhost:${process.env.PORT || 3000}/api`,
};
```

---

## 🎨 PASO 5: CONFIGURAR FRONTEND

### 5.1 Variables de entorno del Frontend

En `frontend/.env.production`:

```env
VITE_API_URL=https://tu-app.vercel.app/api
VITE_APP_NAME=GSP
```

En `frontend/.env.development`:

```env
VITE_API_URL=http://localhost:3000/api
VITE_APP_NAME=GSP (Dev)
```

### 5.2 Usar variables en Frontend

En `frontend/src/utils/api.js` (o similar):

```javascript
const API_URL = import.meta.env.VITE_API_URL;

export const apiClient = axios.create({
  baseURL: API_URL,
  withCredentials: true,
});
```

---

## 🔄 PASO 6: SUBIR A GITHUB

```bash
# Desde la raíz del proyecto
git add .
git commit -m "chore: configure for Vercel deployment with Vercel Postgres"
git push origin master
```

---

## 🌐 PASO 7: DESPLEGAR EN VERCEL

### 7.1 Conectar Vercel con GitHub

1. Ve a https://vercel.com/new
2. Selecciona **"Import Git Repository"**
3. Conecta tu repositorio de GitHub
4. Vercel detectará automáticamente el `vercel.json`

### 7.2 Configurar Proyecto

- **Project Name**: `gsp` (o como prefieras)
- **Framework**: Node.js
- **Root Directory**: `./`
- **Build Command**: (debería estar en vercel.json) `cd frontend && npm install && npm run build`
- **Output Directory**: `frontend/dist`

### 7.3 Agregar Variables de Entorno

En el panel de Vercel, **Environment Variables**:

```
DATABASE_URL = postgresql://...
JWT_SECRET = tu-secret
SESSION_SECRET = tu-session-secret
CORS_ORIGIN = https://gsp.vercel.app
LOG_LEVEL = info
```

### 7.4 Deploy

Click en **Deploy** y espera ~3-5 minutos

---

## ✅ PASO 8: INICIALIZAR BASE DE DATOS

### 8.1 Ejecutar migraciones en Vercel Postgres

Una vez desplegado:

```bash
# Opción 1: Usar scripts locales (conectarse a BD remota)
VERCEL_POSTGRES_URL="tu-connection-string" npm run seed

# Opción 2: Usar Vercel CLI
npm install -g vercel
vercel env pull .env.local
npm run seed
```

### 8.2 Verificar con Query Editor

En Vercel Postgres > Query Editor:

```sql
SELECT COUNT(*) FROM scouts;
SELECT COUNT(*) FROM usuarios;
```

---

## 🧪 PASO 9: TESTEAR

### Local

```bash
# Terminal 1: Backend
cd api
npm install
npm run dev

# Terminal 2: Frontend
cd frontend
npm install
npm run dev

# Visita http://localhost:5173
```

### Production

1. Ve a `https://tu-app.vercel.app`
2. Prueba registro e inicio de sesión
3. Verifica en Vercel Logs que no haya errores

---

## 📊 PASO 10: MONITOREO

### Ver logs

```bash
# Abrir logs en tiempo real
vercel logs <project-name> --follow
```

### Verificar health check

```bash
curl https://tu-app.vercel.app/api/health
```

Debería responder:

```json
{
  "status": "ok",
  "environment": "production",
  "timestamp": "2026-03-31T..."
}
```

---

## 💰 LÍMITES VERCEL FREE TIER

| Recurso              | Límite           | Suficiente para              |
| -------------------- | ---------------- | ---------------------------- |
| **Despliegues/mes**  | Ilimitados       | ✅ Desarrollo                |
| **Bandwidth**        | 100 GB/mes       | ✅ Algunos miles de usuarios |
| **Functions**        | 100 GB-horas/mes | ✅ Aplicación normal         |
| **Postgres Storage** | 3 x 256 MB       | ✅ ~10k registros            |
| **Uptime**           | 99.95%           | ✅ Producción                |
| **Domains**          | 1 gratis         | ✅ vercel.app                |
| **Custom Domain**    | Sí, + costo DNS  | 💸 ~$10-15/año               |

### Vercel Postgres Free

| Recurso            | Límite         | Suficiente para      |
| ------------------ | -------------- | -------------------- |
| **Bases de datos** | 3 gratis       | ✅ Prod + staging    |
| **Storage/BD**     | 256 MB         | ✅ ~10,000 registros |
| **Conexiones**     | 20 simultáneas | ✅ Desarrollo        |
| **Backups**        | Automáticos    | ✅ Diarios           |

---

## 🆘 TROUBLESHOOTING

### Error: "Cannot find module"

```bash
# En api/, reinstalar dependencias
rm -rf node_modules
npm install
```

### Error: "Connection refused" (BD)

1. Verifica `DATABASE_URL` en Vercel Environment
2. Confirma SSL en `db.js`: `ssl: { rejectUnauthorized: false }`
3. Prueba conexión local: `psql <DATABASE_URL>`

### Error: "CORS error"

Verifica `CORS_ORIGIN` coincida con tu dominio Vercel:

```javascript
// Debería ser exactamente esto:
// https://tu-app.vercel.app
```

### Frontend carga pero API no responde

1. Verifica `VITE_API_URL` en frontend
2. Revisa que sea: `https://tu-app.vercel.app/api`
3. Prueba: `curl https://tu-app.vercel.app/api/health`

### BD vacía después del despliegue

Las migraciones no se ejecutan automáticamente:

```bash
# Opción 1: Seed script
vercel env pull .env.local
npm run seed

# Opción 2: Query Editor en Vercel
# Copia/pega tu SQL de init.sql
```

---

## 🎉 LISTO!

Tu app ahora está:

✅ **Online las 24/7**  
✅ **Con BD persistente en PostgreSQL**  
✅ **Escalable automáticamente**  
✅ **Sin costar nada**  
✅ **Con respaldos automáticos**

---

## 📚 DOCUMENTOS RELACIONADOS

- [00_EMPIEZA_AQUI.md](00_EMPIEZA_AQUI.md) – Visión general
- [DESPLIEGUE_GRATIS_INICIO.md](DESPLIEGUE_GRATIS_INICIO.md) – Otras opciones
- [PROBLEMAS_Y_SOLUCIONES.md](PROBLEMAS_Y_SOLUCIONES.md) – Debugging

---

## 💡 TIPS ADVANCED

### Custom Domain

```bash
# Agregar dominio personalizado
vercel domains add tu-dominio.com

# Luego configurar DNS (en tu proveedor)
#  A record → 76.76.19.0
```

### Environment por rama (staging)

```bash
# Preview deployment automático en cada PR
# Vercel lo hace por defecto!
```

### Database backups

```bash
# Vercel lo hace automáticamente
# Puedes descargar en: Vercel console > Postgres > Backups
```
