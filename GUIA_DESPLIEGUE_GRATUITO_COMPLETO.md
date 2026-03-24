# 🚀 GUÍA COMPLETA: DESPLIEGUE GRATUITO DEL SISTEMA

**Fecha**: 24 de Marzo de 2026  
**Costo Total**: $0 USD (100% Gratis, sin tarjeta de crédito requerida)  
**Tiempo Total**: 2-3 horas

---

## 📋 OPCIONES DE DESPLIEGUE GRATUITO

| Componente       | Mejor Opción                          | Alternativa          |
| ---------------- | ------------------------------------- | -------------------- |
| **Backend + BD** | Oracle Cloud (Ampere A1 + PostgreSQL) | Railway ($5/mes)     |
| **Frontend**     | Netlify (rama automática)             | Vercel (muy similar) |
| **Domain**       | Gratuito de Oracle + Netlify          | Usar .tk (Freenom)   |

---

# OPCIÓN 1️⃣: DESPLIEGUE COMPLETO GRATUITO (RECOMENDADO)

**Plataformas**: Oracle Cloud + Netlify + GitHub  
**Costo**: $0 (Siempre gratis)  
**Disponibilidad**: 99.5% uptime

---

## 📍 FASE 1: PREPARACIÓN (30 minutos)

### Paso 1.1: Requisitos previos

```
✅ Cuenta GitHub (crear si no tienes)
✅ Correo de Gmail o similar
✅ Documentación de tu sistema guardada en GitHub
✅ Acceso a Terminal/PowerShell
✅ Git instalado en tu máquina
```

### Paso 1.2: Push del proyecto a GitHub

```bash
# Si aún no está en GitHub
cd "d:\PROYECTO DE GRADO 2025\Software"

# Inicializar git (si no está hecho)
git init
git add .
git commit -m "Inicial: Sistema de Gestión de Scouts"

# Crear repositorio en GitHub.com y hacer push
git remote add origin https://github.com/TU_USUARIO/PROYECTO-GSP.git
git branch -M main
git push -u origin main
```

---

## ☁️ FASE 2: ORACLE CLOUD (Backend + PostgreSQL)

### Paso 2.1: Crear cuenta Oracle Cloud (Gratis, Sin tarjeta)

1. **Ir a**: https://www.oracle.com/cloud/free/
2. **Click**: "Start for Free"
3. **Llenar**:
   - Correo
   - Contraseña fuerte
   - País: Colombia
   - Empresa (puedes poner tu nombre)
4. **Validar**: Email + teléfono
5. **Crédito**: Recibirás $300 gratis por 30 días (pero la VM Ampere es Always Free)

### Paso 2.2: Crear Máquina Virtual

**Dashboard → Compute → Instances → Create Instance**

```
┌─────────────────────────────────────────┐
│ CONFIGURACIÓN DE LA INSTANCIA            │
├─────────────────────────────────────────┤
│ Name:              scout-app             │
│ Compartment:       root (default)        │
│ Image:             Ubuntu 22.04 Minimal  │
│ Shape:             Ampere (ARM A1)       │
│ VCPUs:             1 (Always Free)       │
│ Memory:            1 GB (Always Free)    │
│ Storage:           50 GB (Free)          │
│ SSH Key:           Generate new keypair  │
│ Public IP:         Assign                │
│ Firewall:          Permitir SSH HTTP     │
└─────────────────────────────────────────┘
```

**⭐ IMPORTANTE: Descarga y guarda tu clave SSH privada** (`scout-app.key`)

### Paso 2.3: Configurar Security Groups

En la página de tu instancia:

1. **VCN Security**: Click en el security list
2. **Add Ingress Rules**:

   ```
   Regla 1:
   - Stateless: ✓
   - Protocolo: TCP
   - Source: 0.0.0.0/0
   - Port Range: 22 (SSH)

   Regla 2:
   - Stateless: ✓
   - Protocolo: TCP
   - Source: 0.0.0.0/0
   - Port Range: 3000 (Node.js)

   Regla 3:
   - Stateless: ✓
   - Protocolo: TCP
   - Source: 0.0.0.0/0
   - Port Range: 5432 (PostgreSQL - si accesos remoto)
   ```

### Paso 2.4: Conectar a la VM por SSH

