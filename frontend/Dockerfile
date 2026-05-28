# ============================================================
# Frontend – Nginx sirve el dist pre-compilado (producción)
# El dist debe subirse manualmente a ./frontend/dist antes de
# levantar los contenedores. Ver DEPLOY.md para instrucciones.
#
# En producción este Dockerfile NO se usa directamente;
# docker-compose usa la imagen nginx:1.27-alpine con el dist
# montado como volumen. Este archivo queda como referencia
# por si se necesita empaquetar la imagen en otro contexto.
# ============================================================

FROM nginx:1.27-alpine

RUN rm /etc/nginx/conf.d/default.conf

# El dist debe estar en ./frontend/dist en el momento del build
COPY dist /usr/share/nginx/html
COPY ../nginx/nginx.conf /etc/nginx/conf.d/app.conf

EXPOSE 80

HEALTHCHECK --interval=30s --timeout=5s --start-period=10s --retries=3 \
  CMD wget -qO- http://localhost/health || exit 1

CMD ["nginx", "-g", "daemon off;"]
