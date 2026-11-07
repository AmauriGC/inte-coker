# FASE 14 · Perfil del vendedor y sus trabajos

- Maestro: MAESTRO_proyecto.md
- Estado: Pendiente
- Fecha: 06/11/2026
- Análisis: `md/analisis/ANALISIS_crecimiento.md` (§6 y D7)

## Objetivo

Que el cliente conozca a quien vende: su calificación, sus ventas, sus muebles
publicados y una galería de trabajos realizados.

## Partes

- [ ] 14a · Back
  - `Usuario`: `slug`, `bio`, `ciudad`, `fotoUrl`, `portadaUrl`.
  - `TrabajoVendedor` (hasta 24 por vendedor) con imagen.
  - `GET /api/vendedores/{slug}`, `/muebles` y `/trabajos`; edición del perfil propio
    con `PERFIL_VENDEDOR_EDITAR`.
  - Pruebas con MySQL.
- [ ] 14b · Front
  - `/vendedor/:slug`: portada, foto, datos, pestañas "Muebles" y "Trabajos".
  - Tarjeta del vendedor en el detalle del mueble con enlace al perfil.
  - "Mi perfil" en el panel: datos, foto, portada y galería.
- [ ] 14c · Docs

## Verificación

- `./mvnw verify` en `back/`; `npm run lint` y `npm run build` en `front/`.
