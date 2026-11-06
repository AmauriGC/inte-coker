# FASE 10 · Favoritos en el back

- Maestro: MAESTRO_proyecto.md
- Estado: Hecho
- Fecha: 06/11/2026
- Traza: HU del cliente "guardar favoritos" (permiso `FAVORITO_GESTIONAR`)

## Objetivo

Que los favoritos del cliente vivan en su cuenta y no solo en el dispositivo: los ve en
cualquier teléfono o navegador donde entre, sin perder lo que guardó antes de tener sesión.

## Cambios

- [x] Back, módulo `favorito/`:
  - `entity/Favorito`: tabla `favoritos` (`usuario_id`, `mueble_id`, único por pareja).
    Con `ON DELETE CASCADE`: si se borra el mueble o el usuario, se borran sus favoritos.
  - `repository/FavoritoRepository`: lista paginada de los favoritos con mueble publicado.
  - `service/FavoritoService`: listar, guardar, quitar y sincronizar (idempotentes).
  - `controller/FavoritoController`: `/api/favoritos` con `FAVORITO_GESTIONAR`.
  - `dto/SincronizarFavoritosRequest`: hasta 100 ids, validados.
- [x] Back, `MuebleService`: `obtenerPublicado(id)` y `obtenerPublicados(ids)` para otros módulos.
- [x] Front, `favoritos/api/favoritosApi.js` y `FavoritosProvider` con dos modos.
- [x] Front, Cuenta: dice "en tu cuenta" o "en este dispositivo" según el modo.

## API

| Método | Ruta | Qué hace | Respuesta |
|---|---|---|---|
| GET | `/api/favoritos?page=0&size=20` | Mis favoritos publicados, del más reciente al más antiguo | `PaginaResponse<MuebleResponse>` |
| PUT | `/api/favoritos/{muebleId}` | Guarda (si ya estaba, no pasa nada) | `MuebleResponse`; 404 si no existe o no está publicado |
| DELETE | `/api/favoritos/{muebleId}` | Quita (si no estaba, no pasa nada) | vacío |
| POST | `/api/favoritos/sincronizar` | `{"muebleIds":[1,2]}`: suma los del dispositivo; ignora ids inexistentes | cuántos se agregaron |

Sin sesión: 401. Sin el permiso (por ejemplo un VENDEDOR solo): 403. `CLIENTE` y `ADMIN`
lo tienen.

## Cómo funciona en el front

| Situación | Dónde se guardan |
|---|---|
| Sin sesión, o con una cuenta sin `FAVORITO_GESTIONAR` | `localStorage` (`gc.favoritos`), como antes |
| Con sesión de cliente | En la cuenta. Al entrar se suben los locales (`sincronizar`) y la lista local se vacía |

- Los cambios son optimistas: el corazón cambia al instante y, si el back falla, se revierte
  con un aviso de error. "Deshacer" funciona igual en los dos modos.
- Se guarda una copia de la lista de la cuenta (`gc.favoritos.cuenta`) para verla sin
  conexión; al cerrar sesión se borra del dispositivo.
- Un mueble que el vendedor oculta deja de aparecer en favoritos; si lo vuelve a publicar,
  reaparece. Si lo borra, desaparece para siempre.

## Pruebas

- `FavoritoTest` (3 casos, MySQL):
  - guardar, repetir y sincronizar (ids inexistentes ignorados), listar, quitar dos veces,
    404 con un mueble que no existe, 400 con un id negativo;
  - 401 sin sesión, 403 para un vendedor;
  - un mueble oculto sale de la lista, al publicarlo vuelve, y al borrarlo se borra el
    favorito (sin error de llave foránea).
- `./mvnw verify`: 13 pruebas en verde. `npm run lint` y `npm run build` en verde.
- Pendiente: probarlo en el navegador con una cuenta de cliente (lo hace la persona dueña
  del proyecto con sus credenciales).
