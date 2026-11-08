# FASE 20 · Avisos en la cuenta, solicitud de vendedor y transportistas del vendedor

- Maestro: MAESTRO_proyecto.md
- Estado: Hecho
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

- [x] 20a · Back: avisos en la cuenta
  - Módulo `notificacion/`: `Notificacion` (usuario, tipo, título, texto, ruta, leída). Se
    guarda una por cada `AvisoCorreo` dentro de la misma transacción, así la bandeja y el
    correo dicen lo mismo. Se conservan las 60 más recientes por cuenta.
  - `GET /api/notificaciones` (paginado), `GET /api/notificaciones/sin-leer`,
    `PATCH /{id}/leida`, `POST /leidas`, `DELETE /{id}` y `DELETE` (vaciar). Solo las propias.
  - Al registrarse llega el aviso de bienvenida.
- [x] 20b · Back: solicitud para vender
  - `SolicitudVendedor` (usuario, ciudad, teléfono, qué vende, estado PENDIENTE, APROBADA o
    RECHAZADA, motivo, quién y cuándo la revisó).
  - Cliente: `GET` y `POST /api/solicitud-vendedor`. Una pendiente a la vez; no si ya vende.
  - Administrador (`USUARIO_GESTIONAR`): `GET /api/solicitudes-vendedor?estado=`,
    `POST /{id}/aprobar` (suma el rol Vendedor y su ciudad) y `POST /{id}/rechazar` con
    motivo. Las dos avisan por correo y en la bandeja.
- [x] 20c · Back: transportistas del vendedor
  - `Usuario` suma `telefono` y `empleador` (el vendedor que lo registró).
  - Permiso `TRANSPORTISTA_GESTIONAR` (Vendedor y Administrador).
  - `GET /api/transportistas` devuelve solo los del vendedor, con estado y entregas en camino.
    `POST` crea la cuenta (nombre, correo, teléfono) con el rol Transportista y manda un
    correo de invitación (72 h) para poner su contraseña. `POST /{id}/invitacion` la
    reenvía; `PATCH /{id}/activo` lo da de baja o de alta.
  - `POST /api/auth/activar` (token de invitación y contraseña) deja la cuenta verificada.
  - Al enviar un pedido solo se puede asignar un transportista activo del vendedor.
- [x] 20d · Front
  - `notificaciones/`: `avisosApi`, `AvisosProvider` (cuenta los sin leer cada 30 s y muestra
    un toast al llegar uno nuevo; los de pedidos los sigue avisando `PedidosProvider`) y
    `AvisosPage` paginada (tocar marca leído y lleva a la ruta; deslizar borra). Sin sesión
    pide entrar. `NotificacionesProvider` queda solo para toasts y borra `gc.avisos`.
  - Cuenta: "Quiero vender" (`/cuenta/vender`, `QuieroVenderPage`) con el estado de la
    última solicitud. Panel: "Solicitudes" (`SolicitudesPage`) con filtros, aprobar y
    rechazar con motivo.
  - Módulo `transportistas/`: "Mis transportistas" (`/panel/transportistas`) con alta en
    `HojaTransportista`, reenviar invitación y baja o alta. `/activar` reutiliza
    `RestablecerPasswordPage`. `HojaEnviar` solo ofrece transportistas activos y con la
    cuenta activada.
- [x] 20e · Docs
  - Este documento y el maestro.

## Verificación

- `./mvnw verify` en `back/`; `npm run lint` y `npm run build` en `front/`.
- Back: `./mvnw verify` en verde con `NotificacionTest`, `SolicitudVendedorTest` y
  `TransportistaTest`; `EntregaTest` registra a los transportistas desde el vendedor.
- Front: lint y build en verde; revisado en el navegador Avisos desde la API, Cuenta con
  "Quiero vender" y `/activar`.

## Notas

- Al reiniciar el back se crean las tablas y columnas nuevas; hay que volver a entrar para
  tener `TRANSPORTISTA_GESTIONAR`.
- El administrador aún puede dar el rol Transportista desde Usuarios, pero esa cuenta no
  tiene vendedor y no se le pueden asignar envíos.
