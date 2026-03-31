# ✅ CHECKLIST: ANTES DE DESPLEGAR EN VERCEL

## 🔍 Verificación del Repositorio

- [ ] Todos los cambios están committeados:
  ```bash
  git status
  # Debería ser limpio (nothing to commit)
  ```

- [ ] Rama master está actualizada:
  ```bash
  git log --oneline -5
  # Debería mostrar Recent commits
  ```

## 🗄️ Base de Datos

- [ ] Tienes una cuenta en Vercel: https://vercel.com

- [ ] Vas a crear BD Postgres (no necesita hacerlo aún):
  ```
  Dashboard > Storage > Create Database > PostgreSQL
  ```

## 🔐 Secretos y Variables

- [ ] Tienes generado un JWT_SECRET fuerte:
  ```bash
  node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
  ```

- [ ] Tienes un SESSION_SECRET fuerte:
  ```bash
  node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
  ```

- [ ] NO compartiste estos secretos en GitHub ✅

## 📦 Archivos Creados/Modificados

- [ ] `vercel.json` - Configuración de Vercel ✅ Creado
- [ ] `src/db.js` - Soporte para DATABASE_URL ✅ Actualizado
- [ ] `src/config.js` - DATABASE_URL agregado ✅ Actualizado
- [ ] `src/app.js` - CORS dinámico ✅ Actualizado
- [ ] `frontend/src/api/axios.js` - URL dinámica ✅ Actualizado
- [ ] `frontend/.env.development` - Variables dev ✅ Creado
- [ ] `frontend/.env.production` - Variables prod ✅ Creado
- [ ] `.env.local.example` - Ejemplo local ✅ Creado
- [ ] `package.json` - Scripts Vercel ✅ Actualizado

## 📋 Documentación

- [ ] `DESPLIEGUE_VERCEL_POSTGRES.md` - Guía completa ✅ Creado
- [ ] `DESPLIEGUE_VERCEL_QUICK.md` - Guía rápida ✅ Creado

## 🚀 Horario de Despliegue

### Paso 1: Commit de los cambios
```bash
cd "d:\PROYECTO DE GRADO 2025\Software"
git add .
git commit -m "setup: configure for Vercel deployment with Vercel Postgres"
git push origin master
```

### Paso 2: Crear BD en Vercel (5 min)
1. Ve a: https://vercel.com/dashboard
2. Storage → Create Database → PostgreSQL
3. Nombre: `gsp-production`
4. Copia el CONNECTION STRING

### Paso 3: Agregar proyecto a Vercel (5 min)
1. Ve a: https://vercel.com/new
2. "Import..." → Selecciona PROYECTO-GSP
3. Click Deploy

### Paso 4: Configurar variables (5 min)
En Vercel Dashboard:
- Settings → Environment Variables
- Agrega: DATABASE_URL, JWT_SECRET, SESSION_SECRET, etc.

### Paso 5: Desplegar (5 min)
Click "Deploy" nuevamente después de agregar las variables

### Paso 6: Inicializar BD (5 min)
```bash
npm run vercel:pull
npm run vercel:init-db
```

### Paso 7: Probar (5 min)
Visita: https://gsp.vercel.app

---

## ⚠️ Importante

❌ NO subas estos archivos a GitHub:
- `.env.local`
- `.env.production` (con secretos reales)
- `node_modules/`

✅ Sí subir estos:
- `vercel.json`
- `.env.development`
- `.env.local.example`
- Cambios en código

---

## 📱 Links Útiles

- Vercel Dashboard: https://vercel.com/dashboard
- Vercel Postgres: https://vercel.com/docs/storage/vercel-postgres
- Tu proyecto (después de deploy): https://gsp.vercel.app

---

## 🆘 Si Algo Falla

Revisa: [DESPLIEGUE_VERCEL_POSTGRES.md](DESPLIEGUE_VERCEL_POSTGRES.md) → Sección TROUBLESHOOTING

---

Última verificación: 31 de Marzo de 2026
