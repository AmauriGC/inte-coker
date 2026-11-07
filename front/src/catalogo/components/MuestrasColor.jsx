/**
 * Muestras redondas de los colores en existencia. Un color agotado se ve atenuado y tachado,
 * pero se puede elegir para verlo en 3D (comprarlo no).
 * variantes: [{ id, nombre, hex, existencias }]; valor: id elegido.
 */
export default function MuestrasColor({ variantes, valor, alElegir, vertical = false, grande = false, etiqueta = 'Color' }) {
  const tamano = grande ? 'size-11' : 'size-9';
  // El anillo de la elegida va dentro del botón (borde + hueco): no crece ni se encima.
  return (
    <div role="radiogroup" aria-label={etiqueta} className={`flex gap-1 ${vertical ? 'flex-col' : 'flex-wrap'}`}>
      {variantes.map((v) => {
        const elegido = v.id === valor;
        const agotado = v.existencias === 0;
        return (
          <button
            key={v.id}
            type="button"
            role="radio"
            aria-checked={elegido}
            aria-label={`${v.nombre}${agotado ? ', agotado' : ''}`}
            title={`${v.nombre}${agotado ? ' (agotado)' : ''}`}
            onClick={() => alElegir(v.id)}
            className={`relative grid ${tamano} shrink-0 place-items-center rounded-full border-2 p-[3px] transition-colors ${
              elegido ? 'border-tinta' : 'border-transparent hover:border-borde'
            }`}
          >
            <span
              className={`size-full rounded-full border border-black/10 shadow-[inset_0_-3px_6px_rgba(0,0,0,0.15)] ${agotado ? 'opacity-45' : ''}`}
              style={{ backgroundColor: v.hex }}
            />
            {agotado && <span className="absolute h-px w-[115%] -rotate-45 bg-tinta/70" aria-hidden />}
          </button>
        );
      })}
    </div>
  );
}
