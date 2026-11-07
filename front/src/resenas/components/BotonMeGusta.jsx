import { ThumbsUp } from 'lucide-react';
import { motion } from 'motion/react';
import { useState } from 'react';
import { useLocation, useNavigate } from 'react-router';
import { useSesion } from '../../auth/context/SesionContext';
import { useNotificaciones } from '../../notificaciones/context/NotificacionesContext';
import { resenasApi } from '../api/resenasApi';

/**
 * "Me gusta" público (cuenta para el ranking). No es favoritos: el corazón guarda en tu
 * lista; el pulgar dice que te gusta. Sin sesión lleva a entrar y regresa aquí.
 */
export default function BotonMeGusta({ muebleId, meGusta = false, total = 0, alCambiar }) {
  const { usuario } = useSesion();
  const { notificar } = useNotificaciones();
  const navegar = useNavigate();
  const { pathname } = useLocation();
  const [enviando, setEnviando] = useState(false);

  async function alternar() {
    if (!usuario) {
      navegar('/entrar', { state: { desde: pathname } });
      return;
    }
    if (enviando) return;
    const siguiente = !meGusta;
    alCambiar?.({ meGusta: siguiente, total: total + (siguiente ? 1 : -1) });
    setEnviando(true);
    try {
      alCambiar?.(await resenasApi.meGusta(muebleId, siguiente));
    } catch (e) {
      alCambiar?.({ meGusta, total });
      notificar({ tipo: 'error', titulo: 'No se guardó tu me gusta', texto: e.message, guardar: false });
    } finally {
      setEnviando(false);
    }
  }

  return (
    <motion.button
      type="button"
      whileTap={{ scale: 0.9 }}
      onClick={alternar}
      aria-pressed={meGusta}
      aria-label={meGusta ? `Ya no me gusta (${total})` : `Me gusta (${total})`}
      className={`inline-flex h-9 items-center gap-1.5 rounded-full border px-3 text-[13px] font-semibold transition-colors ${
        meGusta ? 'border-terracota bg-terracota-suave text-terracota-osc' : 'border-borde bg-white text-tinta hover:bg-crema'
      }`}
    >
      <motion.span key={String(meGusta)} initial={{ scale: meGusta ? 0.5 : 1, rotate: meGusta ? -20 : 0 }} animate={{ scale: 1, rotate: 0 }} transition={{ type: 'spring', stiffness: 600, damping: 14 }}>
        <ThumbsUp className="size-4" fill={meGusta ? 'currentColor' : 'none'} aria-hidden />
      </motion.span>
      {total}
    </motion.button>
  );
}
