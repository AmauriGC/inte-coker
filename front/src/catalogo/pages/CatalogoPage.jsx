import { Search, SearchX, WifiOff, X } from 'lucide-react';
import { AnimatePresence } from 'motion/react';
import { useState } from 'react';
import { useSearchParams } from 'react-router';
import Boton from '../../common/components/Boton';
import EstadoVacio from '../../common/components/EstadoVacio';
import Pagina from '../../common/components/Pagina';
import Selector from '../../common/components/Selector';
import { useConsulta } from '../../common/hooks/useConsulta';
import { useEnLinea } from '../../common/hooks/useEnLinea';
import { useRetraso } from '../../common/hooks/useRetraso';
import Encabezado from '../../layout/Encabezado';
import { catalogoApi, ORDENES } from '../api/catalogoApi';
import ChipsCategorias from '../components/ChipsCategorias';
import TarjetaMueble, { TarjetaEsqueleto } from '../components/TarjetaMueble';

const POR_PAGINA = 12;

/** Catálogo con búsqueda, categoría y orden en la URL (se puede compartir el enlace). */
export default function CatalogoPage() {
  const [parametros, setParametros] = useSearchParams();
  const categoria = parametros.get('categoria') ?? '';
  const orden = parametros.get('orden') ?? ORDENES[0].valor;
  const [texto, setTexto] = useState(parametros.get('q') ?? '');
  const buscar = useRetraso(texto.trim());
  const [paginas, setPaginas] = useState(1);
  const enLinea = useEnLinea();

  const categorias = useConsulta((s) => catalogoApi.categorias(s));
  const muebles = useConsulta(
    (s) => catalogoApi.muebles({ categoriaId: categoria, buscar, sort: orden, size: POR_PAGINA * paginas }, s),
    [categoria, buscar, orden, paginas],
  );

  function cambiar(clave, valor) {
    const siguiente = new URLSearchParams(parametros);
    if (valor) siguiente.set(clave, valor);
    else siguiente.delete(clave);
    setParametros(siguiente, { replace: true });
    setPaginas(1);
  }

  function escribir(valor) {
    setTexto(valor);
    setPaginas(1);
    const siguiente = new URLSearchParams(parametros);
    if (valor.trim()) siguiente.set('q', valor);
    else siguiente.delete('q');
    setParametros(siguiente, { replace: true });
  }

  const pagina = muebles.datos;
  const lista = pagina?.contenido ?? [];
  const primeraCarga = muebles.cargando && !pagina;

  return (
    <Pagina className="mx-auto max-w-5xl px-4">
      <Encabezado
        titulo="Catálogo"
        subtitulo="Muebles con modelo 3D y AR"
        acciones={
          !enLinea && (
            <span className="inline-flex items-center gap-1.5 rounded-full bg-crema-2 px-3 py-1.5 text-[12px] font-semibold text-texto">
              <WifiOff className="size-3.5" /> Sin conexión
            </span>
          )
        }
      />

      <div className="sticky top-0 z-20 -mx-4 space-y-3 bg-crema/90 px-4 pb-3 pt-2 backdrop-blur-xl">
        <label className="relative block">
          <span className="sr-only">Buscar muebles</span>
          <Search className="pointer-events-none absolute left-4 top-1/2 size-[18px] -translate-y-1/2 text-gris-2" aria-hidden />
          <input
            type="search"
            value={texto}
            onChange={(e) => escribir(e.target.value)}
            placeholder="Busca sofás, mesas, lámparas…"
            className="h-12 w-full rounded-full border border-borde bg-white pl-11 pr-11 text-[15px] outline-none transition placeholder:text-gris-2 focus:border-tinta focus:ring-4 focus:ring-tinta/5 [&::-webkit-search-cancel-button]:hidden"
          />
          {texto && (
            <button type="button" onClick={() => escribir('')} className="absolute right-2 top-1/2 grid size-8 -translate-y-1/2 place-items-center rounded-full text-gris hover:bg-crema" aria-label="Borrar búsqueda">
              <X className="size-4" />
            </button>
          )}
        </label>
        <ChipsCategorias categorias={categorias.datos?.contenido} activa={categoria} alElegir={(id) => cambiar('categoria', id)} />
      </div>

      <div className="mb-4 mt-2 flex items-center justify-between gap-3">
        <p className="text-[13px] font-medium text-gris" aria-live="polite">
          {primeraCarga ? 'Buscando…' : `${pagina?.totalElementos ?? 0} ${pagina?.totalElementos === 1 ? 'mueble' : 'muebles'}`}
        </p>
        <Selector compacto etiqueta="Ordenar" value={orden} onChange={(e) => cambiar('orden', e.target.value)} opciones={ORDENES} className="w-44" />
      </div>

      {muebles.error && !pagina ? (
        <EstadoVacio icono={WifiOff} titulo="No pudimos cargar el catálogo" texto={muebles.error.message}>
          <Boton variante="secundario" onClick={muebles.recargar}>
            Reintentar
          </Boton>
        </EstadoVacio>
      ) : !primeraCarga && lista.length === 0 ? (
        <EstadoVacio icono={SearchX} titulo="Sin resultados" texto="Prueba con otra palabra o quita el filtro de categoría.">
          <Boton
            variante="secundario"
            onClick={() => {
              setTexto('');
              setParametros({}, { replace: true });
            }}
          >
            Limpiar filtros
          </Boton>
        </EstadoVacio>
      ) : (
        <div className={`grid grid-cols-2 gap-x-3 gap-y-5 transition-opacity md:grid-cols-3 lg:grid-cols-4 ${muebles.cargando && pagina ? 'opacity-60' : ''}`}>
          {primeraCarga ? (
            Array.from({ length: 6 }, (_, i) => <TarjetaEsqueleto key={i} />)
          ) : (
            <AnimatePresence mode="popLayout">
              {lista.map((m, i) => (
                <TarjetaMueble key={m.id} mueble={m} indice={i % POR_PAGINA} />
              ))}
            </AnimatePresence>
          )}
        </div>
      )}

      {pagina && !pagina.ultima && lista.length > 0 && (
        <div className="mt-8 flex justify-center">
          <Boton variante="secundario" cargando={muebles.cargando} onClick={() => setPaginas((p) => p + 1)}>
            Ver más muebles
          </Boton>
        </div>
      )}
    </Pagina>
  );
}