```powershell
# En PowerShell (Windows)

# 1. Navega a donde guardaste la clave
cd D:\descargas
# (o donde guardaste scout-app.key)

# 2. Cambia permisos (Windows)
icacls scout-app.key /inheritance:r /grant:r "$env:USERNAME:(F)"

# 3. Conecta
ssh -i scout-app.key ubuntu@TU_IP_PUBLICA
# (reemplaza TU_IP_PUBLICA con la IP de tu instancia)
```

**Si estás en Mac/Linux**:

```bash
chmod 600 scout-app.key
ssh -i scout-app.key ubuntu@TU_IP_PUBLICA
```

### Paso 2.5: Actualizar el sistema

```bash
# En la terminal de la VM
sudo apt update && sudo apt upgrade -y
sudo apt install -y curl wget git
```

### Paso 2.6: Instalar Node.js 20

```bash
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
sudo apt install -y nodejs npm

# Verificar
node --version  # v20.x.x
npm --version   # 10.x.x
```

### Paso 2.7: Instalar PostgreSQL

```bash
sudo apt install -y postgresql postgresql-contrib

# Iniciar el servicio
sudo systemctl start postgresql
sudo systemctl enable postgresql  # Para que inicie al rebootear

# Verificar
sudo systemctl status postgresql
```

### Paso 2.8: Crear Base de Datos

```bash
# Entrar a PostgreSQL como usuario postgres
sudo -u postgres psql

# Ejecuta estos comandos EN LA CONSOLA DE PSQL:
```

```sql
-- Crear base de datos
CREATE DATABASE scouts_db;

-- Crear usuario
CREATE USER scout_user WITH PASSWORD 'MiPassword123!Fuerte';

-- Configurar usuario
ALTER ROLE scout_user SET client_encoding TO 'utf8';
ALTER ROLE scout_user SET default_transaction_isolation TO 'read committed';
ALTER ROLE scout_user SET timezone TO 'UTC';

-- Dar permisos
GRANT ALL PRIVILEGES ON DATABASE scouts_db TO scout_user;

-- Salir
\q
```

### Paso 2.9: Clonar el Proyecto

```bash
# Volver a la terminal (bash, no psql)
cd /home/ubuntu
git clone https://github.com/TU_USUARIO/PROYECTO-GSP.git scout-app
cd scout-app

# Instalar dependencias
npm install
```

### Paso 2.10: Crear archivo .env

```bash
# En la VM
nano .env
```

Copia y pega esto (ajusta valores):

```env
# ========== SERVIDOR ==========
PORT=3000
NODE_ENV=production

# ========== BASE DE DATOS ==========
DB_HOST=localhost
DB_PORT=5432
DB_NAME=scouts_db
DB_USER=scout_user
DB_PASSWORD=MiPassword123!Fuerte
DB_MAX_CONNECTIONS=10

# ========== JWT SEGURIDAD ==========
JWT_SECRET=TuSuperSecretoLargo123!@#$%^&*()
JWT_EXPIRATION=24h

# ========== FRONTEND ==========
CORS_ORIGIN=https://tudominio.netlify.app

# ========== EMAIL (opcional) ==========
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USER=tu_email@gmail.com
EMAIL_PASSWORD=tu_app_password_generada
EMAIL_FROM=noreply@scouts.com

# ========== RATE LIMITING ==========
RATE_LIMIT_WINDOW_MS=15000
RATE_LIMIT_MAX_REQUESTS=100

# ========== OTROS ==========
BCRYPT_ROUNDS=10
SESSION_SECRET=OtroSecretoLargo456!@#$%^&*()
```

Presiona: `Ctrl+X` → `Y` → `Enter` para guardar

### Paso 2.11: Ejecutar Migraciones BD

```bash
cd /home/ubuntu/scout-app

# Ejecutar script de inicialización
psql -h localhost -U scout_user -d scouts_db < database/init.sql

# Ejecutar todas las migraciones
for file in database/migration_*.sql; do
  echo "Ejecutando: $file"
  psql -h localhost -U scout_user -d scouts_db < "$file"
done
```

### Paso 2.12: Crear Usuario Admin

```bash
node scripts/seed_admin.js
```

**Salida esperada:**

```
✅ Admin creado:
   CI: 1234567
   Contraseña: admin123
```

### Paso 2.13: Instalar PM2 (Gestor de procesos)

