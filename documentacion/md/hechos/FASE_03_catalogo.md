# FASE 03 · catalogo

- Maestro: MAESTRO_proyecto.md
- Estado: Hecho
- Fecha: 06/11/2026
- Traza: HU de catálogo y panel del vendedor (por escribir)

## Objetivo

Catálogo público de muebles con filtros y la gestión del vendedor: datos, modelo
3D `.glb`, imagen y publicación.

## Cambios

- [x] `categoria/`: CRUD paginado; nombre único, slug automático; no se borra si tiene muebles.
- [x] `mueble/`: entidad con precio, medidas en cm, materiales, categoría, vendedor,
  rutas del modelo y la imagen; catálogo público con filtros; panel de gestión.
- [x] `archivo/`: `AlmacenamientoService` guarda en `UPLOADS_DIR`, detecta el formato por
  la firma de bytes (no por la extensión) y bloquea rutas fuera de la carpeta.
- [x] `config/RecursosEstaticosConfig`: `/uploads/**` con `model/gltf-binary`, CORS y caché de 30 días.
- [x] `mueble/service/SemillaCatalogoService`: con `SEMILLA_CATALOGO=true` y el catálogo
  vacío, carga los 4 muebles de Blender (`resources/semilla/`, `.glb` + `.webp`).
- [x] `common/util/Slug`: "Mesa Taller Ñandú" -> `mesa-taller-nandu`.

## Reglas de negocio

| Regla | Respuesta |
|---|---|
| El catálogo público solo muestra muebles publicados | Borrador de otro: 404 |
| Un mueble se crea como borrador | `publicado = false` |
| Para publicar hace falta modelo 3D e imagen | 400 |
| El vendedor solo modifica sus muebles; ADMIN modifica todos | 403 |
| Una categoría con muebles no se borra | 400 |
| `precioMin` no puede ser mayor que `precioMax` | 400 |
| Modelo: solo `.glb`, máximo 30 MB. Imagen: PNG, JPG o WEBP, máximo 5 MB | 400 |

## Endpoints

| Método | Ruta | Acceso |
|---|---|---|
| GET | `/api/categorias?buscar=&page=&size=&sort=` | público |
| GET | `/api/categorias/{id}` | público |
| POST, PUT, DELETE | `/api/categorias[/{id}]` | `CATEGORIA_GESTIONAR` |
| GET | `/api/muebles?categoriaId=&buscar=&precioMin=&precioMax=&page=&size=&sort=` | público (solo publicados) |
| GET | `/api/muebles/{slug}` | público; el borrador solo lo ve su dueño o ADMIN |
| GET | `/api/muebles/gestion?buscar=` | `MUEBLE_CREAR` (vendedor: los suyos; admin: todos) |
| POST | `/api/muebles` | `MUEBLE_CREAR` |
| PUT | `/api/muebles/{id}` | `MUEBLE_EDITAR` + dueño o ADMIN |
| PATCH | `/api/muebles/{id}/publicacion` | `MUEBLE_EDITAR` + dueño o ADMIN |
| POST | `/api/muebles/{id}/modelo` (multipart, campo `archivo`) | `MUEBLE_EDITAR` + dueño o ADMIN |
| POST | `/api/muebles/{id}/imagen` (multipart, campo `archivo`) | `MUEBLE_EDITAR` + dueño o ADMIN |
| DELETE | `/api/muebles/{id}` | `MUEBLE_ELIMINAR` + dueño o ADMIN |
| GET | `/uploads/**` | público |

`modeloUrl` e `imagenUrl` vienen relativas (`/uploads/muebles/1/modelo-8e2ecf8b.glb`);
el front les antepone el origen del back. Cada subida genera un nombre nuevo, por eso
la caché puede ser `immutable`.

## Pruebas

- `CatalogoTest` (3 casos): semilla y filtros, entrega del `.glb` con tipo, CORS y caché;
  ciclo del vendedor (borrador, archivo falso rechazado, subida, publicación, 403 a otro
  vendedor, borrado); validaciones, 401, 403, categoría duplicada y categoría con muebles.
- `./mvnw verify`: 9 pruebas en verde contra MySQL.
- Arranque real contra `catalogo_muebles`: semilla cargada, `.glb` servido como
  `model/gltf-binary`, Swagger con 24 rutas, health `UP`.

## Pendientes al cerrar

- Favoritos (`FAVORITO_GESTIONAR`) sin implementar: va con el front del cliente.
- Las imágenes de ejemplo son WebP; el front debe usar `object-fit: contain` y la sombra CSS.
