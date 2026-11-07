import { ChevronRight, MessageSquareText } from 'lucide-react';
import { Link } from 'react-router';
import Estrellas from './Estrellas';

/** Promedio grande, estrellas y barras de 5 a 1. Con "enlace" lleva a la vista de reseñas. */
export default function ResumenResenas({ resumen, enlace }) {
  const { promedio = 0, total = 0, distribucion = [] } = resumen ?? {};
  const maximo = Math.max(1, ...distribucion.map((b) => b.total));

  return (
    <div className="rounded-[22px] border border-linea bg-white p-4">
      {total === 0 ? (
        <div className="flex items-center gap-3">
          <span className="grid size-11 shrink-0 place-items-center rounded-2xl bg-crema text-terracota">
            <MessageSquareText className="size-5" aria-hidden />
          </span>
          <div>
            <p className="font-display text-[15px] font-semibold">Aún sin reseñas</p>
            <p className="text-[13px] text-gris">Solo quien recibió el mueble puede reseñarlo.</p>
          </div>
        </div>
      ) : (
        <div className="flex items-center gap-4">
          <div className="w-24 shrink-0 text-center">
            <p className="font-display text-[36px] font-bold leading-none">{Number(promedio).toFixed(1)}</p>
            <Estrellas valor={promedio} tamano="size-3.5" className="mt-1.5" />
            <p className="mt-1 text-[12px] text-gris">
              {total} {total === 1 ? 'reseña' : 'reseñas'}
            </p>
          </div>
          <ul className="grid flex-1 gap-1" aria-label="Reseñas por estrellas">
            {distribucion.map((b) => (
              <li key={b.estrellas} className="flex items-center gap-2 text-[12px] text-texto">
                <span className="w-2.5 text-right">{b.estrellas}</span>
                <span className="h-1.5 flex-1 overflow-hidden rounded-full bg-crema-2">
                  <span className="block h-full rounded-full bg-terracota" style={{ width: `${(b.total / maximo) * 100}%` }} />
                </span>
                <span className="w-5 text-right text-gris">{b.total}</span>
              </li>
            ))}
          </ul>
        </div>
      )}
      {enlace && (
        <Link
          to={enlace}
          className="mt-3 flex h-11 items-center justify-center gap-1 rounded-full border border-borde text-[14px] font-semibold transition-colors hover:bg-crema"
        >
          {total === 0 ? 'Ver reseñas' : `Leer ${total === 1 ? 'la reseña' : `las ${total} reseñas`}`}
          <ChevronRight className="size-4" aria-hidden />
        </Link>
      )}
    </div>
  );
}
