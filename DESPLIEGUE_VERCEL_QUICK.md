# 🚀 DESPLIEGUE VERCEL PASO A PASO (30 MIN)

## ⚡ QUICK START

### 1. Preparar repositorio

```bash
cd "d:\PROYECTO DE GRADO 2025\Software"

# Si no has hecho commit, hacerlo ahora:
git add .
git commit -m "setup: prepare for Vercel deployment"
git push origin master
```

### 2. Crear archivo de configuración

✅ **Ya creado**: `vercel.json` en la raíz

### 3. Configurar Vercel

```
https://vercel.com
↓
"Add New..." → "Project"
↓
"Import from Git Repository"
↓
Busca y selecciona: PROYECTO-GSP
```

### 4. Configurar Base de Datos (3 min)

En el panel de Vercel:

**Storage** → **Create Database** → **PostgreSQL**

- Nombre: `gsp-production`
- Región: Más cercana a ti
- **CREATE**

### 5. Variables de Entorno (2 min)

**Settings** → **Environment Variables**

Copiar-pegar estas tres variables en su valor:

```
DATABASE_URL = (copiar de Vercel Postgres > .env > PostgreSQL)
JWT_SECRET = gsp_jwt_prod_2026_$(date +%s)
SESSION_SECRET = gsp_session_prod_2026_$(date +%s)
```

Actualizar las variables:

```
NODE_ENV=production
CORS_ORIGIN=https://gsp.vercel.app
LOG_LEVEL=info
```

### 6. Deploy (5 min)

Click en **Deploy** en Vercel

✅ Cuando vea "Deployment completed"...

### 7. Inicializar BD (2 min)

```bash
# En local, conectarse a la BD remota:
npm install -g vercel
vercel env pull .env.local
cat .env.local | grep DATABASE_URL

# Luego ejecutar seeds:
VERCEL_POSTGRES_URL="$(cat .env.local | grep DATABASE_URL | cut -d= -f2)" npm run seed
```

### 8. Testear (2 min)

Visita: `https://gsp.vercel.app`

✅ Debería verse tu app!

---

## 🔗 Resultados Esperados

```
✅ Frontend:   https://gsp.vercel.app
✅ API:        https://gsp.vercel.app/api
✅ Health:     https://gsp.vercel.app/api/health
✅ BD:         PostgreSQL en Vercel
```

---

## 📞 ¿Problemas?

Ver: [DESPLIEGUE_VERCEL_POSTGRES.md](DESPLIEGUE_VERCEL_POSTGRES.md) → Sección TROUBLESHOOTING
