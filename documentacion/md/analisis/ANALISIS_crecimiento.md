# ANÁLISIS · Detalle 3D, comunidad, vendedores, colores, apartados, transporte y métricas

- Estado: Decidido (fases 12 a 19)
- Fecha: 06/11/2026
- Relacionado: `MAESTRO_proyecto.md`, `ANALISIS_pedidos.md` (fase 11), lienzo de diseño
  del detalle: https://claude.ai/artifact/Xi7bMwkUwABNnfyUmze5Dh

## 1. Qué pidió la persona dueña del proyecto

1. Redistribuir el detalle del mueble: el modelo 3D como protagonista y la bottom bar
   también en el detalle (hoy se oculta en `/mueble/:slug`).
2. Un mueble de muestra más detallado, ligero para su equipo.
3. "Me gusta", mejores calificados y comentarios sobre los muebles.
4. Apartar muebles.
5. Perfil público del vendedor con sus trabajos.
6. Cambiar el color del mueble en tiempo real con los colores que el vendedor tiene en existencia.
7. Más cosas para el cliente.
8. Rol de transportista: ve qué lleva, a dónde y si cobra en efectivo o con tarjeta.
9. Métricas: zonas donde se vende más, muebles más vendidos y similares.

## 2. Equipo de referencia (para el 3D)

Laptop de desarrollo: Intel Core Ultra 5 225H (14 núcleos), gráficos integrados Intel,
15.4 GB de RAM. Es el piso de rendimiento: si el visor va fluido aquí, va fluido en
un teléfono de gama media.

| Presupuesto por modelo | Valor |
|---|---|
| Triángulos | hasta 60 000 (hoy los muebles tienen menos de 10 000) |
| Texturas | hasta 3 mapas de 1024 px (color, normal, rugosidad); 2048 solo el color si hace falta |
| Peso del `.glb` | hasta 3 MB |
| Materiales | hasta 4; el que cambia de color se llama `GC_Color` |
| Render en Blender | Cycles en CPU, 64 muestras con denoising, 1200 px |

## 3. Decisiones (tomadas el 06/11/2026)

| # | Tema | Decisión |
|---|---|---|
| D1 | Calificar | Las dos cosas: "Me gusta" rápido para cualquier cuenta y reseña con 1 a 5 estrellas y comentario solo para quien recibió el mueble (compra verificada). Las reseñas tienen su propia vista; el detalle muestra el resumen y un enlace. Ranking por estrellas. |
| D2 | Apartado | Con anticipo acordado fuera de la app: el cliente pide apartar, el vendedor confirma que recibió el anticipo, anota el monto y la fecha límite. |
| D3 | Transporte | El vendedor asigna el transportista al enviar. El cliente elige al pedir si paga en efectivo o con tarjeta al recibir; el transportista lo ve y confirma el cobro al entregar. |
| D4 | Colores | Variantes de color con existencias propias. Las existencias del mueble son la suma; al comprar o apartar se elige color. |

Decisiones menores tomadas con el valor recomendado (se pueden cambiar en cada fase):

| # | Tema | Valor |
|---|---|---|
| D5 | Reseñas | Una por cliente y mueble, editable. El vendedor responde una vez. El admin oculta reseñas (`RESENA_MODERAR`). |
| D6 | Me gusta | Requiere sesión (cualquier rol). No es lo mismo que favoritos: favoritos es la lista privada del cliente; "me gusta" es público y cuenta para el ranking. |
| D7 | Trabajos del vendedor | El perfil muestra sus muebles publicados y una galería de "trabajos realizados" (fotos con título), aparte del catálogo. |
| D8 | Transportista | Solo ve los pedidos asignados a él. No entra al chat; reporta "No se pudo entregar" con motivo (mensaje del sistema y el pedido vuelve a `ACEPTADO`). |
| D9 | Vencimiento del apartado | Una tarea programada cada hora vence los apartados pasados de fecha y devuelve las existencias. |
| D10 | Métricas | El vendedor ve las suyas; el admin, las de toda la tienda. Zonas por ciudad y código postal de los pedidos entregados. Sin mapa en la primera versión (tabla y barras). |
| D11 | Vistas | Contador diario de vistas por mueble; el front lo manda una vez por sesión y mueble. Sirve para la conversión (vistas contra pedidos). |

## 4. Detalle del mueble (fase 12)

Hoy: visor de 392 px en móvil y 560 px en escritorio, la bottom bar oculta y la barra
de compra encima del contenido.

Propuesta (lienzo, tres tableros):

- **Móvil, primera vista**: visor de unos 64 % del alto. Botones flotantes de volver,
  compartir y favorito arriba. Columna a la derecha con AR, medidas y pantalla completa.
  Abajo del visor van los colores en existencia (desde la fase 15) y una hoja con
  categoría, nombre, precio, calificación, existencias y un resumen de medidas.
  La barra de acciones (Comprar · precio, Apartar, Preguntar) queda fija sobre la
  bottom bar, que ahora sí se muestra.
