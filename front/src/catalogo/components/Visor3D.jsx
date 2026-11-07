import { Move3d } from 'lucide-react';
import { AnimatePresence, motion } from 'motion/react';
import { useEffect, useImperativeHandle, useRef, useState } from 'react';
import { urlArchivo } from '../../app/config';
import { estiloCategoria } from '../../common/utils/categorias';

/** Carga el web component una sola vez y solo cuando hace falta (pesa ~1 MB con three). */
let promesaVisor = null;
function cargarModelViewer() {
  promesaVisor ??= import('@google/model-viewer');
  return promesaVisor;
}

/** "#RRGGBB" (sRGB) a RGBA lineal, que es como glTF guarda baseColorFactor. */
function hexALineal(hex) {
  const canal = (i) => {
    const c = parseInt(hex.slice(i, i + 2), 16) / 255;
    return c <= 0.04045 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4;
  };
  return [canal(1), canal(3), canal(5), 1];
}

/** Material que se tiñe: GC_Color si el modelo lo trae; si no, el primero. */
function materialTenible(el) {
  const materiales = el?.model?.materials ?? [];
  return materiales.find((m) => m.name === 'GC_Color') ?? materiales[0] ?? null;
}

/** Líneas de cota encima del visor (tablero Detalle, botón "Medidas"). */
function Cotas({ mueble }) {
  const linea = 'absolute bg-tinta/70';
  const etiqueta = 'absolute rounded-full bg-tinta px-2.5 py-1 text-[11.5px] font-semibold text-crema shadow';
  return (
    <motion.div className="pointer-events-none absolute inset-0" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} aria-hidden>
      <motion.div className={`${linea} bottom-[14%] left-[14%] right-[14%] h-px origin-left`} initial={{ scaleX: 0 }} animate={{ scaleX: 1 }} transition={{ duration: 0.5 }}>
        <span className="absolute -top-1.5 left-0 h-3 w-px bg-tinta/70" />
        <span className="absolute -top-1.5 right-0 h-3 w-px bg-tinta/70" />
      </motion.div>
      <span className={`${etiqueta} bottom-[14%] left-1/2 -translate-x-1/2 translate-y-1/2`}>Ancho {mueble.anchoCm} cm</span>

      <motion.div className={`${linea} bottom-[24%] right-[9%] top-[22%] w-px origin-bottom`} initial={{ scaleY: 0 }} animate={{ scaleY: 1 }} transition={{ duration: 0.5, delay: 0.1 }}>
        <span className="absolute -left-1.5 top-0 h-px w-3 bg-tinta/70" />
        <span className="absolute -left-1.5 bottom-0 h-px w-3 bg-tinta/70" />
      </motion.div>
      <span className={`${etiqueta} right-[9%] top-1/2 translate-x-1/2 -translate-y-1/2 rotate-90`}>Alto {mueble.altoCm} cm</span>

      <span className={`${etiqueta} left-[10%] top-[24%] bg-white! text-tinta!`}>Fondo {mueble.fondoCm} cm</span>
    </motion.div>
  );
}

/**
 * Visor 3D con model-viewer: girar, zoom y AR a escala real (ar-scale="fixed").
 * color: "#RRGGBB" para teñir en vivo el material GC_Color (null = color original del modelo).
 * Expone por ref: verEnAR() → true si abrió AR, false si el dispositivo no lo admite.
 */
export default function Visor3D({ mueble, mostrarMedidas = false, color = null, ref, className = '' }) {
  const visor = useRef(null);
  const [listo, setListo] = useState(false);
  const [progreso, setProgreso] = useState(0);
  const [cargado, setCargado] = useState(false);
  const [interactuo, setInteractuo] = useState(false);
  const { tinte } = estiloCategoria(mueble.categoria?.slug);
  const src = urlArchivo(mueble.modeloUrl);
  const original = useRef(null);

  useEffect(() => {
    let vivo = true;
    cargarModelViewer().then(() => vivo && setListo(true));
    return () => {
      vivo = false;
    };
  }, []);

  useEffect(() => {
    const el = visor.current;
    if (!listo || !el) return undefined;
    const alProgreso = (e) => setProgreso(e.detail.totalProgress ?? 0);
    const alCargar = () => {
      original.current = null;
      setCargado(true);
    };
    const alMover = (e) => e.detail?.source === 'user-interaction' && setInteractuo(true);
    el.addEventListener('progress', alProgreso);
    el.addEventListener('load', alCargar);
    el.addEventListener('camera-change', alMover);
    return () => {
      el.removeEventListener('progress', alProgreso);
      el.removeEventListener('load', alCargar);
      el.removeEventListener('camera-change', alMover);
    };
  }, [listo, src]);

  // Cambia el color sin recargar el modelo; guarda el original para volver a él.
  useEffect(() => {
    if (!cargado) return;
    const pbr = materialTenible(visor.current)?.pbrMetallicRoughness;
    if (!pbr) return;
    original.current ??= [...pbr.baseColorFactor];
    pbr.setBaseColorFactor(color ? hexALineal(color) : original.current);
  }, [cargado, color]);

  useImperativeHandle(ref, () => ({
    verEnAR() {
      const el = visor.current;
      if (el?.canActivateAR) {
        el.activateAR();
        return true;
      }
      return false;
    },
  }));

  return (
    <div className={`relative isolate overflow-hidden ${className}`} style={{ backgroundColor: tinte }}>
      {listo && src && (
        <model-viewer
          ref={visor}
          src={src}
          poster={urlArchivo(mueble.imagenUrl) ?? undefined}
          alt={`Modelo 3D de ${mueble.nombre}`}
          camera-controls=""
          touch-action="pan-y"
          auto-rotate=""
          auto-rotate-delay="2500"
          rotation-per-second="18deg"
          interaction-prompt="none"
          shadow-intensity="1"
          shadow-softness="0.9"
          exposure="1.05"
          environment-image="neutral"
          camera-orbit="30deg 72deg auto"
          ar=""
          ar-modes="webxr scene-viewer quick-look"
          ar-scale="fixed"
          ar-placement="floor"
        >
          <span slot="progress-bar" />
          <span slot="ar-button" hidden />
        </model-viewer>
      )}

      {/* Barra de carga propia, más fina que la de model-viewer. */}
      <AnimatePresence>
        {!cargado && (
          <motion.div exit={{ opacity: 0 }} className="absolute inset-x-[22%] bottom-[10%] h-1 overflow-hidden rounded-full bg-tinta/10">
            <div className="h-full rounded-full bg-terracota transition-[width] duration-200" style={{ width: `${Math.max(6, progreso * 100)}%` }} />
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>{mostrarMedidas && cargado && <Cotas mueble={mueble} />}</AnimatePresence>

      <AnimatePresence>
        {cargado && !interactuo && !mostrarMedidas && (
          <motion.span
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            className="pointer-events-none absolute bottom-[11%] left-1/2 md:bottom-[6%] inline-flex -translate-x-1/2 items-center gap-1.5 rounded-full bg-white/85 px-3 py-1.5 text-[12px] font-semibold text-tinta backdrop-blur"
          >
            <Move3d className="size-3.5" aria-hidden /> Arrastra para girar 360°
          </motion.span>
        )}
      </AnimatePresence>
    </div>
  );
}
