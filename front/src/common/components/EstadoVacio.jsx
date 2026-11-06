import { motion } from 'motion/react';

/** Mensaje centrado cuando no hay resultados, con icono y una acción opcional. */
export default function EstadoVacio({ icono: Icono, titulo, texto, children, className = '' }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      className={`flex flex-col items-center px-6 py-12 text-center ${className}`}
    >
      {Icono && (
        <div className="mb-4 grid size-16 place-items-center rounded-3xl bg-crema-2 text-gris">
          <Icono className="size-7" strokeWidth={1.8} aria-hidden />
        </div>
      )}
      <h3 className="font-display text-lg font-semibold">{titulo}</h3>
      {texto && <p className="mt-1.5 max-w-72 text-[14px] leading-relaxed text-gris">{texto}</p>}
      {children && <div className="mt-5">{children}</div>}
    </motion.div>
  );
}
