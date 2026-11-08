# Documentación — Mapa e índice

> Punto de entrada. Dice qué leer y en qué orden.

## Orden de lectura

| # | Documento | Para qué |
|---|---|---|
| 1 | `README.md` (este) | Mapa |
| 2 | `ESTANDAR.md` | Cómo se documenta (maestro + fases + estados) |
| 3 | `git/FLUJO_GIT.md` | Ramas, PRs y promoción |
| 4 | `git/CONVENCION_COMMITS.md` | Cómo escribir commits |
| 5 | `git/REGLAS_IGNORE.md` | Qué no subir |
| 6 | `back/CONVENCIONES_BACK.md` | Paquetes por módulo, capas, respuestas, errores y pruebas del back |
| 7 | `front/CONVENCIONES_FRONT.md` | Módulos, API, sesión, hooks, alertas y estilos del front |
| 8 | `infra/GUIA_DOCKER_JENKINS.md` | Docker, compose y Jenkins: comandos, flujo de despliegue y cambios comunes |
| 9 | `md/analisis/` | Decisiones pendientes |
| 10 | `md/en_progreso/MAESTRO_proyecto.md` | Objetivo, stack, roles y fases |

## Empezar a trabajar un tema

```
AGENTS.md -> ESTANDAR.md -> git/FLUJO_GIT.md -> md/analisis/
  -> md/pendientes/<fase> -> mover a en_progreso/ -> trabajar -> mover a hechos/
```

## Índice

| Ruta | Contenido |
|---|---|
| `git/` | Reglas de Git |
| `back/` | Convenciones del back |
| `front/` | Convenciones del front |
| `infra/` | Guía de Docker, compose y Jenkins |
| `historias_de_usuario/` | Historias por rol, sus tareas y el tablero |
| `md/pendientes/` | Fases por iniciar |
| `md/en_progreso/` | `MAESTRO_proyecto.md` |
| `md/hechos/` | Fases terminadas (`FASE_01` a `FASE_10`) |
| `md/analisis/` | Hallazgos por revisar |
