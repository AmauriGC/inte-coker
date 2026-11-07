import { Palette, Plus, X } from 'lucide-react';
import { MAXIMO_COLORES, colorNuevo } from '../../common/utils/colores';

/**
 * Colores en existencia del mueble: muestra, nombre y piezas. Con al menos uno, las
 * existencias del mueble pasan a ser la suma. errores llega con claves del back
 * ("variantes[0].nombre").
 */
export default function EditorColores({ colores, alCambiar, errores = {} }) {
  const cambiar = (i, clave, valor) => alCambiar(colores.map((c, j) => (j === i ? { ...c, [clave]: valor } : c)));
  const quitar = (i) => alCambiar(colores.filter((_, j) => j !== i));

  return (
    <fieldset className="grid gap-2.5">
      <legend className="mb-1 flex w-full items-center justify-between gap-2 text-[13px] font-semibold text-texto">
        <span className="inline-flex items-center gap-1.5">
          <Palette className="size-4" aria-hidden /> Colores en existencia
        </span>
        <span className="font-normal text-gris">
          {colores.length}/{MAXIMO_COLORES}
        </span>
      </legend>
      {colores.length === 0 && (
        <p className="rounded-2xl bg-crema px-4 py-3 text-[12.5px] text-texto">
          Sin colores el mueble se vende en uno solo. Agrega los que tengas y el cliente podrá verlos en el visor 3D.
        </p>
      )}
      {colores.map((c, i) => {
        const error = errores[`variantes[${i}].nombre`] ?? errores[`variantes[${i}].hex`] ?? errores[`variantes[${i}].existencias`];
        return (
          <div key={c.clave} className="grid gap-1">
            <div className="flex items-center gap-2">
              <label className="relative size-11 shrink-0 cursor-pointer overflow-hidden rounded-full border border-borde" style={{ backgroundColor: c.hex }}>
                <span className="sr-only">Color {c.nombre || i + 1}</span>
                <input type="color" value={c.hex} onChange={(e) => cambiar(i, 'hex', e.target.value.toUpperCase())} className="absolute inset-0 cursor-pointer opacity-0" />
              </label>
              <input
                aria-label={`Nombre del color ${i + 1}`}
                value={c.nombre}
                maxLength={40}
                placeholder="Arena"
                onChange={(e) => cambiar(i, 'nombre', e.target.value)}
                className="h-11 min-w-0 flex-1 rounded-2xl border border-borde bg-white px-3.5 text-[14px] outline-none focus:border-tinta"
              />
              <input
                aria-label={`Piezas en ${c.nombre || `el color ${i + 1}`}`}
                type="number"
                inputMode="numeric"
                min="0"
                max="9999"
                value={c.existencias}
                onChange={(e) => cambiar(i, 'existencias', e.target.value)}
                className="h-11 w-20 rounded-2xl border border-borde bg-white px-3 text-center text-[14px] outline-none focus:border-tinta"
              />
              <button type="button" onClick={() => quitar(i)} aria-label={`Quitar ${c.nombre || `el color ${i + 1}`}`} className="grid size-9 shrink-0 place-items-center rounded-full text-gris hover:bg-crema hover:text-tinta">
                <X className="size-4" />
              </button>
            </div>
            {error && <p className="pl-[52px] text-[12.5px] text-[#B3261E]">{error}</p>}
          </div>
        );
      })}
      {colores.length < MAXIMO_COLORES && (
        <button
          type="button"
          onClick={() => alCambiar([...colores, colorNuevo()])}
          className="inline-flex h-10 items-center justify-center gap-1.5 rounded-full border border-dashed border-borde text-[13.5px] font-semibold hover:bg-crema"
        >
          <Plus className="size-4" aria-hidden /> Agregar color
        </button>
      )}
    </fieldset>
  );
}
