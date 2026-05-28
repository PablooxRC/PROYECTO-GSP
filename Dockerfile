# ============================================================
# Backend – Node.js (producción)
# ============================================================

# ---- Etapa 1: dependencias ----
FROM node:22-alpine AS deps
WORKDIR /app

COPY package.json package-lock.json ./
RUN npm ci --omit=dev

# ---- Etapa 2: imagen final ----
FROM node:22-alpine AS runner
WORKDIR /app

ENV NODE_ENV=production

# Usuario sin privilegios para seguridad
RUN addgroup -S appgroup && adduser -S appuser -G appgroup

COPY --chown=appuser:appgroup --from=deps /app/node_modules ./node_modules
COPY --chown=appuser:appgroup src ./src
COPY --chown=appuser:appgroup package.json ./

USER appuser

EXPOSE 3202

HEALTHCHECK --interval=30s --timeout=10s --start-period=20s --retries=3 \
  CMD wget -qO- http://localhost:3202/health || exit 1

CMD ["node", "src/index.js"]