- **Móvil, hoja abierta**: al deslizar, el visor se compacta y aparece todo: descripción,
  medidas, colores con sus existencias, materiales, tarjeta del vendedor y el resumen
  de reseñas con "Leer las N reseñas".
- **Escritorio**: visor grande a la izquierda (1.55 fr, unos 760 px de alto) y columna de
  datos a la derecha con las acciones arriba. La bottom bar flota centrada abajo.

Rendimiento del visor en gráficos integrados:

- `model-viewer` ya baja la escala de render si los cuadros por segundo caen; se deja
  activo.
- Sin `environment-image` HDR pesada: se queda `neutral`. Sombra suave sin rebotes.
- El visor deja de girar solo cuando sale de pantalla (`IntersectionObserver`) y en
  "pantalla completa" usa la Fullscreen API del contenedor.

Mueble de muestra detallado: **Sillón Alba**, un sillón tapizado con capitonado,
costuras, cojín suelto y patas torneadas de nogal. Tiene biselados reales y texturas
horneadas de 1024 px. El tapiz usa el material `GC_Color` con textura en grises claros,
para que el cambio de color multiplique bien.

## 5. Me gusta y reseñas (fase 13)

Modelo (módulo `resena/`):

| Entidad | Campos |
|---|---|
| `MeGusta` | usuario, mueble, creadoEn; único (usuario, mueble) |
| `Resena` | mueble, cliente, pedido (entregado), estrellas 1-5, texto (≤ 1000), respuesta del vendedor (≤ 1000), respondidaEn, oculta, creadoEn, actualizadoEn; única (cliente, mueble) |
| `Mueble` (nuevos) | `totalMeGusta`, `totalResenas`, `calificacion` (promedio con 1 decimal), actualizados en el service al cambiar algo |

API:

| Método | Ruta | Quién |
|---|---|---|
| POST / DELETE | `/api/muebles/{id}/me-gusta` | cualquier cuenta |
| GET | `/api/muebles/{slug}/resenas?estrellas=&orden=&page=` | público |
| GET | `/api/muebles/{slug}/resenas/resumen` | público (promedio, distribución 1-5, total) |
| POST / PUT | `/api/muebles/{id}/resenas` | `RESENA_CREAR` y pedido entregado del mueble |
| POST | `/api/resenas/{id}/respuesta` | el vendedor del mueble |
| PATCH | `/api/resenas/{id}/oculta` | `RESENA_MODERAR` |

Catálogo: orden nuevo `mejor-calificados` y `mas-gustados`; sección "Mejor
calificados" en Inicio. Las reseñas ocultas no suman al promedio.

Front: vista `/mueble/:slug/resenas` (resumen, barras por estrellas, filtro, lista paginada,
"Escribir reseña" si la persona puede). Al entregar un pedido, el cliente ve en el
detalle del pedido "Califica tu mueble".

## 6. Perfil del vendedor y sus trabajos (fase 14)

- `Usuario` gana: `slug`, `bio` (≤ 280), `ciudad`, `fotoUrl`, `portadaUrl`.
- `TrabajoVendedor`: vendedor, título, descripción corta, imagenUrl, orden. Hasta 24.
- `GET /api/vendedores/{slug}`: datos públicos, calificación promedio de sus muebles,
  número de muebles publicados, ventas entregadas y año desde que vende.
- `GET /api/vendedores/{slug}/muebles` (paginado) y `/trabajos`.
- El vendedor edita su perfil y su galería en el panel ("Mi perfil").
- Front: `/vendedor/:slug` con portada, foto, datos, pestañas "Muebles" y "Trabajos".
  La tarjeta del vendedor del detalle enlaza aquí.

## 7. Colores en existencia (fase 15)

- `VarianteColor`: mueble, nombre (≤ 40), hex (`#RRGGBB`), existencias (0-9999), orden.
  Hasta 8 por mueble.
- Si un mueble tiene variantes, `Mueble.existencias` se recalcula como la suma y el
  formulario la muestra como solo lectura. Sin variantes, todo sigue como hoy.
- `Pedido` gana `variante` (nullable, `SET_NULL`) y `varianteNombre` (copia). El descuento
  y la devolución de existencias se hacen sobre la variante.
- Front: muestras redondas sobre el visor. Al elegir una, `model-viewer` cambia el
  `baseColorFactor` del material `GC_Color` en tiempo real. Si el modelo no lo tiene,
  se tiñe el primer material. Una variante con 0 existencias se ve atenuada y no se compra.
- Panel: editor de variantes en el formulario del mueble (nombre, color, existencias).

## 8. Apartados con anticipo (fase 16)

Se reutiliza el pedido (mismo chat y seguimiento) con un estado nuevo:

```
"Apartar" ──► SOLICITADO (apartado = true)
Vendedor: "Confirmar anticipo" (monto y fecha límite) ──► APARTADO   (descuenta existencias)
APARTADO ──► ACEPTADO   (el vendedor marca "liquidado"; sigue el flujo normal)
APARTADO ──► CANCELADO  (cualquiera de los dos, con motivo; devuelve existencias)
APARTADO ──► VENCIDO    (tarea programada al pasar la fecha; devuelve existencias)
```

