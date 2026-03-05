# Guía de Despliegue en Oracle Cloud + Netlify

**Objetivo:** Desplegar Backend + BD en Oracle Cloud (gratis, ilimitado) y Frontend en Netlify manteniendo el admin.

---

## **FASE 1: Oracle Cloud (Backend + PostgreSQL)** ☁️

### 1. Crear Cuenta en Oracle Cloud

- Ve a https://www.oracle.com/cloud/free/
- Click en "Start for Free"
- Completa el registro (tarjeta de crédito no se cobra)

### 2. Crear una Máquina Virtual (VM)

```
Dashboard → Compute → Instances → Create Instance

Configuración:
- Name: scout-app
- Compartment: root
- Image: Ubuntu 22.04 Minimal (Always Free Eligible)
- Shape: Ampere (ARM A1) - Always Free Eligible
- VCPUs: 1
- Memory: 1 GB
- SSH Key: Descarga y guarda tu clave privada
- Public IP: Assign
```

### 3. Conectar a la VM

```bash
# En tu terminal local, conecta con la clave que descargaste
ssh -i tu_clave_privada.key ubuntu@TU_IP_PUBLICA
```

### 4. Actualizar Sistema e Instalar Dependencias

```bash
sudo apt update && sudo apt upgrade -y

# Instalar Node.js
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
sudo apt install -y nodejs npm

# Instalar PostgreSQL
sudo apt install -y postgresql postgresql-contrib

# Iniciar PostgreSQL
sudo systemctl start postgresql
sudo systemctl enable postgresql
```

### 5. Crear Base de Datos

```bash
# Entra a PostgreSQL como usuario postgres
sudo -u postgres psql

# En la consola de psql, ejecuta:
CREATE DATABASE scouts_db;
CREATE USER scout_user WITH PASSWORD 'tu_contraseña_super_fuerte';
ALTER ROLE scout_user SET client_encoding TO 'utf8';
ALTER ROLE scout_user SET default_transaction_isolation TO 'read committed';
ALTER ROLE scout_user SET timezone TO 'UTC';
GRANT ALL PRIVILEGES ON DATABASE scouts_db TO scout_user;
\q
```

### 6. Clonar el Proyecto

```bash
cd /home/ubuntu
git clone https://github.com/PablooxRC/PROYECTO-GSP.git scout-app
cd scout-app

# Instalar dependencias
npm install
```

### 7. Ejecutar Migraciones de BD

```bash
# Conectar a la BD como scout_user
psql -h localhost -U scout_user -d scouts_db < database/init.sql

# Ejecutar migraciones en orden
psql -h localhost -U scout_user -d scouts_db < database/migration_scouts_campos_nuevos.sql
psql -h localhost -U scout_user -d scouts_db < database/migration_create_registros_table.sql
psql -h localhost -U scout_user -d scouts_db < database/migration_add_fields_dirigente.sql
psql -h localhost -U scout_user -d scouts_db < database/migration_add_is_admin_dirigente.sql
psql -h localhost -U scout_user -d scouts_db < database/migration_add_envio_field.sql
psql -h localhost -U scout_user -d scouts_db < database/migration_add_envio_dirigente.sql
psql -h localhost -U scout_user -d scouts_db < database/migration_change_envio_type.sql
psql -h localhost -U scout_user -d scouts_db < database/migration_create_report_logs.sql
psql -h localhost -U scout_user -d scouts_db < database/migration_add_create_at_scouts.sql
```

### 8. ⭐ CREAR EL ADMIN (Paso Crítico)

```bash
npm run seed
```

**Output esperado:**

```
✅ Admin creado correctamente:
   CI: 8637944
   Nombre: Pablo Rodriguez Castro
   Email: pabloox73@gmail.com
   Password: admin123 (CAMBIAR EN PRODUCCIÓN)
```

### 9. Crear archivo `.env`

```bash
nano .env
```

Pega esto:

