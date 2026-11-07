import { Star } from 'lucide-react';

/** Cinco estrellas de solo lectura; el valor se redondea a la media estrella más cercana. */
export default function Estrellas({ valor = 0, tamano = 'size-4', className = '' }) {
  const medio = Math.round(Number(valor) * 2) / 2;
  return (
    <span className={`inline-flex items-center gap-0.5 ${className}`} role="img" aria-label={`${Number(valor).toFixed(1)} de 5 estrellas`}>
      {[1, 2, 3, 4, 5].map((i) => (
        <span key={i} className={`relative ${tamano}`} aria-hidden>
          <Star className={`absolute inset-0 ${tamano} text-borde`} fill="currentColor" strokeWidth={0} />
          {medio >= i - 0.5 && (
            <span className="absolute inset-0 overflow-hidden" style={{ width: medio >= i ? '100%' : '50%' }}>
              <Star className={`${tamano} text-terracota`} fill="currentColor" strokeWidth={0} />
            </span>
          )}
        </span>
      ))}
    </span>
  );
}

/** Selector de 1 a 5 estrellas (botones de radio accesibles). */
export function SelectorEstrellas({ valor, alCambiar, error }) {
  const textos = ['', 'No me gustó', 'Regular', 'Bien', 'Muy bien', 'Me encantó'];
  return (
    <fieldset>
      <legend className="mb-2 text-[13px] font-semibold text-texto">Tu calificación</legend>
      <div role="radiogroup" aria-label="Calificación" className="flex items-center gap-1">
        {[1, 2, 3, 4, 5].map((i) => (
          <button
            key={i}
            type="button"
            role="radio"
            aria-checked={valor === i}
            aria-label={`${i} de 5 estrellas`}
            onClick={() => alCambiar(i)}
            className="grid size-11 place-items-center rounded-full transition-transform active:scale-90"
          >
            <Star className={`size-8 ${valor >= i ? 'text-terracota' : 'text-borde'}`} fill="currentColor" strokeWidth={0} />
          </button>
        ))}
        <span className="ml-2 text-[14px] font-semibold text-texto">{textos[valor ?? 0]}</span>
      </div>
      {error && <p className="mt-1.5 text-[13px] text-[#B3261E]">{error}</p>}
    </fieldset>
  );
}
