# Catálogo de muebles 3D

PWA de catálogo de muebles donde puedes ver cada mueble en 3D y colocarlo a tamaño
real en tu casa con realidad aumentada antes de comprarlo.

## Estructura

| Carpeta | Contenido |
|---|---|
| `back/` | API REST con Spring Boot 4.1.2, Java 21, MySQL, JWT |
| `front/` | PWA con React, Vite y Tailwind CSS |
| `documentacion/` | Estándar, flujo de Git, historias y fases |

## Arrancar en local

1. Copia `.env.example` como `.env` y llena tus valores.
2. Back: `cd back` y `./mvnw spring-boot:run` (API en `http://localhost:8080`, Swagger en `/swagger-ui.html`).
3. Front: `cd front`, `npm install` y `npm run dev` (en `http://localhost:5173`).

## Ramas

`main` (producción) ← `test` (pruebas) ← `develop` (tronco) ← `feat/*`, `fix/*`, `docs/*`, `chore/*`.
Ver `documentacion/git/FLUJO_GIT.md`.
