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

## Arrancar con Docker

Con el `.env` lleno, desde la raíz:

```powershell
docker compose up -d --build
```

Front en `http://localhost:8088`, back (Swagger) en `http://localhost:8089/swagger-ui.html`.
MySQL corre dentro de Docker. Detalle en `documentacion/md/hechos/FASE_08_docker.md`.

## Jenkins (integración y despliegue)

```powershell
docker compose -f jenkins/docker-compose.yml --env-file .env up -d --build
```

Jenkins en `http://localhost:8090` (usuario y contraseña: `JENKINS_*` del `.env`). El job
`GC-Confort` revisa `develop`, `test` y `main` cada 2 minutos: corre las pruebas y el build, y
en `test` y `main` despliega solo (`http://localhost:8180` y `http://localhost:8280`).
Detalle en `documentacion/md/hechos/FASE_09_jenkins.md`.

## Ramas

`main` (producción) ← `test` (pruebas) ← `develop` (tronco) ← `feat/*`, `fix/*`, `docs/*`, `chore/*`.
Ver `documentacion/git/FLUJO_GIT.md`.
