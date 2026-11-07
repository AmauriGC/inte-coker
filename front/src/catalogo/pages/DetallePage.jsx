import { ArrowLeft, CalendarClock, ChevronRight, Maximize, MessageCircle, Minimize, PackageX, Ruler, ScanLine, Share2, ShoppingBag, WifiOff } from 'lucide-react';
import { motion } from 'motion/react';
import { useCallback, useEffect, useRef, useState } from 'react';
import { Link, useLocation, useNavigate, useParams } from 'react-router';
import { useSesion } from '../../auth/context/SesionContext';
import { informar } from '../../common/alertas/alertas';
import Boton from '../../common/components/Boton';
import EstadoVacio from '../../common/components/EstadoVacio';
import ImagenMueble from '../../common/components/ImagenMueble';
import Pagina from '../../common/components/Pagina';
import { useConsulta } from '../../common/hooks/useConsulta';
import { precio } from '../../common/utils/formato';
import { useNotificaciones } from '../../notificaciones/context/NotificacionesContext';
import { metricasApi } from '../../metricas/api/metricasApi';
import HojaComprar from '../../pedidos/components/HojaComprar';
import HojaPreguntar from '../../pedidos/components/HojaPreguntar';
import { resenasApi } from '../../resenas/api/resenasApi';
import BotonMeGusta from '../../resenas/components/BotonMeGusta';
import AvatarVendedor from '../../vendedor/components/AvatarVendedor';
import Estrellas from '../../resenas/components/Estrellas';
import ResumenResenas from '../../resenas/components/ResumenResenas';
import { catalogoApi } from '../api/catalogoApi';
import BotonFavorito from '../components/BotonFavorito';
import { colorInicial } from '../../common/utils/colores';
import MuestrasColor from '../components/MuestrasColor';
import Visor3D from '../components/Visor3D';

const aparece = (i) => ({
  initial: { opacity: 0, y: 12 },
  animate: { opacity: 1, y: 0, transition: { delay: 0.08 + i * 0.05, duration: 0.35 } },
});

const flotante = 'grid size-11 place-items-center rounded-full bg-white/90 text-tinta shadow-sm backdrop-blur transition-colors hover:bg-white';

function Cota({ etiqueta, valor, i }) {
  return (
    <motion.div {...aparece(i)} className="rounded-2xl border border-linea bg-white px-3 py-3 text-center">
      <p className="text-[11.5px] font-semibold uppercase tracking-wider text-gris">{etiqueta}</p>
      <p className="mt-0.5 font-display text-[19px] font-bold">
        {valor}
        <span className="ml-0.5 text-[13px] font-medium text-gris">cm</span>
      </p>
    </motion.div>
  );
}

/** "Agotado", "Quedan N" (3 o menos) o "Disponible". */
function Existencias({ n }) {
  if (n === null || n === undefined) return null;
  const [texto, clases] =
    n === 0
      ? ['Agotado', 'bg-[#F6DAD7] text-[#8C1D17]']
      : n <= 3
        ? [`Quedan ${n}`, 'bg-terracota-suave text-terracota-osc']
        : ['Disponible', 'bg-salvia-suave text-salvia'];
  return <span className={`inline-flex rounded-full px-3 py-1 text-[12px] font-semibold ${clases}`}>{texto}</span>;
}

function Titulo({ children, i }) {
  return (
    <motion.h2 {...aparece(i)} className="font-display text-[16px] font-semibold">
      {children}
    </motion.h2>
  );
}

/**
 * Detalle con visor 3D y AR. El visor es lo principal: ocupa unos dos tercios de la
 * pantalla en el teléfono y la columna grande en escritorio. Debajo va una hoja con los
 * datos; las acciones quedan fijas encima de la bottom bar.
 * enPanel: se muestra dentro del panel (con la sidebar), sin comprar ni bottom bar.
 */