```bash
sudo npm install -g pm2

# Crear app en PM2
pm2 start src/index.js --name "scout-backend"

# Configurar para que inicie automáticamente
pm2 startup
pm2 save

# Verificar
pm2 list
pm2 logs
```

### Paso 2.14: Obtener IP Pública

```bash
# En la VM
curl ifconfig.me
# Deberías ver algo como: 150.203.35.120
```

**Guarda esta IP**: será tu URL del backend

---

## 🎨 FASE 3: NETLIFY (Frontend React)

### Paso 3.1: Crear cuenta Netlify

1. **Ir a**: https://netlify.com
2. **Sign up → GitHub**
3. **Autorizar** con tu cuenta GitHub

### Paso 3.2: Configurar su frontend

En tu máquina local, abre el archivo de configuración del frontend:

**`frontend/src/utils/api.js`** (o donde configures el baseURL)

```javascript
// Cambiar esto:
const API_BASE_URL = "http://localhost:3000";

// Por tu IP pública de Oracle:
const API_BASE_URL = "http://150.203.35.120:3000";
```

O si tienes un archivo `.env` en frontend:

```env
VITE_API_URL=http://150.203.35.120:3000
```

### Paso 3.3: Push cambios a GitHub

```bash
cd "d:\PROYECTO DE GRADO 2025\Software\frontend"
git add .
git commit -m "Configurar API URL para producción"
git push
```

### Paso 3.4: Conectar Netlify con GitHub

1. En Netlify: **Add new site → Import an existing project**
2. **Choose GitHub** y selecciona tu repositorio
3. **Basic build settings**:
   ```
   Build command:   npm run build
   Publish directory: dist
   ```
4. **Deploy**

**✅ ¡Tu frontend estará en línea en ~2 minutos!**

Ejemplo: `https://scout-app-2025.netlify.app`

### Paso 3.5: Actualizar CORS en Backend

En tu VM (Oracle Cloud):

```bash
# Editar .env
nano .env

# Cambiar CORS_ORIGIN a tu URL de Netlify:
CORS_ORIGIN=https://scout-app-2025.netlify.app

# Guardar y reiniciar PM2
pm2 restart scout-backend
```

---

## 🔐 FASE 4: CONFIGURACIÓN DE SEGURIDAD

### Paso 4.1: SSL/HTTPS para Backend (Gratuito con Let's Encrypt)

```bash
# En la VM Oracle
sudo apt install -y certbot

# Generar certificado
sudo certbot certonly --standalone -d 150.203.35.120

# O si tienes dominio personalizado:
sudo certbot certonly --standalone -d api.tusitio.com
```

### Paso 4.2: Usar Nginx como Proxy Inverso

```bash
# Instalar Nginx
sudo apt install -y nginx

# Crear configuración
sudo nano /etc/nginx/sites-available/scout-backend
```

Pega esto:

```nginx
server {
    listen 80;
    server_name 150.203.35.120;

    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;

        # Headers de seguridad
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}
```

```bash
# Activar
sudo ln -s /etc/nginx/sites-available/scout-backend \
           /etc/nginx/sites-enabled/

# Probar configuración
sudo nginx -t

# Iniciar Nginx
sudo systemctl start nginx
sudo systemctl enable nginx
```

---

## ✅ FASE 5: PRUEBAS

### Paso 5.1: Probar Backend

```bash
# En tu máquina local
curl -X GET http://150.203.35.120:3000/api/health
# Deberías ver: {"status":"ok"}
```

### Paso 5.2: Probar Login

```bash
# Obten un admin existente de BD
curl -X POST http://150.203.35.120:3000/api/login \
  -H "Content-Type: application/json" \
  -d '{"ci":"1234567","password":"admin123"}'

# Respuesta esperada: {"token":"eyJhbG..."}
```

### Paso 5.3: Probar Frontend

- Abre: https://scout-app-2025.netlify.app
- Intenta login con el admin
- Si ves la app → ✅ ¡TODO FUNCIONA!

---

## 📊 FASE 6: DOMINIO PERSONALIZADO (Opcional)

### Opción A: Dominio gratis .tk (Freenom)

1. **Ir a**: https://www.freenom.com
2. **Buscar** dominio (ej: "misitio.tk")
3. **Registrar** gratis por 12 meses
4. **Nameservers**: Cambiar a los de Netlify:
   ```
   dns1.p01.nsone.net
   dns2.p01.nsone.net
   dns3.p01.nsone.net
   dns4.p01.nsone.net
   ```
