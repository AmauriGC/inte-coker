import { Columns3, Star, X } from 'lucide-react';
import { Link } from 'react-router';
import Boton from '../../common/components/Boton';
import EstadoVacio from '../../common/components/EstadoVacio';
import ImagenMueble from '../../common/components/ImagenMueble';
import Pagina from '../../common/components/Pagina';
import { useConsulta } from '../../common/hooks/useConsulta';
import { precio } from '../../common/utils/formato';
import { comparacion, useListaLocal } from '../../common/utils/listaLocal';
import Encabezado from '../../layout/Encabezado';
import { catalogoApi } from '../api/catalogoApi';

/**
 * Hasta 3 muebles lado a lado: precio, medidas, materiales, colores, calificación y
 * vendedor. La lista vive en el dispositivo; los datos se piden al día.
 */
export default function CompararPage() {
  const lista = useListaLocal(comparacion);
  const slugs = lista.map((m) => m.slug).join(',');
  const { datos, error } = useConsulta(
    (s) => Promise.all(lista.map((m) => catalogoApi.mueble(m.slug, s).catch(() => null))),
    [slugs],
  );
  const muebles = (datos ?? []).filter(Boolean);
  const minimo = muebles.length > 1 ? Math.min(...muebles.map((m) => Number(m.precio))) : null;

  if (lista.length === 0) {
    return (
      <Pagina className="mx-auto max-w-3xl px-4 pb-32">
        <Encabezado volver titulo="Comparar" />
        <EstadoVacio icono={Columns3} titulo="Nada que comparar aún" texto="En el detalle de un mueble toca Comparar; puedes juntar hasta 3.">
          <Boton a="/catalogo">Explorar el catálogo</Boton>
        </EstadoVacio>
      </Pagina>
    );
  }

  const filas = [
    { etiqueta: 'Precio', valor: (m) => <span className="font-display text-[17px] font-bold">{precio(m.precio)}</span> },
    { etiqueta: 'Medidas', valor: (m) => `${m.anchoCm} × ${m.fondoCm} × ${m.altoCm} cm` },
    { etiqueta: 'Piezas', valor: (m) => (m.existencias > 0 ? `${m.existencias} disponibles` : 'Agotado') },
    {
      etiqueta: 'Colores',
      valor: (m) =>
        m.variantes?.length ? (
          <span className="flex flex-wrap gap-1">
            {m.variantes.map((v) => (
              <span key={v.id} title={v.nombre} className={`size-4 rounded-full border border-black/10 ${v.existencias === 0 ? 'opacity-35' : ''}`} style={{ backgroundColor: v.hex }} />
            ))}
          </span>
        ) : (
          'Uno solo'
        ),
    },
    { etiqueta: 'Materiales', valor: (m) => m.materiales || '—' },
    {
      etiqueta: 'Calificación',
      valor: (m) =>
        m.totalResenas > 0 ? (
          <span className="inline-flex items-center gap-1">
            <Star className="size-3.5 fill-terracota text-terracota" aria-hidden />
            {Number(m.calificacion).toFixed(1)} ({m.totalResenas})
          </span>
        ) : (
          'Sin reseñas'
        ),
    },
    { etiqueta: 'Vendedor', valor: (m) => m.vendedor?.nombre ?? '—' },
  ];

  return (
    <Pagina className="mx-auto max-w-4xl px-4 pb-32">
      <Encabezado
        volver
        titulo="Comparar"
        subtitulo={`${lista.length} de ${comparacion.maximo} muebles`}
        acciones={
          <Boton variante="fantasma" onClick={() => comparacion.vaciar()}>
            Vaciar
          </Boton>
        }
      />

      {error && !datos ? (
        <p role="alert" className="rounded-2xl bg-[#F6DAD7] px-4 py-3 text-[13.5px] text-[#8C1D17]">{error.message}</p>
      ) : !datos ? (
        <div className="esqueleto h-96 rounded-[24px]" />
      ) : (
        <div className="-mx-4 overflow-x-auto px-4">
          <table className="w-full table-fixed border-separate border-spacing-x-2 text-left text-[13px]" style={{ minWidth: 88 + muebles.length * 136 }}>
            <thead>
              <tr>
                <th scope="col" className="w-[76px] align-bottom">
                  <span className="sr-only">Dato</span>
                </th>
                {muebles.map((m) => (
                  <th key={m.id} scope="col" className="align-top font-normal">
                    <div className="relative rounded-[22px] border border-linea bg-white p-2.5">
                      <button
                        type="button"
                        onClick={() => comparacion.quitar(m.id)}
                        className="absolute right-1.5 top-1.5 z-10 grid size-8 place-items-center rounded-full bg-white/90 text-tinta shadow-sm hover:bg-crema"
                        aria-label={`Quitar ${m.nombre}`}
                      >
                        <X className="size-4" />
                      </button>
                      <ImagenMueble mueble={m} sombra={false} redondeo="rounded-2xl" className="aspect-square w-full" />
                      <Link to={`/mueble/${m.slug}`} className="mt-2 line-clamp-2 block font-display text-[14.5px] font-semibold leading-tight hover:underline">
                        {m.nombre}
                      </Link>
                      {minimo !== null && Number(m.precio) === minimo && (
                        <span className="mt-1 inline-block rounded-full bg-salvia-suave px-2 py-0.5 text-[11px] font-semibold text-salvia">Más económico</span>
                      )}
                    </div>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filas.map((f) => (
                <tr key={f.etiqueta}>
                  <th scope="row" className="border-b border-linea py-3 pr-2 align-top text-[11.5px] font-semibold uppercase tracking-wider text-gris">
                    {f.etiqueta}
                  </th>
                  {muebles.map((m) => (
                    <td key={m.id} className="break-words border-b border-linea py-3 align-top text-tinta">
                      {f.valor(m)}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
      {muebles.length < comparacion.maximo && datos && (
        <Boton variante="secundario" a="/catalogo" className="mt-5">
          Agregar otro mueble
        </Boton>
      )}
    </Pagina>
  );
}
