import { ArrowLeft } from 'lucide-react';
import { useNavigate } from 'react-router';

/** Cabecera de las pantallas públicas: título grande, subtítulo y acciones a la derecha. */
export default function Encabezado({ titulo, subtitulo, volver = false, acciones, className = '' }) {
  const navegar = useNavigate();
  return (
    <header className={`flex items-end gap-3 pb-4 pt-[calc(env(safe-area-inset-top)+20px)] ${className}`}>
      {volver && (
        <button
          type="button"
          onClick={() => (window.history.length > 1 ? navegar(-1) : navegar('/'))}
          className="mb-0.5 grid size-10 shrink-0 place-items-center rounded-full border border-borde bg-white"
          aria-label="Volver"
        >
          <ArrowLeft className="size-[18px]" />
        </button>
      )}
      <div className="min-w-0 flex-1">
        {subtitulo && <p className="text-[13px] font-medium text-gris">{subtitulo}</p>}
        <h1 className="truncate font-display text-[28px] font-bold leading-tight tracking-[-0.025em]">{titulo}</h1>
      </div>
      {acciones && <div className="flex shrink-0 items-center gap-2">{acciones}</div>}
    </header>
  );
}
