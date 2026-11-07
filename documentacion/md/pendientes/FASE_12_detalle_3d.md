# FASE 12 · Detalle con el 3D protagonista

- Maestro: MAESTRO_proyecto.md
- Estado: Pendiente
- Fecha: 06/11/2026
- Análisis: `md/analisis/ANALISIS_crecimiento.md` (§2 y §4)
- Diseño: https://claude.ai/artifact/Xi7bMwkUwABNnfyUmze5Dh

## Objetivo

Que el modelo 3D sea lo primero y lo más grande del detalle, con la navegación siempre
a la mano (bottom bar también en `/mueble/:slug`) y una distribución que funcione igual
de bien en el teléfono y en escritorio. Sumar un mueble de muestra con más detalle que
siga siendo ligero para gráficos integrados.

## Partes

- [ ] 12a · Front del detalle
  - Bottom bar visible en el detalle; la barra de acciones queda fija encima de ella.
  - Visor de unos 64 % del alto en móvil y columna grande en escritorio (1.55 fr).
  - Controles flotantes: AR, medidas y pantalla completa (Fullscreen API).
  - Hoja con nombre, precio, existencias y resumen de medidas; el resto debajo.
  - Tarjeta del vendedor (enlace al perfil desde la fase 14).
  - Auto-giro en pausa cuando el visor sale de pantalla.
- [ ] 12b · Sillón Alba en Blender
  - Capitonado, costuras, cojín suelto, patas torneadas; biselados reales.
  - Material `GC_Color` en el tapiz (textura en grises claros) para la fase 15.
  - Presupuesto: hasta 60 000 triángulos, texturas de 1024 px, `.glb` de 3 MB o menos.
  - Render, `.webp`, semilla y fila en `blender/README.md`.
- [ ] 12c · Docs
  - Mover esta fase a `hechos/`, actualizar el maestro.

## Verificación

- `npm run lint` y `npm run build` en `front/`; `./mvnw verify` en `back/` por la semilla.
- Revisión en el navegador por la persona dueña del proyecto (teléfono y escritorio).
