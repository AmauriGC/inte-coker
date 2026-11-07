import { X } from 'lucide-react';
import { AnimatePresence, motion } from 'motion/react';
import { useEffect } from 'react';
import { createPortal } from 'react-dom';

/**
 * Panel modal: hoja desde abajo en móvil y cajón lateral en escritorio.
 * Escape o tocar el fondo lo cierran. Se dibuja en <body> para que ninguna capa de la página
 * (barra de acciones, columna con z-index, barra inferior) la tape.
 */
export default function Hoja({ abierta, alCerrar, titulo, children, pie }) {
  useEffect(() => {
    if (!abierta) return undefined;
    const alTeclear = (e) => e.key === 'Escape' && alCerrar();
    document.addEventListener('keydown', alTeclear);
    const overflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.removeEventListener('keydown', alTeclear);
      document.body.style.overflow = overflow;
    };
  }, [abierta, alCerrar]);

  return createPortal(
    <AnimatePresence>
      {abierta && (
        <div className="fixed inset-0 z-50" role="dialog" aria-modal="true" aria-label={titulo}>
          <motion.div className="absolute inset-0 bg-tinta/50 backdrop-blur-[2px]" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={alCerrar} />
          <motion.div
            initial={{ y: '100%' }}
            animate={{ y: 0 }}
            exit={{ y: '100%' }}
            transition={{ type: 'spring', stiffness: 380, damping: 40 }}
            className="absolute inset-x-0 bottom-0 flex max-h-[92dvh] flex-col rounded-t-[30px] bg-white lg:inset-y-0 lg:left-auto lg:right-0 lg:max-h-none lg:w-[520px] lg:rounded-l-[30px] lg:rounded-tr-none"
          >
            <div className="flex items-center gap-3 border-b border-linea px-5 py-4">
              <h2 className="flex-1 font-display text-lg font-semibold">{titulo}</h2>
              <button type="button" onClick={alCerrar} className="grid size-9 place-items-center rounded-full hover:bg-crema" aria-label="Cerrar">
                <X className="size-[18px]" />
              </button>
            </div>
            <div className="flex-1 overflow-y-auto px-5 py-5">{children}</div>
            {pie && <div className="pb-segura border-t border-linea px-5 pt-3">{pie}</div>}
          </motion.div>
        </div>
      )}
    </AnimatePresence>,
    document.body,
  );
}
