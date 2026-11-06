import { motion } from 'motion/react';

/** Switch accesible (role="switch") con animación del círculo. */
export default function Interruptor({ activo, alCambiar, etiqueta, deshabilitado = false }) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={activo}
      aria-label={etiqueta}
      disabled={deshabilitado}
      onClick={() => alCambiar(!activo)}
      className={`relative inline-flex h-6 w-11 shrink-0 items-center rounded-full p-0.5 transition-colors disabled:opacity-40 ${
        activo ? 'justify-end bg-salvia' : 'justify-start bg-borde'
      }`}
    >
      <motion.span layout transition={{ type: 'spring', stiffness: 600, damping: 34 }} className="size-5 rounded-full bg-white shadow" />
    </button>
  );
}
