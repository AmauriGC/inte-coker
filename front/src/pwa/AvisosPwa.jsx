import { Download, WifiOff, X } from 'lucide-react';
import { AnimatePresence, motion } from 'motion/react';
import { useEffect, useState } from 'react';
import Boton from '../common/components/Boton';
import { useNotificaciones } from '../notificaciones/context/NotificacionesContext';
import { aplicarActualizacion, instalar } from './estadoPwa';
import { usePwa } from './usePwa';

const CLAVE_DESCARTE = 'gc.instalar.descartado';
const DIAS_SIN_INSISTIR = 7;
const ESPERA_HOJA_MS = 12000;

function descartadaHacePoco() {
  try {
    const fecha = Number(localStorage.getItem(CLAVE_DESCARTE));
    return fecha && Date.now() - fecha < DIAS_SIN_INSISTIR * 24 * 60 * 60 * 1000;
  } catch {
    return false;
  }
}

/**
 * Avisos propios de la PWA: toast de versión nueva y hoja "Instala GC-Confort"
 * (tablero Alertas del diseño). La hoja aparece una vez, unos segundos después de entrar.
 */
export default function AvisosPwa() {
  const { actualizacion, instalable } = usePwa();
  const { notificar } = useNotificaciones();
  const [hojaLista, setHojaLista] = useState(false);
  const [cerrada, setCerrada] = useState(descartadaHacePoco);

  useEffect(() => {
    if (!actualizacion) return;
    notificar({
      tipo: 'version',
      titulo: 'Nueva versión lista',
      texto: 'Actualiza para ver lo último.',
      guardar: false,
      duracion: 20000,
      accion: { texto: 'Actualizar', alHacer: aplicarActualizacion },
    });
  }, [actualizacion, notificar]);

  useEffect(() => {
    if (!instalable) return undefined;
    const id = setTimeout(() => setHojaLista(true), ESPERA_HOJA_MS);
    return () => clearTimeout(id);
  }, [instalable]);

  function cerrar() {
    setCerrada(true);
    try {
      localStorage.setItem(CLAVE_DESCARTE, String(Date.now()));
    } catch {
      /* sin almacenamiento: volverá a salir en la siguiente visita */
    }
  }

  async function alInstalar() {
    setCerrada(true);
    if (await instalar()) notificar({ tipo: 'exito', titulo: 'GC-Confort instalada', texto: 'Ábrela desde tu pantalla de inicio.' });
  }

  const visible = instalable && hojaLista && !cerrada;

  return (
    <AnimatePresence>
      {visible && (
        <motion.aside
          initial={{ y: 140, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: 140, opacity: 0 }}
          transition={{ type: 'spring', stiffness: 320, damping: 32 }}
          className="fixed inset-x-3 bottom-[calc(env(safe-area-inset-bottom)+92px)] z-50 mx-auto max-w-md rounded-[26px] bg-white p-4 shadow-[0_24px_60px_-24px_rgba(29,27,24,0.55)] ring-1 ring-black/5"
          aria-label="Instalar la aplicación"
        >
          <button type="button" onClick={cerrar} className="absolute right-3 top-3 grid size-8 place-items-center rounded-full text-gris hover:bg-crema" aria-label="Cerrar">
            <X className="size-4" />
          </button>
          <div className="flex items-center gap-3.5 pr-8">
            <img src="/iconos/icono-192.png" alt="" className="size-14 rounded-[16px]" />
            <div>
              <p className="font-display text-[17px] font-semibold">Instala GC-Confort</p>
              <p className="mt-0.5 flex items-center gap-1.5 text-[13px] text-gris">
                <WifiOff className="size-3.5" /> Ábrela rápido y mira el catálogo sin conexión.
              </p>
            </div>
          </div>
          <div className="mt-4 flex gap-2">
            <Boton variante="secundario" onClick={cerrar} className="flex-1">
              Ahora no
            </Boton>
            <Boton icono={Download} onClick={alInstalar} className="flex-1">
              Instalar
            </Boton>
          </div>
        </motion.aside>
      )}
    </AnimatePresence>
  );
}