export default function DetallePage({ enPanel = false }) {
  const { slug } = useParams();
  const navegar = useNavigate();
  const visor = useRef(null);
  const ficha = useRef(null);
  const [medidas, setMedidas] = useState(false);
  const [ampliado, setAmpliado] = useState(false);
  const ubicacion = useLocation();
  const { notificar } = useNotificaciones();
  const { usuario, cuentaTienePermiso } = useSesion();
  const [hoja, setHoja] = useState(null);
  const [colorElegido, setColorElegido] = useState(null);
  const cerrarHoja = useCallback(() => setHoja(null), []);
  const { datos: mueble, error, cargando } = useConsulta((s) => catalogoApi.mueble(slug, s), [slug]);
  // Reseñas y me gusta solo de muebles publicados (un borrador no tiene).
  const conResenas = !enPanel && Boolean(mueble?.publicado);
  const resumenC = useConsulta((s) => (conResenas ? resenasApi.resumen(mueble.id, s) : Promise.resolve(null)), [mueble?.id, conResenas, usuario?.id]);
  const resumen = resumenC.datos;

  // Comprar es de la cuenta (no del rol activo); nadie compra lo que vende.
  const esMio = Boolean(usuario) && mueble?.vendedor?.id === usuario.id;
  const puedePedir = !enPanel && Boolean(mueble?.publicado) && !esMio && (!usuario || cuentaTienePermiso('PEDIDO_CREAR'));
  // Con colores, lo que se compra (y lo que se ve en el visor) es el color elegido.
  const variantes = mueble?.variantes ?? [];
  const colorId = colorInicial(variantes, colorElegido);
  const color = variantes.find((v) => v.id === colorId) ?? null;
  const agotado = color ? color.existencias === 0 : mueble?.existencias === 0;
  const conAcciones = Boolean(mueble) && (Boolean(mueble.modeloUrl) || puedePedir);

  // Una vista por sesión para las métricas (no en el panel ni en borradores).
  useEffect(() => {
    if (!enPanel && mueble?.publicado) metricasApi.vista(mueble.id);
  }, [enPanel, mueble?.id, mueble?.publicado]);

  // Pantalla completa propia (funciona también en iPhone, donde un div no entra a fullscreen).
  useEffect(() => {
    if (!ampliado) return undefined;
    const alTeclear = (e) => e.key === 'Escape' && setAmpliado(false);
    const antes = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    window.addEventListener('keydown', alTeclear);
    return () => {
      document.body.style.overflow = antes;
      window.removeEventListener('keydown', alTeclear);
    };
  }, [ampliado]);

  function abrir(cual) {
    if (!usuario) {
      navegar('/entrar', { state: { desde: ubicacion.pathname } });
      return;
    }
    setHoja(cual);
  }

  function alPedir(pedido, pregunta) {
    setHoja(null);
    notificar(
      pregunta
        ? { tipo: 'mensaje', titulo: 'Pregunta enviada', texto: 'Te avisamos cuando el vendedor responda.' }
        : { tipo: 'pedido', titulo: `Pedido ${pedido.folio} enviado`, texto: 'Sigue la conversación con el vendedor.' },
    );
    navegar(`/pedidos/${pedido.id}`);
  }

  const salida = enPanel ? '/panel/muebles' : '/catalogo';
  const volver = () => (enPanel || window.history.length <= 1 ? navegar(salida) : navegar(-1));

  async function copiarEnlace() {
    try {
      await navigator.clipboard.writeText(window.location.href);
      notificar({ tipo: 'exito', titulo: 'Enlace copiado', texto: 'Ábrelo en tu celular para usar AR.', guardar: false });
    } catch {
      notificar({ tipo: 'error', titulo: 'No se pudo copiar el enlace', guardar: false });
    }
  }

  async function verEnMiEspacio() {
    if (visor.current?.verEnAR()) return;
    const eleccion = await informar({
      titulo: 'AR disponible en tu celular',
      texto: 'Abre esta página en un teléfono Android con ARCore o en un iPhone para ver el mueble a escala real en tu espacio.',
      boton: 'Entendido',
      extra: 'Copiar enlace',
    });
    if (eleccion === 'extra') copiarEnlace();
  }

  async function compartir() {
    if (navigator.share) {
      try {
        await navigator.share({ title: mueble.nombre, text: `${mueble.nombre} en GC-Confort`, url: window.location.href });
      } catch {
        /* la persona canceló */
      }
    } else {
      copiarEnlace();
    }
  }

  if (error) {
    return (
      <Pagina className="mx-auto grid min-h-dvh max-w-md place-items-center px-4">
        <EstadoVacio
          icono={error.estado === 503 || error.estado === 0 ? WifiOff : PackageX}
          titulo={error.estado === 404 ? 'Este mueble ya no está' : error.estado === 503 || error.estado === 0 ? 'Sin conexión' : 'No pudimos cargarlo'}
          texto={error.message}
        >
          <Boton a={salida} icono={ArrowLeft}>
            {enPanel ? 'Volver a mis muebles' : 'Volver al catálogo'}
          </Boton>
        </EstadoVacio>
      </Pagina>
    );
  }

  const alto = 'h-[64dvh] min-h-[380px] max-h-[640px] md:h-[calc(100dvh-136px)] md:min-h-[520px] md:max-h-[820px]';
  const redondeo = ampliado ? '' : 'rounded-b-[34px] md:rounded-[34px]';
  const materiales = mueble?.materiales?.split(/[,;]/).map((m) => m.trim()).filter(Boolean) ?? [];

  const acciones = conAcciones && (
    <div className="grid gap-2">
      {puedePedir && (
        <div className="flex gap-2">
          <Boton variante="acento" icono={ShoppingBag} bloque disabled={agotado} onClick={() => abrir('comprar')} className="h-14 whitespace-nowrap text-[16px]">
            {agotado ? (color ? `Agotado en ${color.nombre}` : 'Agotado por ahora') : `Comprar · ${precio(mueble.precio)}`}
          </Boton>
          <Boton variante="secundario" disabled={agotado} onClick={() => abrir('apartar')} className="size-14 shrink-0 px-0 xl:w-auto xl:px-5" aria-label="Apartar con anticipo">
            <CalendarClock className="size-[19px]" aria-hidden />
            <span className="hidden xl:inline">Apartar</span>
          </Boton>
          <Boton variante="secundario" onClick={() => abrir('preguntar')} className="size-14 shrink-0 px-0 xl:w-auto xl:px-5" aria-label="Preguntar al vendedor">
            <MessageCircle className="size-[19px]" aria-hidden />
            <span className="hidden xl:inline">Preguntar</span>
          </Boton>
        </div>
      )}
      {mueble.modeloUrl && (
        <Boton
          variante={puedePedir ? 'primario' : 'acento'}
          icono={ScanLine}
          bloque
          onClick={verEnMiEspacio}
          className={puedePedir ? 'hidden md:inline-flex' : 'h-14 text-[16px]'}
        >
          Ver en mi espacio
        </Boton>
      )}
    </div>
  );

  return (
    <Pagina
      className={`mx-auto min-h-dvh max-w-6xl md:grid md:grid-cols-[minmax(0,1.55fr)_minmax(0,1fr)] md:gap-8 md:px-6 md:pb-10 md:pt-6 ${
        conAcciones && !enPanel ? 'pb-24' : ''
      }`}
    >
      <div className="md:sticky md:top-6 md:self-start">
        <section
          aria-label="Visor 3D"
          className={ampliado ? 'fixed inset-0 z-[60] bg-crema' : `relative ${alto}`}
        >
          {cargando || !mueble ? (
            <div className={`esqueleto h-full ${redondeo}`} />
          ) : mueble.modeloUrl ? (
            <Visor3D ref={visor} mueble={mueble} mostrarMedidas={medidas} color={color?.hex} className={`h-full ${redondeo}`} />
          ) : (
            <ImagenMueble mueble={mueble} prioridad redondeo={redondeo} className="h-full" />
          )}

          <div className="absolute inset-x-0 top-0 flex items-center justify-between px-4 pt-[calc(env(safe-area-inset-top)+14px)] md:px-5 md:pt-5">
            {ampliado ? (
              <span />
            ) : (
              <button type="button" onClick={volver} className={flotante} aria-label="Volver">
                <ArrowLeft className="size-[19px]" />
              </button>
            )}
            {mueble && (
              <div className="flex gap-2">
                {!ampliado && (
                  <>
                    <button type="button" onClick={compartir} className={flotante} aria-label="Compartir">
                      <Share2 className="size-[18px]" />
                    </button>
                    <BotonFavorito mueble={mueble} />
                  </>
                )}
                {ampliado && (
                  <button type="button" onClick={() => setAmpliado(false)} className={flotante} aria-label="Salir de pantalla completa">
                    <Minimize className="size-[18px]" />
                  </button>
                )}
              </div>
            )}
          </div>

          {mueble?.modeloUrl && variantes.length > 0 && (
            <div className="absolute left-4 top-1/2 -translate-y-1/2 rounded-full bg-white/90 p-1.5 shadow-[0_6px_18px_-8px_rgba(29,27,24,0.3)] backdrop-blur md:left-5">
              <MuestrasColor vertical variantes={variantes} valor={colorId} alElegir={setColorElegido} etiqueta="Color del mueble en 3D" />
            </div>
          )}

          {mueble?.modeloUrl && (
            <div className="absolute right-4 top-[calc(env(safe-area-inset-top)+76px)] flex flex-col gap-1.5 rounded-full bg-white/90 p-1.5 shadow-[0_6px_18px_-8px_rgba(29,27,24,0.3)] backdrop-blur md:right-5 md:top-20">
              <button type="button" onClick={verEnMiEspacio} className="grid size-11 place-items-center rounded-full bg-tinta text-crema" aria-label="Ver en mi espacio con AR">
                <ScanLine className="size-[19px]" />
              </button>
              <button
                type="button"
                onClick={() => setMedidas((v) => !v)}
                aria-pressed={medidas}
                className={`grid size-11 place-items-center rounded-full transition-colors ${medidas ? 'bg-terracota text-white' : 'text-tinta hover:bg-crema'}`}
                aria-label="Mostrar medidas"
              >
                <Ruler className="size-[19px]" />
              </button>
              {!ampliado && (
                <button type="button" onClick={() => setAmpliado(true)} className="grid size-11 place-items-center rounded-full text-tinta hover:bg-crema" aria-label="Pantalla completa">
                  <Maximize className="size-[18px]" />
                </button>
              )}
            </div>
          )}
        </section>
      </div>

      <div className="relative z-10 -mt-7 rounded-t-[28px] bg-crema px-5 pt-3 shadow-[0_-10px_30px_-18px_rgba(29,27,24,0.35)] md:mt-0 md:rounded-none md:px-0 md:pt-2 md:shadow-none">
        <div className="mx-auto mb-3 h-[5px] w-10 rounded-full bg-borde md:hidden" aria-hidden />
        {!mueble ? (
          <div className="space-y-3">
            <div className="esqueleto h-4 w-24 rounded-full" />
            <div className="esqueleto h-8 w-3/4 rounded-full" />
            <div className="esqueleto h-6 w-28 rounded-full" />
          </div>
        ) : (
          <>
            <motion.p {...aparece(0)} className="text-[12.5px] font-semibold uppercase tracking-wider text-terracota">
              {mueble.categoria?.nombre}
            </motion.p>
            <motion.div {...aparece(1)} className="mt-0.5 flex items-start justify-between gap-4">
              <h1 className="font-display text-[28px] font-bold leading-tight tracking-[-0.03em] md:text-[40px]">{mueble.nombre}</h1>
              <p className="mt-1.5 shrink-0 font-display text-[22px] font-bold md:mt-3 md:text-[26px]">{precio(mueble.precio)}</p>
            </motion.div>
            <motion.div {...aparece(1)} className="mt-2 flex flex-wrap items-center gap-2">
              <Existencias n={mueble.existencias} />
              {mueble.totalResenas > 0 && (
                <Link to={`/mueble/${mueble.slug}/resenas`} className="inline-flex items-center gap-1.5 text-[13px] font-semibold text-tinta hover:text-terracota">
                  <Estrellas valor={mueble.calificacion} tamano="size-3.5" />
                  {Number(mueble.calificacion).toFixed(1)}
                  <span className="font-normal text-gris">({mueble.totalResenas})</span>
                </Link>
              )}
              {resumen && (
                <span className="ml-auto">
                  <BotonMeGusta
                    muebleId={mueble.id}
                    meGusta={resumen.meGusta}
                    total={resumen.totalMeGusta}
                    alCambiar={(r) => resumenC.mutar((d) => ({ ...d, meGusta: r.meGusta, totalMeGusta: r.total }))}
                  />
                </span>
              )}
              {!mueble.publicado && (
                <span className="inline-flex rounded-full bg-crema-2 px-3 py-1 text-[12px] font-semibold text-texto">Borrador · solo lo ves tú</span>
              )}
            </motion.div>

            {color && (
              <motion.div {...aparece(2)} className="mt-4 rounded-[18px] border border-linea bg-white px-4 py-3">
                <div className="flex items-center justify-between gap-3">
                  <p className="text-[13.5px]">
                    <span className="text-gris">Color </span>
                    <strong className="font-display">{color.nombre}</strong>
                  </p>
                  <Existencias n={color.existencias} />
                </div>
                <div className="mt-2.5">
                  <MuestrasColor variantes={variantes} valor={colorId} alElegir={setColorElegido} />
                </div>
              </motion.div>
            )}

            <motion.button
              {...aparece(2)}
              type="button"
              onClick={() => ficha.current?.scrollIntoView({ behavior: 'smooth', block: 'start' })}
              className="mt-4 flex w-full items-center justify-between gap-3 rounded-[18px] border border-linea bg-white px-4 py-3 text-left md:hidden"
            >
              <span className="min-w-0 truncate text-[13.5px]">
                <strong className="font-display">
                  {mueble.anchoCm} × {mueble.fondoCm} × {mueble.altoCm} cm
                </strong>
                {materiales.length > 0 && <span className="text-gris"> · {materiales.slice(0, 2).join(' y ').toLowerCase()}</span>}
              </span>
              <span className="inline-flex shrink-0 items-center text-[13px] font-semibold text-terracota">
                Detalles <ChevronRight className="size-4" aria-hidden />
              </span>
            </motion.button>

            {acciones && (
              <motion.div
                initial={{ y: 80 }}
                animate={{ y: 0, transition: { delay: 0.25, type: 'spring', stiffness: 300, damping: 30 } }}
                className={
                  enPanel
                    ? 'mt-6'
                    : 'fixed inset-x-0 bottom-[calc(env(safe-area-inset-bottom)+80px)] z-30 bg-gradient-to-t from-crema from-60% to-crema/0 px-4 pb-2 pt-6 md:static md:mt-6 md:bg-none md:p-0'
                }
              >
                <div className="mx-auto max-w-md md:max-w-none">{acciones}</div>
              </motion.div>
            )}

            <div ref={ficha} className="scroll-mt-4 space-y-6 pt-6">
              {mueble.descripcion && (
                <motion.p {...aparece(3)} className="text-[15px] leading-relaxed text-texto">
                  {mueble.descripcion}
                </motion.p>
              )}

              <div>
                <Titulo i={4}>Medidas</Titulo>
                <div className="mt-2 grid grid-cols-3 gap-2">
                  <Cota etiqueta="Ancho" valor={mueble.anchoCm} i={5} />
                  <Cota etiqueta="Fondo" valor={mueble.fondoCm} i={6} />
                  <Cota etiqueta="Alto" valor={mueble.altoCm} i={7} />
                </div>
              </div>

              {materiales.length > 0 && (
                <div>
                  <Titulo i={8}>Materiales</Titulo>
                  <ul className="mt-2 flex flex-wrap gap-2">
                    {materiales.map((m) => (
                      <li key={m} className="rounded-full border border-borde bg-white px-3 py-1.5 text-[13px] font-medium">
                        {m}
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {mueble.vendedor && (
                <motion.div {...aparece(9)} className="flex items-center gap-3 rounded-[22px] border border-linea bg-white p-3.5">
                  <Link
                    to={mueble.vendedor.slug && !enPanel ? `/vendedor/${mueble.vendedor.slug}` : '#'}
                    onClick={(e) => (!mueble.vendedor.slug || enPanel) && e.preventDefault()}
                    className="group flex min-w-0 flex-1 items-center gap-3"
                  >
                    <AvatarVendedor nombre={mueble.vendedor.nombre} fotoUrl={mueble.vendedor.fotoUrl} />
                    <span className="min-w-0 flex-1">
                      <span className="block text-[12px] text-gris">Lo vende</span>
                      <span className="block truncate text-[15px] font-bold group-hover:text-terracota">{mueble.vendedor.nombre}</span>
                      {mueble.vendedor.slug && !enPanel && <span className="block text-[12px] font-semibold text-terracota">Ver perfil y trabajos</span>}
                    </span>
                  </Link>
                  {puedePedir && (
                    <button type="button" onClick={() => abrir('preguntar')} className="shrink-0 text-[13px] font-semibold text-terracota hover:text-terracota-osc">
                      Preguntar
                    </button>
                  )}
                </motion.div>
              )}

              {resumen && (
                <div>
                  <Titulo i={10}>Reseñas</Titulo>
                  <div className="mt-2">
                    <ResumenResenas resumen={resumen} enlace={`/mueble/${mueble.slug}/resenas`} />
                  </div>
                </div>
              )}
            </div>

            {puedePedir && (
              <>
                <HojaComprar
                  abierta={hoja === 'comprar' || hoja === 'apartar'}
                  apartar={hoja === 'apartar'}
                  alCerrar={cerrarHoja}
                  mueble={mueble}
                  color={colorId}
                  alCambiarColor={setColorElegido}
                  alListo={(p) => alPedir(p, false)}
                />
                <HojaPreguntar abierta={hoja === 'preguntar'} alCerrar={cerrarHoja} mueble={mueble} alListo={(p) => alPedir(p, true)} />
              </>
            )}
          </>
        )}
      </div>
    </Pagina>
  );
}
