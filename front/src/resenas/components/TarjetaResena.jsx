import { BadgeCheck, EyeOff, Reply } from 'lucide-react';
import { haceCuanto } from '../../common/utils/formato';
import Estrellas from './Estrellas';

/**
 * Una reseña con su respuesta. alResponder: el vendedor (o el admin) puede responder o
 * corregir su respuesta. alOcultar: moderación.
 */
export default function TarjetaResena({ resena, alResponder, alOcultar, vendedor }) {
  return (
    <article className={`rounded-[22px] border bg-white p-4 ${resena.oculta ? 'border-dashed border-borde opacity-70' : 'border-linea'}`}>
      <header className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="truncate text-[14px] font-semibold">
            {resena.autor}
            {resena.propia && <span className="ml-1.5 text-[12px] font-medium text-terracota">(tú)</span>}
          </p>
          <p className="mt-0.5 inline-flex items-center gap-1 text-[12px] text-gris">
            <BadgeCheck className="size-3.5 text-salvia" aria-hidden /> Compra verificada · {haceCuanto(resena.creadoEn)}
            {resena.editada && ' · editada'}
          </p>
        </div>
        <Estrellas valor={resena.estrellas} />
      </header>
      {resena.mueble && <p className="mt-2 text-[12.5px] font-semibold text-terracota">{resena.mueble.nombre}</p>}
      {resena.texto && <p className="mt-2 whitespace-pre-line text-[14.5px] leading-relaxed text-texto">{resena.texto}</p>}

      {resena.respuesta && (
        <div className="mt-3 rounded-2xl bg-crema px-3.5 py-3">
          <p className="text-[12px] font-semibold text-tinta">Respuesta de {vendedor ?? 'quien lo vende'}</p>
          <p className="mt-1 whitespace-pre-line text-[14px] leading-relaxed text-texto">{resena.respuesta}</p>
        </div>
      )}

      {(alResponder || alOcultar) && (
        <div className="mt-3 flex flex-wrap gap-2">
          {alResponder && (
            <button type="button" onClick={() => alResponder(resena)} className="inline-flex h-9 items-center gap-1.5 rounded-full border border-borde px-3 text-[13px] font-semibold hover:bg-crema">
              <Reply className="size-4" aria-hidden /> {resena.respuesta ? 'Editar respuesta' : 'Responder'}
            </button>
          )}
          {alOcultar && (
            <button type="button" onClick={() => alOcultar(resena)} className="inline-flex h-9 items-center gap-1.5 rounded-full border border-borde px-3 text-[13px] font-semibold hover:bg-crema">
              <EyeOff className="size-4" aria-hidden /> {resena.oculta ? 'Volver a mostrar' : 'Ocultar'}
            </button>
          )}
        </div>
      )}
    </article>
  );
}
