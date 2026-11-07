# FASE 12 · Detalle con el 3D protagonista

- Maestro: MAESTRO_proyecto.md
- Estado: Hecho
- Fecha: 06/11/2026
- Análisis: `md/analisis/ANALISIS_crecimiento.md` (§2 y §4)
- Diseño: https://claude.ai/artifact/Xi7bMwkUwABNnfyUmze5Dh

## Objetivo

Que el modelo 3D sea lo primero y lo más grande del detalle, con la navegación siempre
a la mano (bottom bar también en `/mueble/:slug`) y una distribución que funcione igual
de bien en el teléfono y en escritorio. Sumar un mueble de muestra con más detalle que
siga siendo ligero para gráficos integrados.

## Partes

- [x] 12a · Front del detalle
  - Bottom bar visible en el detalle; la barra de acciones queda fija encima de ella.
  - Visor de unos 64 % del alto en móvil y columna grande en escritorio (1.55 fr).
  - Controles flotantes: AR, medidas y pantalla completa (Fullscreen API).
  - Hoja con nombre, precio, existencias y resumen de medidas; el resto debajo.
  - Tarjeta del vendedor (enlace al perfil desde la fase 14).
  - `model-viewer` ya deja de dibujar cuando el visor sale de pantalla y baja la escala de
    render si caen los cuadros por segundo; no hizo falta código extra.
- [x] 12b · Sillón Alba en Blender
  - Capitonado, costuras, cojín suelto, patas torneadas; biselados reales.
  - Material `GC_Color` en el tapiz (textura en grises claros) para la fase 15.
  - Presupuesto: hasta 60 000 triángulos, texturas de 1024 px, `.glb` de 3 MB o menos.
  - Render, `.webp`, semilla y fila en `blender/README.md`.
- [x] 12c · Docs
  - Mover esta fase a `hechos/`, actualizar el maestro.

## Resultado

| Pieza | Dónde | Notas |
|---|---|---|
| Detalle | `catalogo/pages/DetallePage` | Visor de `64dvh` (380 a 640 px) en móvil y `100dvh - 136px` en escritorio; hoja que se monta 28 px sobre el visor |
| Controles | Columna flotante a la derecha del visor | AR, medidas y pantalla completa propia (`fixed inset-0`, sale con Escape), que también funciona en iPhone |
| Acciones | Fijas sobre la bottom bar en móvil, en la columna en escritorio | "Comprar · precio" y "Preguntar"; "Ver en mi espacio" en escritorio o cuando no se compra |
| Bottom bar | `layout/LayoutMovil` | Ya no se oculta en `/mueble/:slug` |
| Sillón Alba | `blender/scripts/sillon_alba.py` | 83 × 82 × 90 cm, 26 644 triángulos, `.glb` de 792 KB, tela `GC_Color` con mapa de normales |

## Verificación

- `npm run lint` y `npm run build` en `front/`; `./mvnw verify` en `back/` por la semilla.
- 12a: `npm run lint` y `npm run build` en verde; revisado a 390 px y en escritorio.
- 12b: `./mvnw verify` con 18 pruebas en verde.
- Revisión en el navegador por la persona dueña del proyecto (teléfono y escritorio).
