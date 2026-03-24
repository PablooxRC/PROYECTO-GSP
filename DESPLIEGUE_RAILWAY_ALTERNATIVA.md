# 🚀 DESPLIEGUE GRATUITO CON RAILWAY (SIN ORACLE)

**Versión simplificada y directa**  
**Tiempo**: 60-90 minutos  
**Costo**: $0 (Free tier de Railway)  
**Alternativa a**: Oracle Cloud

---

## 🎯 VENTAJAS DE RAILWAY SOBRE ORACLE

| Aspecto           | Railway              | Oracle Cloud    |
| ----------------- | -------------------- | --------------- |
| **Facilidad**     | ⭐⭐⭐⭐⭐ Muy fácil | ⭐⭐⭐ Medio    |
| **Configuración** | ⭐⭐⭐⭐ Automática  | ⭐⭐⭐ Manual   |
| **Tiempo setup**  | 30 minutos           | 60 minutos      |
| **Interfaz**      | ⭐⭐⭐⭐⭐ Intuitiva | ⭐⭐⭐ Compleja |
| **Free tier**     | $5/mes + créditos    | Always Free     |

---

## ⏱️ PLAN RÁPIDO

```
[ ] 05 min → Crear cuenta GitHub
[ ] 05 min → Crear cuenta Railway
[ ] 15 min → Conectar repositorio
[ ] 20 min → Configurar BD PostgreSQL
[ ] 10 min → Desplegar backend
[ ] 10 min → Desplegar frontend en Netlify
[ ] 10 min → Verificar que todo funciona
```

---

## 📋 REQUISITOS

```
✅ Proyecto en GitHub (público o privado)
✅ Cuenta GitHub existente
✅ Correo para Railway
✅ Terminal/PowerShell
✅ ~15 minutos de tiempo libre
```

---

## COMANDO-POR-COMANDO

### 1️⃣ ASEGÚRATE QUE TU PROYECTO ESTÉ EN GITHUB

```bash
cd "d:\PROYECTO DE GRADO 2025\Software"

# Verificar que está en GitHub
git remote -v
# Deberías ver: origin  https://github.com/TU_USUARIO/PROYECTO-GSP.git

# Si no está en GitHub aún:
git remote add origin https://github.com/TU_USUARIO/PROYECTO-GSP.git
git branch -M main
git push -u origin main
```

---

### 2️⃣ CREAR CUENTA RAILWAY (5 minutos)

**En navegador:**

```
https://railway.app/
→ Sign Up
→ "Sign in with GitHub" (Autoriza)
→ Crea un nuevo proyecto
```

---

### 3️⃣ CREAR BASE DE DATOS POSTGRESQL EN RAILWAY

**En Dashboard de Railway:**

```
1. Click: "+ Create"
2. Selecciona: "Database"
3. Selecciona: "PostgreSQL"
4. Espera 1-2 minutos a que se cree

✅ Tendrás acceso a:
   - DB_HOST
   - DB_PORT
   - DB_NAME
   - DB_USER
   - DB_PASSWORD
```

**Copiar credenciales:**

En Railway, ve a tu base de datos → "Connect" y copia las credenciales.

---

### 4️⃣ CONECTAR Y CREAR TABLAS

```bash
# En tu máquina local

# Conectar a BD de Railway
psql postgresql://DB_USER:DB_PASSWORD@DB_HOST:DB_PORT/DB_NAME

# Si no tienes psql instalado:
# Windows: Descarga PostgreSQL client desde https://www.postgresql.org/download/windows/
```

**Una vez conectado (en consola psql):**

```bash
# Ejecutar migraciones (desde tu directorio local)
psql postgresql://DB_USER:DB_PASSWORD@DB_HOST:DB_PORT/DB_NAME < database/init.sql

# Ejecutar todas las migraciones
for file in database/migration_*.sql; do
  psql postgresql://DB_USER:DB_PASSWORD@DB_HOST:DB_PORT/DB_NAME < "$file"
done

# ✅ Admin y Patrón creados automáticamente
```

