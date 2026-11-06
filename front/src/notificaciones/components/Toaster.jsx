import { X } from 'lucide-react';
import { AnimatePresence, motion } from 'motion/react';
import { tipoAviso } from '../tipos';

/** Pila de toasts oscuros arriba de la pantalla (como el tablero "Avisos y toasts"). */
export default function Toaster({ toasts, alCerrar }) {
  return (
    <div
      aria-live="polite"
      className="pointer-events-none fixed inset-x-0 top-0 z-[60] flex flex-col items-center gap-2 px-4 pt-[calc(env(safe-area-inset-top)+12px)]"
    >
      <AnimatePresence initial={false}>
        {toasts.map((t) => {
          const { Icono, color, fondo } = tipoAviso(t.tipo);
          return (
            <motion.div
              key={t.id}
              layout
              initial={{ opacity: 0, y: -24, scale: 0.94 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -16, scale: 0.96, transition: { duration: 0.18 } }}
              transition={{ type: 'spring', stiffness: 520, damping: 34 }}
              drag="y"
              dragConstraints={{ top: 0, bottom: 0 }}
              onDragEnd={(_, info) => info.offset.y < -30 && alCerrar(t.id)}
              className="pointer-events-auto flex w-full max-w-sm items-center gap-3 rounded-[20px] bg-tinta py-2.5 pl-2.5 pr-2 text-crema shadow-[0_18px_40px_-18px_rgba(0,0,0,0.6)]"
              role="status"
            >
              <span className="grid size-9 shrink-0 place-items-center rounded-[13px]" style={{ background: fondo, color }}>
                <Icono className="size-[18px]" strokeWidth={2.2} aria-hidden />
              </span>
              <div className="min-w-0 flex-1">
                <p className="truncate text-[14px] font-semibold">{t.titulo}</p>
                {t.texto && <p className="truncate text-[12.5px] text-crema/65">{t.texto}</p>}
              </div>
              {t.accion && (
                <button
                  type="button"
                  onClick={() => {
                    t.accion.alHacer();
                    alCerrar(t.id);
                  }}
                  className="shrink-0 rounded-full px-3 py-1.5 text-[13px] font-semibold text-[#F0B79C] hover:bg-white/10"
                >
                  {t.accion.texto}
                </button>
              )}
              <button
                type="button"
                onClick={() => alCerrar(t.id)}
                className="grid size-8 shrink-0 place-items-center rounded-full text-crema/60 hover:bg-white/10"
                aria-label="Cerrar aviso"
              >
                <X className="size-4" />
              </button>
            </motion.div>
          );
        })}
      </AnimatePresence>
    </div>
  );
}
