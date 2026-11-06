import { ArrowLeft, Copy, PackageX, Ruler, ScanLine, Share2, WifiOff } from 'lucide-react';
import { motion } from 'motion/react';
import { useRef, useState } from 'react';
import { useNavigate, useParams } from 'react-router';
import { informar } from '../../common/alertas/alertas';
import Boton from '../../common/components/Boton';
import EstadoVacio from '../../common/components/EstadoVacio';
import ImagenMueble from '../../common/components/ImagenMueble';
import Pagina from '../../common/components/Pagina';
import { useConsulta } from '../../common/hooks/useConsulta';
import { precio } from '../../common/utils/formato';
import { useNotificaciones } from '../../notificaciones/context/NotificacionesContext';
import { catalogoApi } from '../api/catalogoApi';
import BotonFavorito from '../components/BotonFavorito';
import Visor3D from '../components/Visor3D';

const aparece = (i) => ({
  initial: { opacity: 0, y: 12 },
  animate: { opacity: 1, y: 0, transition: { delay: 0.08 + i * 0.05, duration: 0.35 } },
});

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

export default function DetallePage() {
  const { slug } = useParams();
  const navegar = useNavigate();
  const visor = useRef(null);
  const [medidas, setMedidas] = useState(false);
  const { notificar } = useNotificaciones();
  const { datos: mueble, error, cargando } = useConsulta((s) => catalogoApi.mueble(slug, s), [slug]);

  const volver = () => (window.history.length > 1 ? navegar(-1) : navegar('/catalogo'));

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
          <Boton a="/catalogo" icono={ArrowLeft}>
            Volver al catálogo
          </Boton>
        </EstadoVacio>
      </Pagina>
    );
  }

  return (
    <Pagina className="mx-auto min-h-dvh max-w-5xl pb-32 md:grid md:grid-cols-[1.1fr_1fr] md:gap-8 md:px-6 md:pb-10 md:pt-6">
      <div className="relative md:sticky md:top-6 md:self-start">
        {cargando || !mueble ? (
          <div className="esqueleto h-[392px] rounded-b-[34px] md:h-[560px] md:rounded-[34px]" />
        ) : mueble.modeloUrl ? (
          <Visor3D ref={visor} mueble={mueble} mostrarMedidas={medidas} className="h-[392px] rounded-b-[34px] md:h-[560px] md:rounded-[34px]" />
        ) : (
          <ImagenMueble mueble={mueble} prioridad redondeo="rounded-b-[34px] md:rounded-[34px]" className="h-[392px] md:h-[560px]" />
        )}

        <div className="absolute inset-x-0 top-0 flex items-center justify-between px-4 pt-[calc(env(safe-area-inset-top)+14px)]">
          <button type="button" onClick={volver} className="grid size-10 place-items-center rounded-full bg-white/90 shadow-sm backdrop-blur" aria-label="Volver">
            <ArrowLeft className="size-[19px]" />
          </button>
          {mueble && (
            <div className="flex gap-2">
              <button type="button" onClick={compartir} className="grid size-10 place-items-center rounded-full bg-white/90 shadow-sm backdrop-blur" aria-label="Compartir">
                <Share2 className="size-[18px]" />
              </button>
              <BotonFavorito mueble={mueble} />
            </div>
          )}
        </div>

        {mueble?.modeloUrl && (
          <button
            type="button"
            onClick={() => setMedidas((v) => !v)}
            aria-pressed={medidas}
            className={`absolute bottom-4 right-4 inline-flex h-9 items-center gap-1.5 rounded-full px-3.5 text-[12.5px] font-semibold shadow-sm transition-colors ${
              medidas ? 'bg-tinta text-crema' : 'bg-white/90 text-tinta backdrop-blur'
            }`}
          >
            <Ruler className="size-4" /> Medidas
          </button>
        )}
      </div>

      <div className="px-5 pt-5 md:px-0 md:pt-2">
        {!mueble ? (
          <div className="space-y-3">
            <div className="esqueleto h-4 w-24 rounded-full" />
            <div className="esqueleto h-8 w-3/4 rounded-full" />
            <div className="esqueleto h-6 w-28 rounded-full" />
          </div>
        ) : (
          <>
            <motion.p {...aparece(0)} className="text-[13px] font-semibold uppercase tracking-wider text-terracota">
              {mueble.categoria?.nombre}
            </motion.p>
            <motion.div {...aparece(1)} className="mt-1 flex items-start justify-between gap-4">
              <h1 className="font-display text-[30px] font-bold leading-tight tracking-[-0.03em] md:text-[38px]">{mueble.nombre}</h1>
              <p className="mt-1.5 shrink-0 font-display text-[22px] font-bold">{precio(mueble.precio)}</p>
            </motion.div>
            {!mueble.publicado && (
              <motion.p {...aparece(1)} className="mt-2 inline-flex rounded-full bg-crema-2 px-3 py-1 text-[12px] font-semibold text-texto">
                Borrador · solo lo ves tú
              </motion.p>
            )}
            {mueble.descripcion && (
              <motion.p {...aparece(2)} className="mt-3 text-[15px] leading-relaxed text-texto">
                {mueble.descripcion}
              </motion.p>
            )}

            <motion.h2 {...aparece(3)} className="mt-6 font-display text-[16px] font-semibold">
              Medidas
            </motion.h2>
            <div className="mt-2 grid grid-cols-3 gap-2">
              <Cota etiqueta="Ancho" valor={mueble.anchoCm} i={4} />
              <Cota etiqueta="Fondo" valor={mueble.fondoCm} i={5} />
              <Cota etiqueta="Alto" valor={mueble.altoCm} i={6} />
            </div>

            {mueble.materiales && (
              <motion.div {...aparece(7)} className="mt-6">
                <h2 className="font-display text-[16px] font-semibold">Materiales</h2>
                <ul className="mt-2 flex flex-wrap gap-2">
                  {mueble.materiales.split(/[,;]/).map((m) => m.trim()).filter(Boolean).map((m) => (
                    <li key={m} className="rounded-full border border-borde bg-white px-3 py-1.5 text-[13px] font-medium">
                      {m}
                    </li>
                  ))}
                </ul>
              </motion.div>
            )}

            {mueble.vendedor && (
              <motion.p {...aparece(8)} className="mt-6 text-[13px] text-gris">
                Publicado por <span className="font-semibold text-texto">{mueble.vendedor.nombre}</span>
              </motion.p>
            )}

            {mueble.modeloUrl && (
              <motion.div
                initial={{ y: 80 }}
                animate={{ y: 0, transition: { delay: 0.25, type: 'spring', stiffness: 300, damping: 30 } }}
                className="pb-segura fixed inset-x-0 bottom-0 z-30 bg-gradient-to-t from-crema via-crema to-crema/0 px-4 pt-6 md:static md:mt-8 md:bg-none md:p-0"
              >
                <div className="mx-auto flex max-w-md gap-2 md:max-w-none">
                  <Boton variante="acento" icono={ScanLine} bloque onClick={verEnMiEspacio} className="h-14 text-[16px]">
                    Ver en mi espacio
                  </Boton>
                  <Boton variante="secundario" onClick={copiarEnlace} className="size-14 shrink-0 px-0" aria-label="Copiar enlace">
                    <Copy className="size-[18px]" />
                  </Boton>
                </div>
              </motion.div>
            )}
          </>
        )}
      </div>
    </Pagina>
  );
}
