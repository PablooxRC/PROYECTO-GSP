# ============================================================
# Frontend – React + Vite → Nginx (producción)
# ============================================================

# ---- Etapa 1: build ----
FROM node:22-alpine AS builder
WORKDIR /app

COPY package.json package-lock.json ./
RUN npm ci

COPY . .

# VITE_API_URL se inyecta en tiempo de build via ARG/ENV
ARG VITE_API_URL=/api
ARG VITE_APP_NAME=GSP
ENV VITE_API_URL=$VITE_API_URL
ENV VITE_APP_NAME=$VITE_APP_NAME

RUN npm run build

# ---- Etapa 2: Nginx sirve los estáticos ----
FROM nginx:1.27-alpine AS runner

# Eliminar la config por defecto de nginx
RUN rm /etc/nginx/conf.d/default.conf

COPY --from=builder /app/dist /usr/share/nginx/html
COPY nginx/nginx.conf /etc/nginx/conf.d/app.conf

EXPOSE 80

HEALTHCHECK --interval=30s --timeout=5s --start-period=10s --retries=3 \
  CMD wget -qO- http://localhost/health || exit 1

CMD ["nginx", "-g", "daemon off;"]
