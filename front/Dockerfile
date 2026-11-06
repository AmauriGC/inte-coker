# Imagen del front (PWA). Multietapa: compila con Node y sirve el dist con nginx.
# nginx también reenvía /api y /uploads al back, así página y API comparten origen.

# ---------- 1. Compilación ----------
FROM node:24-alpine AS compilacion
WORKDIR /fuente

COPY package.json package-lock.json ./
RUN npm ci --no-audit --no-fund

COPY . .
# Relativa: el navegador llama a su misma dirección y nginx reenvía al back.
ARG VITE_API_URL=/api
ENV VITE_API_URL=${VITE_API_URL}
RUN npm run build

# ---------- 2. Servidor ----------
FROM nginx:1.27-alpine

# La plantilla se procesa al arrancar: ${BACK_URL} sale del entorno del contenedor.
COPY nginx/default.conf.template /etc/nginx/templates/default.conf.template
COPY --from=compilacion /fuente/dist /usr/share/nginx/html

ENV BACK_URL=http://back:8080
EXPOSE 80

HEALTHCHECK --interval=15s --timeout=5s --start-period=10s --retries=3 \
    CMD wget -qO- http://127.0.0.1/ > /dev/null || exit 1