- `Pedido` gana `apartado`, `anticipo`, `apartadoHasta` y `apartadoEn`.
- Fecha límite entre 1 y 30 días. Hasta 3 apartados abiertos por cliente.
- Avisos y correos: apartado confirmado, faltan 24 h y vencido.

## 9. Transportista y método de pago (fase 17)

- Rol base `TRANSPORTISTA` con el permiso `ENTREGA_REALIZAR`. El admin lo asigna en Usuarios.
- `Pedido` gana `metodoPago` (`EFECTIVO`, `TARJETA`; obligatorio al pedir),
  `transportista` (nullable), `cobradoEn` y `asignadoEn`.
- Al pasar a `EN_CAMINO` con envío a domicilio, el vendedor elige transportista
  (`GET /api/transportistas`). Para "recoger", el vendedor marca entregado y cobrado.
- Transportista: `GET /api/entregas` (solo las suyas), detalle con dirección, teléfono,
  mueble, color, cantidad, total a cobrar y método; acciones "Entregado y cobrado" y
  "No se pudo entregar" (motivo).
- Front: con el rol activo Transportista, la bottom bar muestra Entregas, Avisos y Cuenta.
  La tarjeta de entrega tiene un botón para abrir la dirección en mapas (enlace externo)
  y otro para llamar.

## 10. Métricas (fase 18)

Módulo `metrica/` de solo lectura sobre pedidos, vistas y reseñas:

| Métrica | Fuente |
|---|---|
| Ventas, ingresos y ticket promedio por periodo | pedidos `ENTREGADO` |
| Zonas que más compran (ciudad y código postal) | pedidos `ENTREGADO` a domicilio |
| Muebles más vendidos, más vistos, mejor calificados | pedidos, `VistaMueble`, reseñas |
| Conversión (vistas → pedidos) por mueble | `VistaMueble` y pedidos |
| Tiempo promedio de aceptación y de entrega | fechas del pedido |
| Mezcla de pago (efectivo y tarjeta) | `metodoPago` |

- `VistaMueble`: mueble, fecha, vistas (único mueble+fecha). `POST /api/muebles/{id}/vista`.
- Permisos: `METRICA_VER` (vendedor, sus datos) y `METRICA_GLOBAL` (admin, toda la tienda).
- Front: sección "Métricas" del panel con indicadores, serie por semana, barras por zona y
  tablas de muebles; filtro de periodo (7, 30 y 90 días).

## 11. Más para el cliente (fase 19)

Lista inicial; se confirma al llegar a la fase:

- "Avísame cuando haya": aviso y correo cuando vuelve a haber existencias de un mueble o color.
- Vistos recientemente (en el dispositivo).
- Comparar hasta 3 muebles (medidas, precio, materiales, calificación).
- Direcciones guardadas en la cuenta (en lugar de solo `gc.entrega` en el dispositivo).
- Editar perfil y foto.

## 12. Permisos nuevos

| Permiso | Roles base |
|---|---|
| `RESENA_CREAR` | CLIENTE, ADMIN |
| `RESENA_MODERAR` | ADMIN |
| `PERFIL_VENDEDOR_EDITAR` | VENDEDOR, ADMIN |
| `ENTREGA_REALIZAR` | TRANSPORTISTA |
| `METRICA_VER` | VENDEDOR, ADMIN |
| `METRICA_GLOBAL` | ADMIN |

"Me gusta" no necesita permiso: basta con la sesión. El arreglo de `RolService` de la
fase 11 ya agrega los permisos nuevos a los roles base existentes.

## 13. Riesgos

| # | Severidad | Riesgo | Mitigación |
|---|---|---|---|
| R1 | Media | Reseñas falsas | Solo con pedido entregado; moderación del admin |
| R2 | Media | Existencias negativas con variantes y apartados a la vez | Bloqueo pesimista sobre la variante, igual que hoy en el mueble |
| R3 | Media | Datos personales (dirección, teléfono) visibles al transportista | Solo en pedidos asignados a él y mientras estén `EN_CAMINO`; al cerrar se ocultan |
| R4 | Baja | Modelos pesados en gráficos integrados | Presupuesto del §2 y revisión en la laptop de referencia |
| R5 | Baja | Métricas lentas con muchos pedidos | Consultas agregadas con índices por estado y fecha; periodo máximo de 365 días |

## 14. Plan de fases

| Fase | Contenido | Depende de |
|---|---|---|
| 12 | Detalle con el 3D protagonista y bottom bar; Sillón Alba | — |
| 13 | Me gusta, reseñas y mejores calificados | 11 |
| 14 | Perfil del vendedor y trabajos | 13 (calificación del vendedor) |
| 15 | Colores en existencia y cambio de color en vivo | 12 |
| 16 | Apartados con anticipo | 15 |
| 17 | Transportista y método de pago | 15 |
| 18 | Métricas | 13, 17 |
| 19 | Más para el cliente | 15 |

Cada fase tiene su archivo en `md/pendientes/` y cada parte va en su rama y PR hacia `develop`.
