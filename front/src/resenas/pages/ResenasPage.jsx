import { MessageSquareText, PenLine, Star } from 'lucide-react';
import { useCallback, useState } from 'react';
import { Link, useParams, useSearchParams } from 'react-router';
import { useSesion } from '../../auth/context/SesionContext';
import { catalogoApi } from '../../catalogo/api/catalogoApi';
import { pedirTexto } from '../../common/alertas/alertas';
import Boton from '../../common/components/Boton';
import EstadoVacio from '../../common/components/EstadoVacio';
import ImagenMueble from '../../common/components/ImagenMueble';
import Pagina from '../../common/components/Pagina';
import Selector from '../../common/components/Selector';
import { useConsulta } from '../../common/hooks/useConsulta';
import { precio } from '../../common/utils/formato';
import Encabezado from '../../layout/Encabezado';
import { useNotificaciones } from '../../notificaciones/context/NotificacionesContext';
import { resenasApi } from '../api/resenasApi';
import BotonMeGusta from '../components/BotonMeGusta';
import HojaResena from '../components/HojaResena';
import ResumenResenas from '../components/ResumenResenas';
import TarjetaResena from '../components/TarjetaResena';

const PASO = 10;
const ORDENES = [
  { valor: 'recientes', texto: 'Más recientes' },
  { valor: 'mejores', texto: 'Mejor calificadas' },
  { valor: 'peores', texto: 'Peor calificadas' },
];

/**
 * Vista propia de las reseñas de un mueble: resumen, filtro por estrellas, orden y lista.
 * Quien recibió el mueble la escribe aquí (?escribir=1 abre la hoja); el vendedor responde.
 */
