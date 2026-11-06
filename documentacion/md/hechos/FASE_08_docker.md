# FASE 08 · Docker

- Maestro: MAESTRO_proyecto.md
- Estado: Hecho
- Fecha: 06/11/2026
- Traza: práctica de Docker y docker-compose (sin HU de usuario)

## Objetivo

Levantar GC-Confort completo (MySQL, back y front) con un solo comando, igual en la
laptop que en el servidor de Jenkins, sin instalar Java, Node ni MySQL.

## Cambios

- [x] `back/Dockerfile`: multietapa. Compila con `eclipse-temurin:21-jdk` (el `pom` va
  primero para cachear dependencias) y corre con `eclipse-temurin:21-jre-alpine` como
  usuario sin privilegios. Healthcheck a `/actuator/health/readiness`.
- [x] `front/Dockerfile`: multietapa. Compila con `node:24-alpine` (`VITE_API_URL=/api`)
  y sirve el `dist` con `nginx:1.27-alpine`.
- [x] `front/nginx/default.conf.template`: SPA con respaldo a `index.html`; `/api` y
  `/uploads` se reenvían al back (sin cabecera `Origin`, como el proxy de Vite);
  `/assets` inmutable; `sw.js`, `manifest` e `index` sin caché.
- [x] `docker-compose.yml` (raíz): `mysql:8.4` con healthcheck, back y front; volúmenes
  `datos` (base) y `archivos` (subidas). Cada servicio espera a que el anterior esté sano.
- [x] Front: `VITE_API_URL` puede ser relativa (`/api`). `config.js` usa entonces el origen
  de la página, el plugin del SW publica `self.location.origin` y el SW revisa las rutas
  de la API antes que los estáticos (en Docker comparten origen).
- [x] `.dockerignore` en back y front; `.env.example` con `FRONT_PORT` y `BACK_PORT`.

## Cómo se usa

```powershell
docker compose up -d --build      # primera vez o tras cambios
docker compose ps                 # estado y salud
docker compose logs -f back       # logs del back
docker compose down               # apaga (los datos quedan en los volúmenes)
docker compose down -v            # apaga y borra base y archivos
```

| Servicio | Dirección |
|---|---|
| Front (PWA) | `http://localhost:8088` |
| Back (Swagger, health) | `http://localhost:8089/swagger-ui.html` |
| MySQL | Solo dentro de Docker (no choca con el MySQL local en 3306) |

## Decisiones

- **Un solo origen.** nginx reenvía `/api` y `/uploads`, así el front no depende de la IP
  del back ni de CORS, y funciona igual desde el teléfono en la misma red.
- **Pruebas fuera de la imagen.** `./mvnw verify` necesita MySQL; corre en local y en
  Jenkins (fase 9), no dentro del `docker build`.
- **MySQL dentro de Docker** con `DB_PASSWORD` del `.env` como contraseña de root. No se
  publica el puerto para no chocar con el MySQL de la laptop.
- **Variables explícitas.** El compose pasa al back solo las claves que usa, no el `.env`
  completo.

## Pruebas

- `docker compose config`: válido.
- `npm run lint` y `npm run build` (con URL absoluta y relativa) en verde.
- Imágenes: back 415 MB, front 77 MB. Stack arriba con los tres servicios `healthy`, catálogo con 8
  muebles por `http://localhost:8088/api/muebles`, `.glb` servido por nginx (GET) con
  `model/gltf-binary`, rutas de la SPA con `index.html`.
- Login por nginx con un `Origin` de otra IP: responde el back (401 por credenciales), sin
  rechazo de CORS.
- El healthcheck del front usa `127.0.0.1`: en Alpine `localhost` resuelve a IPv6 y nginx
  escucha solo en IPv4.
