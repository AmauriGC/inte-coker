# FASE 18 · Métricas

- Maestro: MAESTRO_proyecto.md
- Estado: Pendiente
- Fecha: 06/11/2026
- Análisis: `md/analisis/ANALISIS_crecimiento.md` (§10, D10 y D11)

## Objetivo

Que el vendedor y el administrador sepan qué se vende, dónde y cuánto: zonas que más
compran, muebles más vendidos, vistos y mejor calificados, conversión y tiempos de entrega.

## Partes

- [ ] 18a · Back
  - `VistaMueble` y `POST /api/muebles/{id}/vista`.
  - Módulo `metrica/` (solo lectura) con resumen, series, zonas y muebles por periodo.
  - Permisos `METRICA_VER` (lo propio) y `METRICA_GLOBAL` (toda la tienda).
  - Pruebas con MySQL.
- [ ] 18b · Front
  - Sección "Métricas" del panel: indicadores, serie semanal, barras por zona y tablas.
  - Filtro de periodo (7, 30 y 90 días).
- [ ] 18c · Docs

## Verificación

- `./mvnw verify` en `back/`; `npm run lint` y `npm run build` en `front/`.