export default function ResenasPage() {
  const { slug } = useParams();
  const [parametros, setParametros] = useSearchParams();
  const { usuario, tienePermiso } = useSesion();
  const { notificar } = useNotificaciones();
  const [estrellas, setEstrellas] = useState('');
  const [orden, setOrden] = useState('recientes');
  const [cuantos, setCuantos] = useState(PASO);

  const muebleC = useConsulta((s) => catalogoApi.mueble(slug, s), [slug]);
  const mueble = muebleC.datos;
  const id = mueble?.id;
  const resumenC = useConsulta((s) => (id ? resenasApi.resumen(id, s) : Promise.resolve(null)), [id, usuario?.id]);
  const listaC = useConsulta(
    (s) => (id ? resenasApi.lista(id, { estrellas, orden, size: cuantos }, s) : Promise.resolve(null)),
    [id, estrellas, orden, cuantos, usuario?.id],
  );
  const resumen = resumenC.datos;
  const resenas = listaC.datos?.contenido ?? [];

  const escribir = parametros.get('escribir') === '1' && Boolean(resumen?.puedeResenar);
  const cerrarHoja = useCallback(() => setParametros({}, { replace: true }), [setParametros]);
  const abrirHoja = () => setParametros({ escribir: '1' }, { replace: true });

  const puedeResponder = Boolean(usuario) && (usuario.id === mueble?.vendedor?.id || tienePermiso('RESENA_MODERAR'));

  async function responder(resena) {
    const texto = await pedirTexto({
      titulo: resena.respuesta ? 'Editar tu respuesta' : `Responder a ${resena.autor}`,
      placeholder: 'Agradece, aclara o cuenta qué harán al respecto',
      boton: 'Publicar respuesta',
      obligatorio: true,
      vacio: 'Escribe la respuesta',
      inicial: resena.respuesta ?? '',
      maximo: 1000,
    });
    if (!texto) return;
    try {
      const nueva = await resenasApi.responder(resena.id, texto);
      listaC.mutar((d) => ({ ...d, contenido: d.contenido.map((r) => (r.id === nueva.id ? { ...r, respuesta: nueva.respuesta } : r)) }));
      notificar({ tipo: 'exito', titulo: 'Respuesta publicada', guardar: false });
    } catch (e) {
      notificar({ tipo: 'error', titulo: 'No se publicó la respuesta', texto: e.message, guardar: false });
    }
  }

  if (muebleC.error) {
    return (
      <Pagina className="mx-auto grid min-h-[70dvh] max-w-md place-items-center px-4">
        <EstadoVacio titulo="Este mueble ya no está" texto={muebleC.error.message}>
          <Boton a="/catalogo">Volver al catálogo</Boton>
        </EstadoVacio>
      </Pagina>
    );
  }

  const filtros = [{ valor: '', texto: 'Todas' }, ...[5, 4, 3, 2, 1].map((n) => ({ valor: String(n), texto: String(n) }))];

  return (
    <Pagina className="mx-auto max-w-2xl px-4">
      <Encabezado volver titulo="Reseñas" subtitulo={mueble?.nombre ?? ' '} />

      {mueble && (
        <div className="mb-4 flex items-center gap-3 rounded-[22px] border border-linea bg-white p-2.5 pr-4">
          <Link to={`/mueble/${mueble.slug}`} className="flex min-w-0 flex-1 items-center gap-3">
            <ImagenMueble mueble={mueble} className="size-16 shrink-0" redondeo="rounded-2xl" />
            <span className="min-w-0 flex-1">
              <span className="block truncate font-display text-[16px] font-semibold">{mueble.nombre}</span>
              <span className="block text-[13px] text-gris">
                {mueble.categoria?.nombre} · {precio(mueble.precio)}
              </span>
            </span>
          </Link>
          {resumen && (
            <BotonMeGusta
              muebleId={mueble.id}
              meGusta={resumen.meGusta}
              total={resumen.totalMeGusta}
              alCambiar={(r) => resumenC.mutar((d) => ({ ...d, meGusta: r.meGusta, totalMeGusta: r.total }))}
            />
          )}
        </div>
      )}

      {!resumen ? (
        <div className="esqueleto h-36 rounded-[22px]" />
      ) : (
        <>
          <ResumenResenas resumen={resumen} />
          {resumen.puedeResenar && (
            <Boton variante={resumen.miResena ? 'secundario' : 'acento'} icono={PenLine} bloque onClick={abrirHoja} className="mt-3">
              {resumen.miResena ? 'Editar mi reseña' : 'Escribir reseña'}
            </Boton>
          )}
        </>
      )}

      <div className="mt-6 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <div role="radiogroup" aria-label="Filtrar por estrellas" className="-mx-4 flex gap-1.5 overflow-x-auto px-4 [scrollbar-width:none] sm:mx-0 sm:px-0">
          {filtros.map((f) => (
            <button
              key={f.valor}
              type="button"
              role="radio"
              aria-checked={estrellas === f.valor}
              onClick={() => {
                setEstrellas(f.valor);
                setCuantos(PASO);
              }}
              className={`inline-flex h-9 shrink-0 items-center gap-1 rounded-full border px-3 text-[13px] font-semibold transition-colors ${
                estrellas === f.valor ? 'border-tinta bg-tinta text-crema' : 'border-borde bg-white hover:bg-crema'
              }`}
            >
              {f.texto}
              {f.valor && <Star className="size-3.5" fill="currentColor" strokeWidth={0} aria-hidden />}
            </button>
          ))}
        </div>
        <Selector
          compacto
          etiqueta="Ordenar reseñas"
          opciones={ORDENES}
          value={orden}
          onChange={(e) => {
            setOrden(e.target.value);
            setCuantos(PASO);
          }}
          className="w-44 self-end sm:self-auto"
        />
      </div>

      <div className="mt-4 grid gap-3 pb-6">
        {!listaC.datos ? (
          [0, 1].map((i) => <div key={i} className="esqueleto h-28 rounded-[22px]" />)
        ) : resenas.length === 0 ? (
          <EstadoVacio
            icono={MessageSquareText}
            titulo={estrellas ? `Sin reseñas de ${estrellas} estrellas` : 'Aún no hay reseñas'}
            texto={estrellas ? 'Prueba con otro filtro.' : 'Cuando alguien reciba este mueble podrá contar cómo le fue.'}
          />
        ) : (
          <>
            {resenas.map((r) => (
              <TarjetaResena key={r.id} resena={r} vendedor={mueble?.vendedor?.nombre} alResponder={puedeResponder ? responder : undefined} />
            ))}
            {!listaC.datos.ultima && (
              <Boton variante="secundario" bloque cargando={listaC.cargando} onClick={() => setCuantos((n) => n + PASO)}>
                Ver más reseñas
              </Boton>
            )}
          </>
        )}
      </div>

      {mueble && resumen?.puedeResenar && (
        <HojaResena
          abierta={escribir}
          alCerrar={cerrarHoja}
          mueble={mueble}
          actual={resumen.miResena}
          alListo={() => {
            cerrarHoja();
            resumenC.recargar();
            listaC.recargar();
            notificar({ tipo: 'exito', titulo: 'Gracias por tu reseña', texto: 'Ya aparece como compra verificada.', guardar: false });
          }}
        />
      )}
    </Pagina>
  );
}
