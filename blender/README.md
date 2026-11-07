# Modelos 3D (Blender)

Fuente y exportaciones de los muebles del catálogo. Hechos en Blender 5.2 con el
MCP de Blender.

| Carpeta / archivo | Contenido |
|---|---|
| `muebles.blend` | Archivo fuente: una colección por mueble, materiales y estudio de render |
| `sillon-alba.blend` | Copia de `muebles.blend` con la colección `Sillon_Alba` (el mueble detallado de la fase 12) |
| `scripts/sillon_alba.py` | Genera el Sillón Alba sin interfaz: modelo, texturas, `.glb`, render y `.blend` |
| `export/*.glb` | Modelos para el visor 3D y la realidad aumentada (`<model-viewer>`) |
| `renders/*.png` | Renders de producto con fondo transparente, sin sombra y recortados al mueble |

## Convenciones (obligatorias para que la AR mida bien)

- **Escala real en metros.** 1 unidad de Blender = 1 m. La AR coloca el modelo a tamaño real.
- **Apoyado en el piso**: el punto más bajo en `z = 0`, centrado en `x = 0, y = 0`.
- **El frente mira hacia −Y** en Blender (queda hacia la cámara al exportar con +Y arriba).
- Exportar con: formato GLB, solo lo seleccionado, aplicar modificadores, +Y arriba, sin luces ni cámaras.
- Peso: menos de 5 MB por `.glb` (hoy pesan entre 32 y 140 KB; el Sillón Alba, 792 KB).

## Presupuesto para modelos detallados

Pensado para gráficos integrados (laptop de referencia: Intel Core Ultra 5 225H, 15.4 GB):

| Valor | Límite |
|---|---|
| Triángulos | hasta 60 000 |
| Texturas | hasta 3 mapas de 1024 px, exportados en JPEG |
| Peso del `.glb` | hasta 3 MB |
| Material que cambia de color | se llama `GC_Color`; su textura va en grises claros y el color sale de un nodo Mix (Multiply), que el exportador convierte en `baseColorFactor` |

## Modelos

| Mueble | Archivo | Medidas (ancho × fondo × alto) | Materiales |
|---|---|---|---|
| Sofá Nube | `sofa-nube.glb` | 210 × 92 × 89 cm | Tela arena, patas de roble |
| Sillón Ola | `sillon-ola.glb` | 78 × 72 × 101 cm | Tela terracota, estructura de roble |
| Mesa Luna | `mesa-luna.glb` | Ø 80 × 40 cm | Mármol, base de roble, zócalo de latón |
| Lámpara Faro | `lampara-faro.glb` | Ø 48 × 160 cm | Metal negro, pantalla de lino, latón |
| Sofá Duna | `sofa-duna.glb` | 160 × 85 × 82 cm | Tela salvia, patas de metal negro |
| Butaca Coral | `butaca-coral.glb` | 74 × 78 × 76 cm | Tela mostaza, patas de roble |
| Mesa Taller | `mesa-taller.glb` | 180 × 90 × 75 cm | Cubierta de roble, base de metal negro |
| Lámpara Nido | `lampara-nido.glb` | Ø 30 × 45 cm | Cerámica, latón, pantalla de lino |
| Sillón Alba | `sillon-alba.glb` | 83 × 82 × 90 cm | Tela arena (`GC_Color`, tejido con mapa de normales), patas torneadas de nogal, casquillos de latón; 26 644 triángulos |

## Volver a renderizar

El estudio (colección `Estudio`) tiene luces de área, piso atrapa-sombras y cámara
con objetivo. Los textos internos `mueble_utils` y `render_utils` del `.blend` tienen
las funciones `solo(nombre)` y `encuadre(nombre)`. Ajustes ligeros para laptop:
Cycles en CPU, 32–64 muestras con denoising, exposición −0.6, vista AgX.

### Sombra

Los renders salen **sin sombra**: el piso `Piso_Sombra` tiene `hide_render = True`.
Una sombra horneada choca con los fondos de color y se ve cortada al recortar la
imagen. La sombra la pone el front con CSS (una elipse difuminada bajo el mueble),
así se adapta a cualquier fondo y tamaño.

Después de renderizar, cada PNG se recorta a su contenido visible (canal alfa) más
12 px de margen, para que `object-fit: contain` no deje aire de más.

## Sillón Alba sin interfaz

Se hizo con una instancia de Blender sin interfaz para no tocar el `muebles.blend` abierto:

```
blender -b blender/muebles.blend --python blender/scripts/sillon_alba.py -- <ruta del repo> --render
```

Escribe `export/sillon-alba.glb`, `renders/sillon-alba.png` y `.webp` (recortados) y `sillon-alba.blend`.
Tarda unos 20 segundos (Cycles en CPU, 64 muestras). Para pasarlo a `muebles.blend`: Archivo › Anexar › `sillon-alba.blend` › Collection › `Sillon_Alba`.

## Agregar un mueble nuevo al catálogo

1. Modelarlo en su propia colección con un empty raíz en el origen (ver `mueble_utils`).
2. Revisar medidas: `z` mínima en 0, centrado, frente hacia −Y.
3. Exportar `export/<slug>.glb` y renderizar `renders/<slug>.png` (más el `.webp` para el back).
4. Copiar `<slug>.glb` y `<slug>.webp` a `back/src/main/resources/semilla/`.
5. Agregar un `Ejemplo` en `SemillaCatalogoService` con el mismo slug.
6. Reiniciar el back: la semilla agrega solo los muebles cuyo slug no existe todavía.