5. En Netlify: **Site settings → Domain management → Add custom domain**

### Opción B: Usar IP de Oracle como es

- Backend: `http://150.203.35.120:3000`
- Frontend: `https://scout-app-2025.netlify.app` (ya tiene dominio Netlify)

---

## 🛠️ MANTENIMIENTO DIARIO

### Monitoreo (Ver logs)

```bash
# En la VM (SSH)
pm2 logs scout-backend

# Ver estado
pm2 status

# Reiniciar si hay problema
pm2 restart scout-backend
```

### Backup de BD (SEMANAL)

```bash
# En la VM
mkdir -p /home/ubuntu/backups

# Crear backup
pg_dump -h localhost -U scout_user scouts_db > \
  /home/ubuntu/backups/backup_$(date +%Y%m%d).sql

# Descargar a tu máquina
# (desde tu máquina local, NO en la VM)
scp -i scout-app.key ubuntu@150.203.35.120:/home/ubuntu/backups/*.sql \
    ./mis-backups/
```

### Actualizar código

```bash
# En la VM
cd /home/ubuntu/scout-app
git pull origin main
npm install
npm run build
pm2 restart scout-backend
```

---

## 🆘 TROUBLESHOOTING

### ❌ "Error connecting to database"

```bash
# En VM: Verificar PostgreSQL está corriendo
sudo systemctl status postgresql

# Si no está, iniciar:
sudo systemctl start postgresql

# Ver logs
sudo -u postgres psql -d scouts_db -c "SELECT 1;"
```

### ❌ "CORS Error"

```bash
# Editar .env en VM
nano .env

# Verificar CORS_ORIGIN sea correcto
CORS_ORIGIN=https://tudominio.netlify.app

# Reiniciar backend
pm2 restart scout-backend
```

### ❌ "Cannot connect to backend"

```bash
# Verificar firewall en Oracle Cloud
# Dashboard → Networking → Security Lists
# Debe tener regla para puerto 3000

# Verificar PM2 está corriendo
pm2 list

# Si está bajado
pm2 start src/index.js --name "scout-backend"

# Verificar Nginx
sudo systemctl status nginx
```

### ❌ "Frontend no se actualiza en Netlify"

```bash
# En GitHub
git add .
git commit -m "Cambios"
git push

# En Netlify: Auto-deploy hace el resto
# Si no: Dashboard → Deploys → Deploy site
```

---

## 📈 ESTADÍSTICAS DE TU DESPLIEGUE

| Métrica             | Valor                 |
| ------------------- | --------------------- |
| **Costo mes**       | $0                    |
| **Storage Oracle**  | 50 GB Free            |
| **vCPUs Oracle**    | 1 Ampere              |
| **RAM Oracle**      | 1 GB                  |
| **Ancho de banda**  | Ilimitado             |
| **HTTPS Frontend**  | ✅ Incluido (Netlify) |
| **Uptime esperado** | 99.5%                 |
| **Support**         | Comunidad (Gratis)    |

---

## 🎯 PRÓXIMOS PASOS RECOMENDADOS

1. ✅ **Configurar monitoreo** en PM2 Plus (es gratis el nivel básico)
2. ✅ **Habilitar HTTPS en backend** con Let's Encrypt
3. ✅ **Configurar backups automáticos** de BD
4. ✅ **Documentar credenciales** en un lugar seguro
5. ✅ **Enviar a producción** con confianza

---

## 📞 SOPORTE GRATUITO

Si tienes problemas:

1. **Oracle Cloud**: https://forums.oracle.com/
2. **Netlify**: https://community.netlify.com/
3. **PostgreSQL**: https://www.postgresql.org/support/
4. **Node.js**: https://nodejs.org/en/docs/

---

## 📌 RESUMEN DE URLS

```
🌐 Frontend:  https://scout-app-2025.netlify.app
🔌 Backend:   http://150.203.35.120:3000
🗂️ BD Local:  localhost:5432 (solo desde VM)
📊 PM2 Web:   http://150.203.35.120:9615 (si habilitas)
```

---

**¡Tu sistema está 100% LISTO Y GRATUITO! 🎉**

Tiempo total: ~2-3 horas  
Costo total: $0 USD  
Mantenimiento: ~5 minutos/día