---

### 5️⃣ DESPLEGAR BACKEND EN RAILWAY

**En Dashboard de Railway:**

```
1. Click: "+ Create"
2. Selecciona: "GitHub Repo"
3. Selecciona tu repositorio PROYECTO-GSP
4. Espera a que Railway detecte el proyecto
5. Configura variables de entorno:
```

**Variables de entorno a agregar:**

```
PORT=3000
NODE_ENV=production
DB_HOST=<copiar de PostgreSQL>
DB_PORT=<copiar de PostgreSQL>
DB_NAME=<copiar de PostgreSQL>
DB_USER=<copiar de PostgreSQL>
DB_PASSWORD=<copiar de PostgreSQL>
CORS_ORIGIN=https://tudominio.netlify.app
JWT_SECRET=MiSecretoSuperLargo123!@#$%^&*()
JWT_EXPIRATION=24h
BCRYPT_ROUNDS=10
```

**¿Cómo agregar variables en Railway?**

```
1. En tu servicio Backend → "Variables"
2. Click: "Raw editor"
3. Pega las variables de arriba
4. Railway redeploy automáticamente
```

---

### 6️⃣ OBTENER URL DEL BACKEND

```
En Railway Dashboard:

Backend service → "Deploy" → "Generate Domain"

Verás algo como:
https://proyecto-gsp-production.up.railway.app

(Esta es tu API URL)
```

---

### 7️⃣ ACTUALIZAR FRONTEND CON URL DEL BACKEND

**En tu máquina local:**

```bash
cd "d:\PROYECTO DE GRADO 2025\Software\frontend"

# Abre: src/api/client.js (o donde hagas el baseURL)
# Cambia:
# De: http://localhost:3000
# A:  https://proyecto-gsp-production.up.railway.app

# O crea un .env.production
cat > .env.production << 'EOF'
VITE_API_URL=https://proyecto-gsp-production.up.railway.app
EOF
```

---

### 8️⃣ PUSH CAMBIOS A GITHUB

```bash
cd "d:\PROYECTO DE GRADO 2025\Software"

git add .
git commit -m "Configurar API URL para producción"
git push origin main
```

---

### 9️⃣ DESPLEGAR FRONTEND EN NETLIFY

**En navegador:**

```
https://netlify.com
→ Sign Up with GitHub
→ Add new site → Import an existing project
→ Select: PROYECTO-GSP
→ Build settings:
   Build command: cd frontend && npm run build
   Publish directory: frontend/dist
→ Deploy
```

**Espera 2-3 minutos... ✅ ¡Frontend Online!**

URL: `https://scout-app-2025.netlify.app` (o similar)

---

### 🔟 ACTUALIZAR CORS EN BACKEND

**En Railway Dashboard:**

```
Backend → Variables
CORS_ORIGIN=https://scout-app-2025.netlify.app
(Redeploy automático)
```

---

## ✅ VALIDACIÓN

```bash
# Test 1: Backend responde
curl https://proyecto-gsp-production.up.railway.app/health

# Test 2: Login funciona
curl -X POST https://proyecto-gsp-production.up.railway.app/api/login \
  -H "Content-Type: application/json" \
  -d '{"ci":"8637944","password":"admin123"}'

# Test 3: Frontend carga
# Abre: https://scout-app-2025.netlify.app
# ¿Ves el login? ✅ ¡ÉXITO!
```

---

## 📞 URLS Y CREDENCIALES FINALES

```
FRONTEND:         https://scout-app-2025.netlify.app
BACKEND:          https://proyecto-gsp-production.up.railway.app

ADMIN:
  CI:             8637944
  Password:       admin123
  Email:          admin@scouts.com

PATRÓN:
  CI:             1111111
  Password:       patron123
  Email:          patron@scouts.com
```

---

## 🆘 PROBLEMAS COMUNES

### "Cannot connect a la BD desde Railway"

