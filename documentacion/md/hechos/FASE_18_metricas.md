# FASE 18 · Métricas

- Maestro: MAESTRO_proyecto.md
- Estado: Hecho
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
- [x] 18b · Front
  - `metricasApi.vista`: el detalle público cuenta una vista por sesión y mueble
    (`sessionStorage` `gc.vistas`); si falla, no estorba.
  - `/panel/metricas` (`METRICA_VER` o `METRICA_GLOBAL`), en el menú del panel y en Cuenta.
  - Filtros en una fila: periodo (7, 30 y 90 días) y, con `METRICA_GLOBAL`, "Mis muebles" o
    "Toda la tienda".
  - Indicadores (ingresos, piezas, conversión, calificación), `GraficaSerie` (ingresos por
    día o semana, una sola serie en terracota, tooltip y tabla para lectores de pantalla),
    tiempos promedio, mezcla de pago, zonas por ciudad o código postal y tabla de muebles.
  - El color de la serie pasó el validador de paletas sobre la superficie clara.
- [x] 18c · Docs
  - Este documento y el maestro.

## Verificación

- `./mvnw verify` en `back/`; `npm run lint` y `npm run build` en `front/`.
- 18a: `./mvnw verify` con 31 pruebas en verde.
- 18b: lint y build en verde; revisada en el navegador a 1456 y 390 px con datos simulados.
