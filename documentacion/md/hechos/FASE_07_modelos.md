# FASE 07 · Modelos 3D en Blender

- Maestro: MAESTRO_proyecto.md
- Estado: Hecho
- Fecha: 06/11/2026
- Traza: HU del visor 3D y la realidad aumentada (catálogo)

## Objetivo

Tener un catálogo de ejemplo con modelos propios, a escala real y ligeros, listos para
el visor 3D y la AR de `<model-viewer>`, y que se carguen solos en el back.

## Cambios

- [x] `blender/muebles.blend`: 8 muebles, una colección por mueble con empty raíz en el
  origen. Nuevos: Sofá Duna, Butaca Coral, Mesa Taller y Lámpara Nido.
- [x] Materiales nuevos: `Tela_Mostaza` y `Ceramica` (con barniz).
- [x] `blender/export/*.glb`: exportados con modificadores aplicados, +Y arriba, sin luces ni cámaras.
- [x] `blender/renders/*.png` y `back/src/main/resources/semilla/*.webp`: renders con
  fondo transparente, sin sombra y recortados.
- [x] `SemillaCatalogoService.sembrarFaltantes`: ya no carga solo con el catálogo vacío;
  agrega por slug los ejemplos que falten. Así los muebles nuevos aparecen al reiniciar
  sin borrar la base.
- [x] `blender/README.md`: tabla de los 8 modelos y pasos para agregar uno nuevo.

## Modelos nuevos

| Mueble | Medidas (cm) | Peso `.glb` | Categoría |
|---|---|---|---|
| Sofá Duna | 160 × 85 × 82 | 87 KB | Sofás |
| Butaca Coral | 74 × 78 × 76 | 90 KB | Sillones |
| Mesa Taller | 180 × 90 × 75 | 33 KB | Mesas |
| Lámpara Nido | Ø 30 × 45 | 59 KB | Iluminación |

Todos medidos en Blender: `z` mínima en 0, centrados en `x` e `y`, medidas exactas.

## Decisiones

- **Semilla por slug.** Un ejemplo que el administrador borre vuelve en el siguiente
  arranque. Si eso estorba, se apaga con `SEMILLA_CATALOGO=false`.
- **Peso.** Geometría simple con bevel y materiales de color, sin texturas de imagen: todos los
  `.glb` quedan entre 32 y 140 KB, muy por debajo del límite de 5 MB.

## Pruebas

- `CatalogoTest.semillaAgregaSoloLosEjemplosQueFaltan`: el ejemplo nuevo se publica con
  su modelo y una segunda corrida de la semilla no duplica.
- `./mvnw verify`: 10 pruebas en verde contra MySQL.

## Pendiente

- AR en el teléfono ("verlo en mi sala"): requiere HTTPS en el teléfono; se ve después.
