# FASE 14 · Perfil del vendedor y sus trabajos

- Maestro: MAESTRO_proyecto.md
- Estado: En progreso (14a hecha)
- Fecha: 06/11/2026
- Análisis: `md/analisis/ANALISIS_crecimiento.md` (§6 y D7)

## Objetivo

Que el cliente conozca a quien vende: su calificación, sus ventas, sus muebles
publicados y una galería de trabajos realizados.

## Partes

- [x] 14a · Back
  - `Usuario`: `slug` (único, se genera del nombre al crear la cuenta y al arrancar para
    las cuentas viejas; "yo" queda reservado), `bio` (280), `ciudad` (80), `fotoRuta`,
    `portadaRuta`.
  - `TrabajoVendedor` (hasta 24 por vendedor) con imagen, título, descripción y orden.
  - Permiso `PERFIL_VENDEDOR_EDITAR` (rol VENDEDOR; ADMIN los tiene todos).
  - `MuebleResponse.vendedor` incluye `slug` y `fotoUrl` para enlazar al perfil.
  - Tiene perfil una cuenta activa con rol VENDEDOR o con algún mueble publicado.
  - `VendedorTest` con MySQL (2 casos).
- [ ] 14b · Front
  - `/vendedor/:slug`: portada, foto, datos, pestañas "Muebles" y "Trabajos".
  - Tarjeta del vendedor en el detalle del mueble con enlace al perfil.
  - "Mi perfil" en el panel: datos, foto, portada y galería.
- [ ] 14c · Docs

## API (14a)

| Método | Ruta | Quién | Notas |
|---|---|---|---|
| GET | `/api/vendedores/{slug}` | público | Datos, calificación promedio, reseñas, muebles publicados, ventas entregadas, trabajos, año desde que vende y `propio` |
| GET | `/api/vendedores/{slug}/muebles` | público | Publicados, paginado |
| GET | `/api/vendedores/{slug}/trabajos` | público | Galería ordenada |
| GET / PUT | `/api/vendedores/yo` | `PERFIL_VENDEDOR_EDITAR` | Ver y editar `bio` y `ciudad` |
| POST / DELETE | `/api/vendedores/yo/foto` y `/yo/portada` | `PERFIL_VENDEDOR_EDITAR` | Imagen PNG, JPG o WEBP de hasta 5 MB |
| POST | `/api/vendedores/yo/trabajos` | `PERFIL_VENDEDOR_EDITAR` | Multipart: `titulo`, `descripcion`, `archivo` |
| PUT | `/api/vendedores/yo/trabajos/orden` | `PERFIL_VENDEDOR_EDITAR` | `{ids}` con todos mis trabajos |
| PUT / DELETE | `/api/vendedores/yo/trabajos/{id}` | `PERFIL_VENDEDOR_EDITAR` | Solo los propios (404 si no) |

## Verificación

- `./mvnw verify` en `back/`; `npm run lint` y `npm run build` en `front/`.
- 14a: `./mvnw verify` con 22 pruebas en verde.
