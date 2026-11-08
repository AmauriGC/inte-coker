import { AnimatePresence, motion } from 'motion/react';
import { useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import MenuLateral from './MenuLateral';

/**
 * El menú lateral como cajón desde la izquierda (móvil). Escape, tocar el fondo o elegir una
 * opción lo cierran; al cerrar, el foco vuelve al botón que lo abrió.
 */
export default function CajonMenu({ abierto, alCerrar }) {
  const panel = useRef(null);

  useEffect(() => {
    if (!abierto) return undefined;
    const previo = document.activeElement;
    panel.current?.focus();
    const alTeclear = (e) => e.key === 'Escape' && alCerrar();
    document.addEventListener('keydown', alTeclear);
    const overflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.removeEventListener('keydown', alTeclear);
      document.body.style.overflow = overflow;
      previo?.focus?.();
    };
  }, [abierto, alCerrar]);

  return createPortal(
    <AnimatePresence>
      {abierto && (
        <div className="fixed inset-0 z-50 lg:hidden" role="dialog" aria-modal="true" aria-label="Menú">
          <motion.div className="absolute inset-0 bg-tinta/50 backdrop-blur-[2px]" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={alCerrar} />
          <motion.div
            ref={panel}
            tabIndex={-1}
            initial={{ x: '-100%' }}
            animate={{ x: 0 }}
            exit={{ x: '-100%' }}
            transition={{ type: 'spring', stiffness: 400, damping: 42 }}
            drag="x"
            dragConstraints={{ left: 0, right: 0 }}
            dragElastic={{ left: 0.5, right: 0 }}
            onDragEnd={(_, info) => (info.offset.x < -80 || info.velocity.x < -500) && alCerrar()}
            className="absolute inset-y-0 left-0 w-[min(86vw,320px)] overflow-hidden rounded-r-[28px] shadow-[24px_0_60px_-30px_rgba(0,0,0,0.6)] outline-none"
          >
            <MenuLateral pildora="pildora-cajon" alCerrar={alCerrar} />
          </motion.div>
        </div>
      )}
    </AnimatePresence>,
    document.body,
  );
}
