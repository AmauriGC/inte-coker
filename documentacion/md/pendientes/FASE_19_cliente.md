# FASE 19 · Más para el cliente

- Maestro: MAESTRO_proyecto.md
- Estado: En progreso (19a hecha)
- Fecha: 06/11/2026
- Análisis: `md/analisis/ANALISIS_crecimiento.md` (§11)

## Objetivo

Hacer más cómodo decidir y volver a comprar.

## Partes

Se tomaron las cinco propuestas.

- [x] 19a · Back
  - Módulo `cuenta/` (cualquier rol con sesión): `PUT /api/cuenta/perfil` (`{nombre}`),
    `POST` y `DELETE /api/cuenta/foto` (la misma foto del perfil del vendedor).
    `UsuarioResponse` suma `fotoUrl`.
  - `Direccion` (alias, quién recibe, teléfono, dirección, ciudad, C. P., predeterminada;
    hasta 5): `GET`, `POST`, `PUT` y `DELETE /api/cuenta/direcciones` y
    `PATCH /api/cuenta/direcciones/{id}/predeterminada`. La primera queda predeterminada y,
    si se borra la predeterminada, la siguiente toma su lugar.
  - Módulo `aviso/`: `AvisoExistencia` (usuario, mueble y color opcional; hasta 30 por
    cuenta). `GET`, `POST` y `DELETE /api/muebles/{id}/avisame?varianteId=`; solo sobre
    algo agotado y nunca el propio mueble.
  - `MuebleService` publica `ExistenciasCambiadas` al editar, devolver existencias y
    publicar; `AvisoExistenciaService` manda el correo a quien ya puede pedir y borra el aviso.
  - `CuentaTest` con MySQL (3 casos).
- [ ] 19b · Front
  - Editar nombre y foto en Cuenta; "Mis direcciones" y elegirlas en la hoja de compra.
  - "Avísame cuando haya" en el detalle (mueble o color agotado).
  - Vistos recientemente (en el dispositivo) y comparar hasta 3 muebles.
- [ ] 19c · Docs

## Verificación

- `./mvnw verify` en `back/`; `npm run lint` y `npm run build` en `front/`.
- 19a: `./mvnw verify` con 34 pruebas en verde.
