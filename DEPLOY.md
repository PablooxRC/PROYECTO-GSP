# Guía de despliegue — registros-gsp.cloudnest.lat

Arquitectura en la VPS:

```
Internet (HTTPS 443)
       │
  nginx del VPS  ──SSL termination──▶  127.0.0.1:3201  ──▶  [frontend] nginx:alpine
                                                                   │ red interna gsp_net
                                                                   └──▶  [backend] Node.js :3202
                                                                               │
                                                              host.docker.internal
                                                                               │
                                                                      PostgreSQL (host)
```

---

## 1. Prerequisitos en la VPS

- Docker y Docker Compose Plugin instalados
- nginx instalado en el host (`apt install nginx`)
- Certificado SSL para `registros-gsp.cloudnest.lat` (Let's Encrypt recomendado)
- PostgreSQL corriendo en el host

---

## 2. Estructura de archivos en la VPS

Clonar o copiar el proyecto en la VPS. Árbol mínimo necesario:

```
/opt/gsp/
├── docker-compose.yml
├── Dockerfile              ← backend
├── .env.production
├── src/                    ← código del backend
├── package.json
├── package-lock.json
├── nginx/
│   └── nginx.conf          ← config del nginx del contenedor frontend
└── frontend/
    └── dist/               ← subir aquí el build de React
```

---

## 3. Subir el dist del frontend

Desde tu máquina local, después de ejecutar `npm run build` en `frontend/`:

```bash
# Opción A – rsync (recomendado)
rsync -avz --delete frontend/dist/ usuario@tu-vps:/opt/gsp/frontend/dist/

# Opción B – scp
scp -r frontend/dist usuario@tu-vps:/opt/gsp/frontend/
```

> El dist se monta como volumen en el contenedor; **no hace falta reconstruir la imagen** al actualizar el frontend.  
> Después de subir el dist, ejecutar: `docker compose exec frontend nginx -s reload`

---

## 4. Configurar el archivo de entorno

En la VPS, copiar o editar `/opt/gsp/.env.production`:

```env
NODE_ENV=production
PORT=3202

DB_HOST=host.docker.internal
DB_PORT=5432
DB_NAME=gsp_DB
DB_USER=gspUser
DB_PASSWORD=<contraseña_real>

JWT_SECRET=<secreto_seguro>
JWT_EXPIRATION=24h

CORS_ORIGIN=https://registros-gsp.cloudnest.lat
API_BASE_URL=https://registros-gsp.cloudnest.lat/api
FRONTEND_URL=https://registros-gsp.cloudnest.lat

RATE_LIMIT_WINDOW_MS=15000
RATE_LIMIT_MAX_REQUESTS=100
BCRYPT_ROUNDS=10
SESSION_SECRET=<secreto_seguro>
```

---

## 5. Configurar nginx del VPS

Crear el archivo `/etc/nginx/sites-available/registros-gsp.cloudnest.lat`:

```nginx
# Redirigir HTTP → HTTPS
server {
    listen 80;
    listen [::]:80;
    server_name registros-gsp.cloudnest.lat;
    return 301 https://$host$request_uri;
}

server {
    listen 443 ssl http2;
    listen [::]:443 ssl http2;
    server_name registros-gsp.cloudnest.lat;

    ssl_certificate     /etc/letsencrypt/live/registros-gsp.cloudnest.lat/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/registros-gsp.cloudnest.lat/privkey.pem;
    ssl_protocols       TLSv1.2 TLSv1.3;
    ssl_ciphers         HIGH:!aNULL:!MD5;
    ssl_session_cache   shared:SSL:10m;

    # Límite de tamaño de body (ajustar si se suben archivos)
    client_max_body_size 10M;

    # Todo el tráfico → contenedor frontend (que internamente proxea /api/ al backend)
    location / {
        proxy_pass         http://127.0.0.1:3201;
        proxy_http_version 1.1;
        proxy_set_header   Host              $host;
        proxy_set_header   X-Real-IP         $remote_addr;
        proxy_set_header   X-Forwarded-For   $proxy_add_x_forwarded_for;
        proxy_set_header   X-Forwarded-Proto $scheme;
        proxy_set_header   Upgrade           $http_upgrade;
        proxy_set_header   Connection        "upgrade";
        proxy_read_timeout 60s;
        proxy_connect_timeout 10s;
    }
}
```

Activar y recargar:

```bash
ln -s /etc/nginx/sites-available/registros-gsp.cloudnest.lat \
      /etc/nginx/sites-enabled/

nginx -t && systemctl reload nginx
```

---

## 6. Levantar los contenedores

```bash
cd /opt/gsp

# Primera vez – construir imagen del backend y levantar
docker compose up -d --build

# Ver logs
docker compose logs -f

# Verificar que ambos contenedores estén corriendo
docker compose ps
```

Resultado esperado:

```
NAME               STATUS          PORTS
scouts_backend     Up (healthy)
scouts_frontend    Up (healthy)    127.0.0.1:3201->80/tcp
```

---

## 7. Actualizar el backend

```bash
# 1. Subir los archivos nuevos de src/ a la VPS
rsync -avz src/ usuario@tu-vps:/opt/gsp/src/

# 2. Reconstruir y reiniciar solo el backend
cd /opt/gsp
docker compose up -d --build backend
```

---

## 8. Actualizar el frontend (nuevo dist)

```bash
# 1. Build local
cd frontend && npm run build

# 2. Subir dist
rsync -avz --delete dist/ usuario@tu-vps:/opt/gsp/frontend/dist/

# 3. Recargar nginx del contenedor (sin reiniciar el contenedor)
docker compose exec frontend nginx -s reload
```

---

## 9. Comandos útiles

```bash
# Detener todo
docker compose down

# Ver logs del backend
docker compose logs -f backend

# Ver logs del frontend
docker compose logs -f frontend

# Reiniciar un servicio específico
docker compose restart backend

# Inspeccionar uso de recursos
docker stats scouts_backend scouts_frontend
```

---

## 10. Obtener certificado SSL con Certbot (si no se tiene aún)

```bash
apt install certbot python3-certbot-nginx -y

certbot --nginx -d registros-gsp.cloudnest.lat

# Renovación automática (ya la configura certbot, verificar con):
systemctl status certbot.timer
```

---

## Notas de recursos

| Servicio | RAM máx. | CPU máx. |
| -------- | -------- | -------- |
| backend  | 1 GB     | 1 %      |
| frontend | 1 GB     | 1 %      |

> El límite de 1 % de CPU se aplica sobre **un núcleo físico**.  
> Si la API recibe mucha carga simultánea, considera aumentar el límite de CPU en `docker-compose.yml` (`cpus: "0.5"` = 50 % de un núcleo).
