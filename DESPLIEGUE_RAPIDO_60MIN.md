# ⚡ GUÍA RÁPIDA: DESPLIEGUE EN 1 HORA

**Versión simplificada y directa al grano**  
**Tiempo**: 60 minutos  
**Costo**: $0

---

## 🎯 PLAN RÁPIDO

```
[ ] 10 min → Crear cuenta Oracle Cloud
[ ] 15 min → Crear VM y conectarse
[ ] 15 min → Instalar Node.js, PostgreSQL, Git
[ ] 10 min → Clonar proyecto y crear BD
[ ] 05 min → Iniciar backend con PM2
[ ] 05 min → Desplegar frontend en Netlify
```

---

## COMANDO-POR-COMANDO

### 1️⃣ ORACLE CLOUD (Preparación)

**En navegador:**

```
https://oracle.com/cloud/free/
→ Sign Up → Complete → Confirmar email
```

**Crear VM:**

```
Compute → Instances → Create Instance
Name: scout-app
Image: Ubuntu 22.04 Minimal
Shape: Ampere A1 (1 vCPU, 1 GB RAM)
SSH Key: Generate and Download
☑ Assign public IP
```

**Obtén**: `TU_IP_PUBLICA`

---

### 2️⃣ CONECTAR A LA VM

**Windows PowerShell**:

```powershell
cd D:\donde\guardaste\la\clave
icacls scout-app.key /inheritance:r /grant:r "$env:USERNAME:(F)"
ssh -i scout-app.key ubuntu@TU_IP_PUBLICA
```

**Mac/Linux**:

```bash
chmod 600 scout-app.key
ssh -i scout-app.key ubuntu@TU_IP_PUBLICA
```

**Ya en la VM**:

```bash
sudo apt update && sudo apt upgrade -y
```

---

### 3️⃣ INSTALAR DEPENDENCIAS (COPIAR Y PEGAR)

```bash
# Node.js
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
sudo apt install -y nodejs npm git

# PostgreSQL
sudo apt install -y postgresql postgresql-contrib
sudo systemctl start postgresql
sudo systemctl enable postgresql

# PM2 (gestor de procesos)
sudo npm install -g pm2
```

---

### 4️⃣ CREAR BASE DE DATOS

```bash
# Conectar a PostgreSQL
sudo -u postgres psql

# PEGA ESTO EN CONSOLA PSQL:
```

```sql
CREATE DATABASE scouts_db;
CREATE USER scout_user WITH PASSWORD 'Scout123!Fuerte';
ALTER ROLE scout_user SET client_encoding TO 'utf8';
ALTER ROLE scout_user SET default_transaction_isolation TO 'read committed';
ALTER ROLE scout_user SET timezone TO 'UTC';
GRANT ALL PRIVILEGES ON DATABASE scouts_db TO scout_user;
\q
```

---

### 5️⃣ CLONAR Y CONFIGURAR PROYECTO

```bash
cd /home/ubuntu
git clone https://github.com/TU_USUARIO/PROYECTO-GSP.git scout-app
cd scout-app
npm install

# Crear .env (reemplaza valores)
cat > .env << 'EOF'
PORT=3000
NODE_ENV=production
DB_HOST=localhost
DB_PORT=5432
DB_NAME=scouts_db
DB_USER=scout_user
DB_PASSWORD=Scout123!Fuerte
CORS_ORIGIN=https://tudominio.netlify.app
JWT_SECRET=MiSecretoSuperLargo123!@#
JWT_EXPIRATION=24h
BCRYPT_ROUNDS=10
EOF

# Ver que se creó bien
cat .env
```

---

### 6️⃣ EJECUTAR MIGRACIONES (Admin + Patrón se crean automáticamente)

```bash
# Migraciones
psql -h localhost -U scout_user -d scouts_db < database/init.sql

# Ejecutar todas las migraciones (incluyendo seed de admin + patrón)
for file in database/migration_*.sql; do
  echo "Ejecutando: $file"
  psql -h localhost -U scout_user -d scouts_db < "$file"
done

# ✅ Admin y Patrón ya creados:
#    - Admin: CI=8637944, Pass=admin123, Email=admin@scouts.com
#    - Patrón: CI=1111111, Pass=patron123, Email=patron@scouts.com
```

