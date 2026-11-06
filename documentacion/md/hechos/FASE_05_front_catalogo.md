# FASE 05 · front catálogo y paneles

- Maestro: MAESTRO_proyecto.md
- Estado: Hecho
- Fecha: 06/11/2026
- Traza: HU de catálogo, visor 3D/AR y panel del vendedor (por escribir)

## Objetivo

Pantallas del cliente (inicio, catálogo, detalle con 3D y AR, favoritos) y los paneles
del vendedor y del administrador, siguiendo el lienzo de diseño.

## Cambios

- [x] `catalogo/`: inicio con portada animada y destacados; catálogo con búsqueda, categorías
  y orden en la URL, "Ver más" y estados vacío y sin conexión; detalle con visor 3D.
- [x] `catalogo/components/Visor3D`: `model-viewer` cargado bajo demanda, barra de progreso,
  cotas de ancho, fondo y alto, y AR (`webxr`, `scene-viewer`, `quick-look`) a escala real.
  Si el dispositivo no admite AR se explica con SweetAlert2 y se ofrece copiar el enlace.
- [x] `favoritos/`: guardados en el dispositivo con toast y Deshacer.
- [x] `vendedor/`: tabla (escritorio) y tarjetas (móvil); crear borrador, editar, subir `.glb`
  e imagen con progreso, publicar con interruptor y alerta de éxito con la foto, eliminar con confirmación.
- [x] `admin/`: categorías (crear, editar, eliminar), usuarios (roles múltiples y cuenta activa,
  paginado) y roles (permisos por rol; ADMIN fijo).
- [x] Las pantallas del panel se descargan aparte (`React.lazy`).

## Pendiente

| Tema | Nota |
|---|---|
| Favoritos en el back | Hoy viven en `localStorage`; falta el endpoint con `FAVORITO_GESTIONAR`. |
| Bundle de `model-viewer` | ~1 MB (290 KB gzip), solo se baja al abrir un detalle. Se cacheará en la fase 6 (PWA). |
| Prueba en celular | AR solo se puede probar en un teléfono con ARCore o iOS; queda para la fase 6, con HTTPS. |

## Pruebas

- `npm run lint` y `npm run build` sin errores.
- Manual: detalle de Sofá Nube con el `.glb` real del back, cotas de medidas y aviso de AR en escritorio.
- El panel no se probó en el navegador en esta fase; queda para la prueba manual con una cuenta admin.
