# ANÁLISIS · notificaciones push reales (Web Push)

- Estado: Por hacer (documentado el 07/11/2026, sin código)
- Relacionado: `FASE_20_cuentas.md` (avisos en la cuenta), `FASE_22_pwa.md`

## Qué hay hoy y qué falta

Hoy cada `AvisoCorreo` que publica un módulo manda un correo (`AvisosCorreoListener`, después
del commit y en segundo plano) y deja un aviso en la bandeja (`NotificacionService.alAvisar`).
El front pide el conteo de sin leer cada cierto tiempo y lo pone en la campana, en la
pestaña Avisos y, desde la fase 22, en el icono de la app instalada (Badging API).

Lo que falta es el aviso del sistema operativo con la app cerrada ("Tu pedido va en
camino"). Eso es Web Push: el back manda un mensaje cifrado al servicio push del navegador
(FCM en Chrome, Mozilla, Apple) y el service worker lo muestra aunque la app no esté abierta.

## Requisitos

| # | Requisito | Nota |
|---|---|---|
| 1 | HTTPS | Push y service worker solo funcionan en `https` (o `localhost`). En la red local hace falta un túnel, igual que el AR. |
| 2 | Claves VAPID | Un par de claves por instalación del back. La pública va al front; la privada solo al back. |
| 3 | iPhone y iPad | Solo iOS/iPadOS 16.4 o superior y solo con la app agregada a inicio. En Safari normal no hay push. |
| 4 | Permiso | El navegador solo deja pedirlo tras un gesto de la persona (un toque en un botón). Si lo niega, ya no se puede volver a pedir desde la app. |

## Propuesta

### Configuración

- `.env` y `.env.example` (sin valores reales en el ejemplo):
  - `VAPID_PUBLICA`, `VAPID_PRIVADA` y `VAPID_ASUNTO` (`mailto:` del proyecto).
  - `VITE_VAPID_PUBLICA` para el front (es la misma clave pública; no es secreta).
- Generar las claves una vez con `npx web-push generate-vapid-keys` y guardarlas solo en `.env`.
- `application.properties`: `app.push.publica`, `app.push.privada`, `app.push.asunto` leídos del
  entorno. Si faltan, el envío push se apaga sin romper el arranque (se registra un aviso).

### Back

- Dependencia: `nl.martijndwars:web-push` (con BouncyCastle) o una implementación propia de
  RFC 8291 (cifrado) y RFC 8292 (VAPID). La librería ahorra el cifrado.
- Módulo nuevo `push/` con la estructura de siempre:
  - `entity/SuscripcionPush`: `usuario` (ManyToOne, borrado en cascada), `endpoint`
    (único, hasta 500), `p256dh`, `auth`, `agente` (navegador, para mostrarlo), `creadaEn`,
    `usadaEn`.
  - `dto/SuscripcionPushRequest` con Bean Validation (`@NotBlank` en endpoint y claves).
  - `controller/PushController`:
    - `GET /api/push/clave` (pública): devuelve la clave VAPID pública.
    - `POST /api/push/suscripcion`: guarda o actualiza la suscripción de la cuenta actual
      (si el endpoint ya existe con otra cuenta, pasa a la actual).
    - `DELETE /api/push/suscripcion`: la borra (al apagar los avisos o cerrar sesión).
  - `service/PushService`:
    - Escucha `AvisoCorreo` con `@Async` y `@TransactionalEventListener`, igual que el
      correo: solo se manda si la operación se guardó y la respuesta no espera.
    - Carga útil corta en JSON: `titulo`, `texto`, `ruta`, `tipo` (sin datos sensibles; el
      detalle se ve al abrir la app).
    - Cabeceras: `TTL` de 24 h y `Urgency` (`high` para pedidos y entregas, `normal` el
      resto).
    - Si el servicio push responde 404 o 410, la suscripción ya no sirve: se borra.
- Respetar el rol: el aviso va a la cuenta, y al abrirlo la ruta decide qué se ve según el
  rol activo (igual que en la bandeja).
- Al cerrar sesión, el front pide `DELETE` para que un teléfono compartido no siga recibiendo
  avisos de otra cuenta.

### Service worker (`front/pwa/sw.js`)

- `push`: lee el JSON y llama a `self.registration.showNotification(titulo, { body, icon:
  '/iconos/icono-192.png', badge, tag: tipo, data: { ruta } })`. También actualiza la insignia
  (`navigator.setAppBadge`) si viene el conteo.
- `notificationclick`: cierra la notificación, busca una ventana abierta de la app
  (`clients.matchAll`) y la enfoca navegando a `ruta`; si no hay, `clients.openWindow(ruta)`.
- `pushsubscriptionchange`: vuelve a suscribirse y manda la nueva al back.

### Front

- `notificaciones/push.js`: `suscribir()` (pide permiso, `pushManager.subscribe` con
  `userVisibleOnly: true` y la clave pública, `POST` al back) y `desuscribir()`.
- Experiencia del permiso (no pedirlo al entrar):
  - En Cuenta, fila "Avisos en este teléfono" con interruptor y estado (activados, apagados,
    bloqueados por el navegador con instrucciones para reactivarlos).
  - Una invitación suave después de una acción con sentido, por ejemplo al hacer el primer
    pedido: "¿Te avisamos cuando cambie tu pedido?" con "Sí, avísame" y "Ahora no".
  - En iPhone sin instalar, en lugar del interruptor se muestra la guía de instalación
    (`abrirHojaInstalar`), porque ahí push solo existe con la app en inicio.
- Preferencias por tipo (pedidos, reseñas, existencias) como mejora posterior; al inicio
  todo o nada.

## Pruebas

- Back (MySQL `catalogo_muebles_test`): guardar, mover de cuenta y borrar suscripciones;
  que una respuesta 410 borre la suscripción (servicio push simulado con un cliente falso).
- Front: lint y build; en Chrome por `localhost` (vale como contexto seguro) y en el
  teléfono con un túnel HTTPS y la app instalada.

## Riesgos

| # | Severidad | Qué pasa | Propuesta |
|---|---|---|---|
| 1 | Media | Sin HTTPS en la red local no se puede probar en el teléfono | Túnel (Tailscale o similar), el mismo que pide el AR |
| 2 | Media | Demasiados avisos hacen que la persona los bloquee | Solo eventos que le importan (pedido, entrega, respuesta, existencia) y `tag` para agrupar |
| 3 | Baja | La clave privada VAPID se filtra | Solo en `.env`; si se cambia, las suscripciones viejas dejan de servir y se piden de nuevo |
