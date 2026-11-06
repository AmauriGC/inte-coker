# Modelos 3D (Blender)

Fuente y exportaciones de los muebles del catálogo. Hechos en Blender 5.2 con el
MCP de Blender.

| Carpeta / archivo | Contenido |
|---|---|
| `muebles.blend` | Archivo fuente: una colección por mueble, materiales y estudio de render |
| `export/*.glb` | Modelos para el visor 3D y la realidad aumentada (`<model-viewer>`) |
| `renders/*.png` | Renders de producto 1200 × 1200, fondo transparente con sombra |

## Convenciones (obligatorias para que la AR mida bien)

- **Escala real en metros.** 1 unidad de Blender = 1 m. La AR coloca el modelo a tamaño real.
- **Apoyado en el piso**: el punto más bajo en `z = 0`, centrado en `x = 0, y = 0`.
- **El frente mira hacia −Y** en Blender (queda hacia la cámara al exportar con +Y arriba).
- Exportar con: formato GLB, solo lo seleccionado, aplicar modificadores, +Y arriba, sin luces ni cámaras.
- Peso: menos de 5 MB por `.glb` (hoy pesan entre 82 y 140 KB).

## Modelos

| Mueble | Archivo | Medidas (ancho × fondo × alto) | Materiales |
|---|---|---|---|
| Sofá Nube | `sofa-nube.glb` | 210 × 92 × 89 cm | Tela arena, patas de roble |
| Sillón Ola | `sillon-ola.glb` | 78 × 72 × 101 cm | Tela terracota, estructura de roble |
| Mesa Luna | `mesa-luna.glb` | Ø 80 × 40 cm | Mármol, base de roble, zócalo de latón |
| Lámpara Faro | `lampara-faro.glb` | Ø 48 × 160 cm | Metal negro, pantalla de lino, latón |

## Volver a renderizar

El estudio (colección `Estudio`) tiene luces de área, piso atrapa-sombras y cámara
con objetivo. Los textos internos `mueble_utils` y `render_utils` del `.blend` tienen
las funciones `solo(nombre)` y `encuadre(nombre)`. Ajustes ligeros para laptop:
Cycles en CPU, 32–64 muestras con denoising, exposición −0.6, vista AgX.
