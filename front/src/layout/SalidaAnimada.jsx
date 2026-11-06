import { AnimatePresence } from 'motion/react';
import { cloneElement } from 'react';
import { useLocation, useOutlet } from 'react-router';

/**
 * Outlet con transición: conserva la pantalla anterior hasta que termina su animación de salida.
 * Las pantallas usan <Pagina>, que define initial, animate y exit.
 */
export default function SalidaAnimada() {
  const ubicacion = useLocation();
  const salida = useOutlet();
  if (!salida) return null;
  return (
    <AnimatePresence mode="wait" initial={false}>
      {cloneElement(salida, { key: ubicacion.pathname })}
    </AnimatePresence>
  );
}
