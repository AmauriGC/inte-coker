import { Eye, EyeOff } from 'lucide-react';
import { useId, useState } from 'react';

/**
 * Campo de formulario con etiqueta, icono opcional y mensaje de error del back.
 * Con type="password" agrega el botón para mostrar u ocultar.
 */
export default function Campo({ etiqueta, error, ayuda, icono: Icono, type = 'text', multilinea = false, className = '', ...resto }) {
  const id = useId();
  const [visible, setVisible] = useState(false);
  const esPassword = type === 'password';
  const Control = multilinea ? 'textarea' : 'input';

  return (
    <div className={className}>
      {etiqueta && (
        <label htmlFor={id} className="mb-1.5 block text-[13px] font-semibold text-texto">
          {etiqueta}
        </label>
      )}
      <div className="relative">
        {Icono && (
          <Icono className="pointer-events-none absolute left-4 top-1/2 size-[18px] -translate-y-1/2 text-gris-2" aria-hidden />
        )}
        <Control
          id={id}
          type={esPassword && visible ? 'text' : type}
          aria-invalid={Boolean(error)}
          aria-describedby={error || ayuda ? `${id}-nota` : undefined}
          className={[
            'w-full rounded-2xl border bg-white text-[15px] text-tinta placeholder:text-gris-2 outline-none transition',
            'focus:border-tinta focus:ring-4 focus:ring-tinta/5',
            multilinea ? 'min-h-24 resize-y px-4 py-3' : 'h-12 px-4',
            Icono && 'pl-11',
            esPassword && 'pr-12',
            error ? 'border-[#B3261E]' : 'border-borde',
          ]
            .filter(Boolean)
            .join(' ')}
          {...resto}
        />
        {esPassword && (
          <button
            type="button"
            onClick={() => setVisible((v) => !v)}
            className="absolute right-2 top-1/2 grid size-9 -translate-y-1/2 place-items-center rounded-full text-gris hover:bg-crema"
            aria-label={visible ? 'Ocultar contraseña' : 'Mostrar contraseña'}
          >
            {visible ? <EyeOff className="size-[18px]" /> : <Eye className="size-[18px]" />}
          </button>
        )}
      </div>
      {(error || ayuda) && (
        <p id={`${id}-nota`} className={`mt-1.5 text-[12.5px] ${error ? 'text-[#B3261E]' : 'text-gris'}`}>
          {error ?? ayuda}
        </p>
      )}
    </div>
  );
}
