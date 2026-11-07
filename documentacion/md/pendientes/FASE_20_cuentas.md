# FASE 20 · Avisos en la cuenta, solicitud de vendedor y transportistas del vendedor

- Maestro: MAESTRO_proyecto.md
- Estado: En progreso
- Fecha: 07/11/2026

## Objetivo

Cerrar cómo llega cada persona a su rol y dejar los avisos guardados en la cuenta.

- Cliente: se registra solo (ya existe).
- Vendedor: un cliente lo pide desde Cuenta y un administrador lo aprueba.
- Transportista: lo registra un vendedor, trabaja solo para él y solo ese vendedor se lo
  asigna a sus envíos. Nadie se registra como transportista por su cuenta.
- Administrador: solo el que se crea al arrancar (sin cambios).

Decisiones tomadas con el usuario (07/11/2026): avisos desde la API, vendedor por solicitud
y aprobación, y el vendedor crea la cuenta del transportista.

## Partes

- [ ] 20a · Back: avisos en la cuenta
  - Módulo `notificacion/`: `Notificacion` (usuario, tipo, título, texto, ruta, leída). Se
    guarda una por cada `AvisoCorreo` dentro de la misma transacción, así la bandeja y el
    correo dicen lo mismo. Se conservan las 60 más recientes por cuenta.
  - `GET /api/notificaciones` (paginado), `GET /api/notificaciones/sin-leer`,
    `PATCH /{id}/leida`, `POST /leidas`, `DELETE /{id}` y `DELETE` (vaciar). Solo las propias.
  - Al registrarse llega el aviso de bienvenida.
- [ ] 20b · Back: solicitud para vender
  - `SolicitudVendedor` (usuario, ciudad, teléfono, qué vende, estado PENDIENTE, APROBADA o
    RECHAZADA, motivo, quién y cuándo la revisó).
  - Cliente: `GET` y `POST /api/solicitud-vendedor`. Una pendiente a la vez; no si ya vende.
  - Administrador (`USUARIO_GESTIONAR`): `GET /api/solicitudes-vendedor?estado=`,
    `POST /{id}/aprobar` (suma el rol Vendedor y su ciudad) y `POST /{id}/rechazar` con
    motivo. Las dos avisan por correo y en la bandeja.
- [ ] 20c · Back: transportistas del vendedor
  - `Usuario` suma `telefono` y `empleador` (el vendedor que lo registró).
  - Permiso `TRANSPORTISTA_GESTIONAR` (Vendedor y Administrador).
  - `GET /api/transportistas` devuelve solo los del vendedor, con estado y entregas en camino.
    `POST` crea la cuenta (nombre, correo, teléfono) con el rol Transportista y manda un
    correo de invitación (72 h) para poner su contraseña. `POST /{id}/invitacion` la
    reenvía; `PATCH /{id}/activo` lo da de baja o de alta.
  - `POST /api/auth/activar` (token de invitación y contraseña) deja la cuenta verificada.
  - Al enviar un pedido solo se puede asignar un transportista activo del vendedor.
- [ ] 20d · Front
  - Avisos desde la API: bandeja paginada, contador en la barra y los toasts siguen igual.
    Los avisos que antes se guardaban en el navegador se borran.
  - Cuenta: "Quiero vender" con su estado. Panel: "Solicitudes" para el administrador.
  - Panel: "Mis transportistas" (alta, reenviar invitación, baja). Página `/activar` para
    que el transportista ponga su contraseña.
- [ ] 20e · Docs
  - Este documento y el maestro.

## Verificación

- `./mvnw verify` en `back/`; `npm run lint` y `npm run build` en `front/`.
