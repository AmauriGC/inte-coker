# FASE 18 · Métricas

- Maestro: MAESTRO_proyecto.md
- Estado: En progreso (18a hecha)
- Fecha: 06/11/2026
- Análisis: `md/analisis/ANALISIS_crecimiento.md` (§10, D10 y D11)

## Objetivo

Que el vendedor y el administrador sepan qué se vende, dónde y cuánto: zonas que más
compran, muebles más vendidos, vistos y mejor calificados, conversión y tiempos de entrega.

## Partes

- [x] 18a · Back
  - `VistaMueble` (mueble, fecha, vistas; única por mueble y día en la zona de México).
    `POST /api/muebles/{id}/vista` es pública, solo para muebles publicados, y no cuenta las
    vistas del propio vendedor. Suma con `on duplicate key update` (MySQL).
  - Permisos `METRICA_VER` (VENDEDOR y ADMIN) y `METRICA_GLOBAL` (ADMIN).
  - `GET /api/metricas?dias=1..365&tienda=false|true`: `tienda=true` solo con
    `METRICA_GLOBAL`; si no, lo propio. Respuesta: `periodo` (con `agrupacion` DIA hasta 31
    días o SEMANA), `resumen` (ventas, piezas, ingresos, ticket promedio, pedidos, vistas,
    conversión, horas de aceptación y de entrega, calificación y reseñas del periodo),
    `serie`, `ciudades` y `codigosPostales` (top 10), `muebles` (top 20) y `pagos`.
  - Ventas = pedidos `ENTREGADO` en el periodo; pedidos = solicitados en el periodo.
  - `MetricaRepository` (solo lectura, proyecciones ligeras) y `MetricaService` (agrega en memoria).
  - `MetricaTest` con MySQL.
- [ ] 18b · Front
  - Sección "Métricas" del panel: indicadores, serie semanal, barras por zona y tablas.
  - Filtro de periodo (7, 30 y 90 días).
- [ ] 18c · Docs

## Verificación

- `./mvnw verify` en `back/`; `npm run lint` y `npm run build` en `front/`.
- 18a: `./mvnw verify` con 31 pruebas en verde.
