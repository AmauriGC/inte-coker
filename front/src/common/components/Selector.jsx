import { ChevronDown } from 'lucide-react';
import { useId } from 'react';

/** Select nativo con el estilo de la app (en móvil abre el selector del sistema). */
export default function Selector({ etiqueta, opciones, error, className = '', compacto = false, ...resto }) {
  const id = useId();
  return (
    <div className={className}>
      {etiqueta && !compacto && (
        <label htmlFor={id} className="mb-1.5 block text-[13px] font-semibold text-texto">
          {etiqueta}
        </label>
      )}
      <div className="relative">
        <select
          id={id}
          aria-label={compacto ? etiqueta : undefined}
          className={[
            'w-full appearance-none rounded-full border bg-white pl-4 pr-10 font-medium text-tinta outline-none transition',
            'focus:border-tinta focus:ring-4 focus:ring-tinta/5',
            compacto ? 'h-10 text-[13.5px]' : 'h-12 rounded-2xl text-[15px]',
            error ? 'border-[#B3261E]' : 'border-borde',
          ].join(' ')}
          {...resto}
        >
          {opciones.map((o) => (
            <option key={o.valor} value={o.valor}>
              {o.texto}
            </option>
          ))}
        </select>
        <ChevronDown className="pointer-events-none absolute right-3.5 top-1/2 size-4 -translate-y-1/2 text-gris" aria-hidden />
      </div>
      {error && <p className="mt-1.5 text-[12.5px] text-[#B3261E]">{error}</p>}
    </div>
  );
}