---

### 7️⃣ INICIAR BACKEND CON PM2

```bash
# Iniciar
pm2 start src/index.js --name "scout-backend"

# Auto-inicio al rebootear
pm2 startup
pm2 save

# Ver logs
pm2 logs

# Presiona Ctrl+C cuando veas: "✅ Server running on port 3000"
```

---

### 8️⃣ OBTENER IP Y ACTUALIZAR FRONTEND

```bash
# En la VM
curl ifconfig.me
# Deberías ver algo como: 150.203.35.120
```

**En tu máquina local** (`d:\PROYECTO...`):

```bash
cd frontend

# Editar archivo de configuración
# (busca donde hagas la llamada a la API y cambia localhost a la IP)

# Ejemplo: En src/api/client.js o similar
# De: http://localhost:3000
# A:  http://150.203.35.120:3000
```

```bash
# Push a GitHub
git add .
git commit -m "Usar IP de producción"
git push origin main
```

---

### 9️⃣ DESPLEGAR FRONTEND EN NETLIFY

**En navegador:**

```
https://netlify.com
→ Sign Up with GitHub
→ Add new site → Import an existing project
→ Select your repo
→ Build command: npm run build
→ Publish directory: dist
→ Deploy
```

**Espera 2 minutos... ✅ ¡Tu app está en línea!**

Verás URL como: `https://scout-app-2025.netlify.app`

---

### 🔟 ACTUALIZAR CORS EN BACKEND

```bash
# En la VM (SSH)
nano .env

# Cambiar:
# De: CORS_ORIGIN=https://localhost.netlify.app
# A:  CORS_ORIGIN=https://scout-app-2025.netlify.app

# Guardar: Ctrl+X → Y → Enter

# Reiniciar
pm2 restart scout-backend
```

---

## ✅ VALIDAR QUE TODO FUNCIONE

```bash
# Test 1: Backend responde
curl http://150.203.35.120:3000/health

# Test 2: Puedes hacer login (Admin)
curl -X POST http://150.203.35.120:3000/api/login \
  -H "Content-Type: application/json" \
  -d '{"ci":"8637944","password":"admin123"}'

# Test 3: Frontend carga
# Abre: https://scout-app-2025.netlify.app
# ¿Ves la app? ✅ ¡ÉXITO!
```

---

## 📞 CREDENCIALES Y URLS

```
FRONTEND:         https://scout-app-2025.netlify.app
BACKEND:          http://150.203.35.120:3000

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

## 🆘 PROBLEMAS COMUNES (CTRL+F)

### "Cannot connect to VM"

```bash
# En Oracle Cloud Dashboard:
# Compute → Instances → Tu instancia
# Copiar IP pública real y probar:
ssh -i scout-app.key ubuntu@IP_CORRECTA
```

### "database does not exist"

```bash
# En VM, verificar:
sudo -u postgres psql -l
# Deberías ver scouts_db en la lista
```

### "CORS error en browser"

```bash
# En VM:
nano .env
# Cambia CORS_ORIGIN a tu URL real de Netlify
pm2 restart scout-backend
```

### "Cannot GET /health"

```bash
# En VM:
pm2 status
# Si dice "stopped":
pm2 start src/index.js --name "scout-backend"
```

---

## 💡 COMANDOS ÚTILES PARA DESPUÉS

```bash
# Ver logs en tiempo real
pm2 logs

# Ver estado de haces
pm2 status

# Reiniciar si hay problema
pm2 restart scout-backend

# Ver solo errores
pm2 logs scout-backend --err

# Hacer backup de BD
pg_dump -U scout_user scouts_db > backup.sql

# Restaurar backup
psql -U scout_user scouts_db < backup.sql
```

---

## 🎓 RECUERDA

- ✅ **Oracle Cloud**: Siempre Gratis (no vence después de 30 días)
- ✅ **Netlify**: Gratis con auto-deploy desde GitHub
- ✅ **Total**: $0 USD por siempre
- ✅ **Performance**: Excelente para 100-1000 usuarios

---

**¡YA ESTÁ LISTO! 🚀 Tiempo total: 60 minutos**
