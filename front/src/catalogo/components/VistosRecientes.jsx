import { History } from 'lucide-react';
import { Link } from 'react-router';
import ImagenMueble from '../../common/components/ImagenMueble';
import { precio } from '../../common/utils/formato';
import { useListaLocal, vistosRecientes } from '../../common/utils/listaLocal';

/** Los últimos muebles que se abrieron en este dispositivo (no se suben a la cuenta). */
export default function VistosRecientes({ className = '' }) {
  const vistos = useListaLocal(vistosRecientes);
  if (vistos.length === 0) return null;

  return (
    <section className={className} aria-labelledby="titulo-vistos">
      <div className="mb-3 flex items-end justify-between">
        <h2 id="titulo-vistos" className="flex items-center gap-2 font-display text-xl font-semibold tracking-[-0.02em]">
          <History className="size-5 text-gris" aria-hidden />
          Vistos recientemente
        </h2>
        <button type="button" onClick={() => vistosRecientes.vaciar()} className="text-[13px] font-semibold text-gris hover:text-tinta">
          Borrar
        </button>
      </div>
      <ul className="-mx-4 flex gap-3 overflow-x-auto px-4 pb-1">
        {vistos.map((m) => (
          <li key={m.id} className="w-32 shrink-0">
            <Link to={`/mueble/${m.slug}`} className="group block">
              <ImagenMueble mueble={m} sombra={false} redondeo="rounded-[20px]" className="aspect-square w-full" />
              <p className="mt-1.5 truncate text-[13px] font-semibold group-hover:underline">{m.nombre}</p>
              <p className="text-[12.5px] text-gris">{precio(m.precio)}</p>
            </Link>
          </li>
        ))}
      </ul>
    </section>
  );
}