```
NODE_ENV=production
PORT=3000
DATABASE_URL=postgresql://scout_user:tu_contraseña_super_fuerte@localhost:5432/scouts_db
SMTP_USER=tu_email@gmail.com
SMTP_PASS=tu_app_password_gmail
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
FROM_EMAIL=tu_email@gmail.com
```

**Ctrl+O → Enter → Ctrl+X** para guardar

### 10. Instalar PM2 (para que corra siempre)

```bash
sudo npm install -g pm2

# Iniciar la aplicación
pm2 start npm --name "scout-app" -- start

# Hacer que inicie automáticamente
pm2 startup
pm2 save
```

### 11. Abrir Puertos en Firewall

```bash
sudo iptables -I INPUT -p tcp -m tcp --dport 3000 -j ACCEPT
sudo iptables -I INPUT -p tcp -m tcp --dport 80 -j ACCEPT
sudo iptables -I INPUT -p tcp -m tcp --dport 443 -j ACCEPT

# Guardar reglas
sudo netfilter-persistent save
```

### 12. Obtener URL del Backend

```bash
# Ve al Dashboard de Oracle Cloud
# Haz click en tu instancia
# Copia la IP Pública

# Tu backend estará en:
http://TU_IP_PUBLICA:3000
```

---

## **FASE 2: Netlify (Frontend)** 🚀

### 1. Crear Cuenta en Netlify

- Ve a https://netlify.com
- Click en "Sign up"
- Conecta con GitHub

### 2. Importar Proyecto

- Click en "Add new site" → "Import an existing project"
- Selecciona el repositorio `PablooxRC/PROYECTO-GSP`

### 3. Configurar Build

```
Base directory: frontend
Build command: npm run build
Publish directory: frontend/dist
```

### 4. Agregar Variables de Entorno

En Netlify → Site settings → Build & deploy → Environment:

```
VITE_API_URL=http://TU_IP_ORACLE:3000
```

Reemplaza `TU_IP_ORACLE` con la IP pública de tu VM.

### 5. Deploy

- Click en "Deploy site"
- Espera a que termine
- Netlify te dará una URL como `https://tu-app.netlify.app`

---

## **Verificar que Todo Funciona**

### Backend

```bash
curl http://TU_IP_PUBLICA:3000/health
# Deberías ver: {"status":"ok"}
```

### Frontend

- Abre: `https://tu-app.netlify.app`
- Login con:
  - Email: `pabloox73@gmail.com`
  - Password: `admin123`

---

## **Seguridad en Producción**

### ⚠️ CAMBIAR CONTRASEÑA DEL ADMIN

Después de desplegar, **OBLIGATORIO** cambiar la contraseña en la aplicación:

1. Login como admin
2. Ir a Perfil
3. Cambiar contraseña a algo seguro

### Restringir SSH

```bash
sudo nano /etc/ssh/sshd_config
# Cambiar: PermitRootLogin no
# Cambiar: PasswordAuthentication no
sudo systemctl restart ssh
```

### Backup de BD

```bash
# Hacer backup de la base de datos
pg_dump -h localhost -U scout_user scouts_db > scout_app_backup.sql
```

---

## **Comandos Útiles**

### Limpiar BD (excepto admin)

```bash
npm run clean
```

### Recrear admin

```bash
npm run seed
```

### Ver logs del servidor

```bash
pm2 logs scout-app
```

### Reiniciar servidor

```bash
pm2 restart scout-app
```

---

## **Costos Finales**

- ✅ Oracle Cloud: **$0** (Always Free)
- ✅ Netlify: **$0** (Plan Free)
- ✅ GitHub: **$0** (Ya tienes el repo)

**TOTAL: $0 ilimitado** 🎉

---

## **Soporte**

Si algo falla:

1. Revisa los logs: `pm2 logs scout-app`
2. Verifica que PostgreSQL esté corriendo: `sudo systemctl status postgresql`
3. Verifica que las migraciones se ejecutaron correctamente

¿Necesitas ayuda en algún paso?