```bash
# Verificar credenciales en Railway Dashboard:
# PostgreSQL → Connect → Copy URL

# Probar conexión local:
psql <URL_de_Railway>

# Si pide password pero no puedes conectar:
# - Firewall de Railway bloquea
# - Credenciales copiadas incorrectamente
# - Reintentar en Railway UI
```

### "CORS error"

```
Railway Backend → Variables
Cambiar: CORS_ORIGIN=https://tudominio.netlify.app
Redeploy automático (2-3 min)
```

### "Frontend no actualiza en Netlify"

```bash
git add .
git commit -m "Cambios"
git push origin main

# Netlify redeploy automático (1-2 min)
# O click: "Trigger deploy" en Netlify Dashboard
```

### "Backend dice 'Deploy failed'"

```
Railway → Backend → Logs
Ver qué error aparece

Causas comunes:
- Falta variable de entorno
- puerto no es 3000
- package.json falta
- src/index.js no existe
```

---

## 💡 VENTAJAS DE RAILWAY

✅ **Setup automático** desde GitHub  
✅ **No requiere SSH**  
✅ **Dashboard visual e intuitivo**  
✅ **Logs en tiempo real**  
✅ **Redeploy automático con git push**  
✅ **BD PostgreSQL incluida**  
✅ **Free tier relativo** ($5/mes + créditos iniciales)

---

## ⚠️ LIMITACIONES DE RAILWAY

❌ Free tier: $5/mes después (pero ofrece $5 crédito inicial)  
❌ Si necesitas 100% gratis perpetuo: Mejor usar Oracle Cloud  
❌ Requiere tarjeta de crédito

---

## 🔄 FLUJO RESUMIDO

```
1. GitHub → Repositorio
   ↓
2. Railway → Crear BD PostgreSQL
   ↓
3. Local → Ejecutar migraciones en BD
   ↓
4. Railway → Conectar Backend con GitHub
   ↓
5. Railway → Agregar variables de entorno
   ↓
6. GitHub → Push cambios frontend
   ↓
7. Netlify → Desplegar frontend
   ↓
8. ✅ ¡ONLINE!
```

---

## 🎯 PRÓXIMOS PASOS

1. **Crear cuenta Railway**: https://railway.app/
2. **Crear BD PostgreSQL**
3. **Desplegar backend**
4. **Desplegar frontend**
5. **Probar login**
6. **¡Celebra! 🎉**

---

## 📊 COSTO ESTIMADO

| Item                    | Precio             |
| ----------------------- | ------------------ |
| BD PostgreSQL (Railway) | $0/mes (free tier) |
| Backend (Railway)       | $5/mes después     |
| Frontend (Netlify)      | $0/mes (free)      |
| Dominio .tk             | $0/12 meses        |
| **TOTAL**               | **~$5/mes**        |

**Nota**: Railway da $5 crédito inicial + $5 gratis mensual, prácticamente gratis durante varios meses.

---

## ✨ ¿POR QUÉ RAILWAY EN LUGAR DE ORACLE?

| Razón                 | Beneficio                                       |
| --------------------- | ----------------------------------------------- |
| **Facilidad**         | No necesitas SSH ni línea de comandos complejos |
| **Velocidad**         | Deploy en 5 minutos vs 60 en Oracle             |
| **UI**                | Dashboard limpio y visual                       |
| **Logs**              | Ver errores en tiempo real sin SSH              |
| **GitHub automation** | Redeploy automático con git push                |

---

## 📚 REFERENCIA RÁPIDA

```bash
# Ver URL del backend
railway service url backend

# Ver logs en tiempo real
railway logs backend

# Agregar variable de entorno
railway variable set CORS_ORIGIN=https://...

# Trigger manual deploy
railway deploy
```

---

**¡Sistema ONLINE en menos de 90 minutos! ⚡**

Próximo: Leer [GUIA_USUARIOS_ADMIN_PATRON.md](GUIA_USUARIOS_ADMIN_PATRON.md) si necesitas cambiar contraseñas.
