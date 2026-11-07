# FASE 19 · Más para el cliente

- Maestro: MAESTRO_proyecto.md
- Estado: Hecho
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
- [x] 19b · Front
  - Módulo `cuenta/`: `EditarPerfilPage` (`/cuenta/perfil`: nombre y foto con progreso) y
    `DireccionesPage` (`/cuenta/direcciones`) con `HojaDireccion`. Cuenta muestra la foto,
    un lápiz para editar, "Mis direcciones" y "Comparar muebles".
  - `HojaComprar`: con envío a domicilio muestra las direcciones guardadas; un toque llena
    los campos.
  - Detalle: si lo elegido está agotado, el botón principal es "Avísame cuando haya" (o "Ya
    no avisarme"); sin sesión lleva a entrar.
  - `common/utils/listaLocal.js`: listas del dispositivo compartidas con
    `useSyncExternalStore`. `gc.vistos` (12) alimenta "Vistos recientemente" en Inicio;
    `gc.comparar` (3) alimenta el botón "Comparar" del detalle y `/comparar` (precio,
    medidas, piezas, colores, materiales, calificación y vendedor; marca el más económico).
- [x] 19c · Docs
  - Este documento y el maestro.

## Verificación

- `./mvnw verify` en `back/`; `npm run lint` y `npm run build` en `front/`.
- 19a: `./mvnw verify` con 34 pruebas en verde.
- 19b: lint y build en verde; revisado en el navegador a 390 px (Inicio, detalle, Comparar,
  Cuenta y Mis direcciones).
