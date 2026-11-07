# FASE 15 · Colores en existencia y cambio de color en vivo

- Maestro: MAESTRO_proyecto.md
- Estado: Hecho
- Fecha: 06/11/2026
- Análisis: `md/analisis/ANALISIS_crecimiento.md` (§7 y D4)

## Objetivo

Que el vendedor registre los colores que tiene en existencia y que el cliente vea el
mueble cambiar de color en el visor 3D al tocar cada muestra, para comprarlo en el
color que eligió.

## Partes

- [x] 15a · Back
  - `VarianteColor` (nombre, hex `#RRGGBB` en mayúsculas, existencias, orden; hasta 8
    por mueble; nombres sin repetir). Viajan en `MuebleRequest.variantes` (con `id` se
    editan, sin `id` se crean, las que faltan se borran) y en `MuebleResponse.variantes`.
  - Con colores, `Mueble.existencias` es la suma; sin colores todo sigue igual.
  - `Pedido`: `variante` (`SET_NULL`), `varianteNombre` y `varianteHex` (copias).
    `PedidoRequest` y `SolicitudRequest` reciben `varianteId` (obligatorio si el
    mueble tiene colores); `PedidoResponse.color` devuelve `{nombre, hex}`.
  - Al aceptar se descuenta del color con la fila del mueble bloqueada; al cancelar un
    pedido aceptado se devuelve a ese color.
  - Semilla: el Sillón Alba (modelo con `GC_Color`) trae Arena, Terracota, Salvia y Azul
    noche (agotado); si ya existía sin colores, se le agregan al arrancar.
  - `ColorTest` con MySQL (2 casos).
- [x] 15b · Front
  - `MuestrasColor`: muestras redondas; las agotadas se ven atenuadas y tachadas (se pueden
    ver en 3D pero no comprar).
  - Detalle: columna de muestras a la izquierda del visor y tarjeta "Color" en la hoja con
    las existencias del color. `Visor3D` recibe `color` y cambia en vivo el
    `baseColorFactor` del material `GC_Color` (si no existe, el primero), convirtiendo el
    hex de sRGB a lineal; guarda el color original del modelo.
  - Comprar: el botón dice "Agotado en {color}" si el color elegido no tiene piezas.
    `HojaComprar` elige el color (sincronizado con el visor), limita la cantidad a las
    piezas de ese color y envía `varianteId`; desde una consulta carga los colores del mueble.
  - Pedido y lista de pedidos muestran el color elegido.
  - Panel: `EditorColores` en el formulario del mueble (muestra con selector de color,
    nombre, piezas, quitar; hasta 8). Con colores, "Existencias" es la suma y no se edita.
  - Auxiliares en `common/utils/colores.js`.
- [x] 15c · Docs

## Verificación

- `./mvnw verify` en `back/`; `npm run lint` y `npm run build` en `front/`.
- 15a: `./mvnw verify` con 24 pruebas en verde.
- 15b: `npm run lint` y `npm run build` sin errores; revisado a 390 px que el Sillón Alba
  cambia de Arena a Terracota en el visor sin recargar y que Azul noche se ve agotado.
- En Android, Scene Viewer abre el `.glb` original (sin el color elegido); WebXR y Quick Look
  usan la escena del visor.
