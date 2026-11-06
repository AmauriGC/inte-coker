import { Check } from 'lucide-react';
import { motion } from 'motion/react';
import { datosRol } from '../roles';

/** Tarjetas grandes: se usan al entrar con una cuenta de varios roles. */
function Tarjetas({ roles, activo, alElegir }) {
  return (
    <ul className="grid gap-2.5" role="radiogroup" aria-label="Rol con el que entras">
      {roles.map((rol, i) => {
        const { nombre, detalle, Icono } = datosRol(rol);
        const elegido = rol === activo;
        return (
          <motion.li key={rol} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0, transition: { delay: 0.05 * i } }}>
            <button
              type="button"
              role="radio"
              aria-checked={elegido}
              onClick={() => alElegir(rol)}
              className={`flex w-full items-center gap-3.5 rounded-[22px] border px-4 py-3.5 text-left transition-colors ${
                elegido ? 'border-tinta bg-crema' : 'border-linea bg-white hover:bg-crema'
              }`}
            >
              <span className={`grid size-11 shrink-0 place-items-center rounded-2xl ${elegido ? 'bg-tinta text-crema' : 'bg-crema text-tinta'}`}>
                <Icono className="size-5" aria-hidden />
              </span>
              <span className="min-w-0 flex-1">
                <span className="block font-display text-[16px] font-semibold">{nombre}</span>
                <span className="block text-[13px] leading-snug text-gris">{detalle}</span>
              </span>
              {elegido && <Check className="size-5 text-salvia" aria-hidden />}
            </button>
          </motion.li>
        );
      })}
    </ul>
  );
}

/** Píldoras sobre fondo oscuro: la tarjeta de Cuenta. */
function Pildoras({ roles, activo, alElegir }) {
  return (
    <div className="flex flex-wrap gap-1 rounded-full bg-white/10 p-1" role="radiogroup" aria-label="Rol activo">
      {roles.map((rol) => {
        const { nombre, Icono } = datosRol(rol);
        const elegido = rol === activo;
        return (
          <button
            key={rol}
            type="button"
            role="radio"
            aria-checked={elegido}
            onClick={() => !elegido && alElegir(rol)}
            className={`relative inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-[12.5px] font-semibold transition-colors ${
              elegido ? 'text-tinta' : 'text-crema/70 hover:text-crema'
            }`}
          >
            {elegido && <motion.span layoutId="pildora-rol" className="absolute inset-0 rounded-full bg-crema" transition={{ type: 'spring', stiffness: 500, damping: 40 }} />}
            <Icono className="relative size-3.5" aria-hidden />
            <span className="relative">{nombre}</span>
          </button>
        );
      })}
    </div>
  );
}

/** Selector del rol activo para cuentas con más de un rol. variante: 'tarjetas' | 'pildoras'. */
export default function SelectorRol({ variante = 'tarjetas', ...props }) {
  return variante === 'pildoras' ? <Pildoras {...props} /> : <Tarjetas {...props} />;
}
