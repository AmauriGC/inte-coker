import { Check, ChevronDown } from 'lucide-react';
import { AnimatePresence, motion } from 'motion/react';
import { useEffect, useRef, useState } from 'react';
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

/** Píldoras sobre fondo oscuro (tarjeta de Cuenta): columnas iguales que llenan el ancho. */
function Pildoras({ roles, activo, alElegir }) {
  return (
    <div
      className="grid gap-1 rounded-full bg-white/10 p-1"
      style={{ gridTemplateColumns: `repeat(${roles.length}, minmax(0, 1fr))` }}
      role="radiogroup"
      aria-label="Rol activo"
    >
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
            className={`relative flex min-w-0 items-center justify-center gap-1.5 rounded-full px-2 py-2 text-[12.5px] font-semibold transition-colors ${
              elegido ? 'text-tinta' : 'text-crema/70 hover:text-crema'
            }`}
          >
            {elegido && <motion.span layoutId="pildora-rol" className="absolute inset-0 rounded-full bg-crema" transition={{ type: 'spring', stiffness: 500, damping: 40 }} />}
            <Icono className="relative size-3.5 shrink-0" aria-hidden />
            <span className="relative truncate">{nombre}</span>
          </button>
        );
      })}
    </div>
  );
}

/** Menú desplegable compacto (sidebar del panel): botón con el rol activo y lista propia. */
function Menu({ roles, activo, alElegir }) {
  const [abierto, setAbierto] = useState(false);
  const caja = useRef(null);
  const actual = datosRol(activo);

  useEffect(() => {
    if (!abierto) return undefined;
    const fuera = (e) => !caja.current?.contains(e.target) && setAbierto(false);
    const tecla = (e) => e.key === 'Escape' && setAbierto(false);
    document.addEventListener('pointerdown', fuera);
    document.addEventListener('keydown', tecla);
    return () => {
      document.removeEventListener('pointerdown', fuera);
      document.removeEventListener('keydown', tecla);
    };
  }, [abierto]);

  return (
    <div ref={caja} className="relative">
      <button
        type="button"
        onClick={() => setAbierto((v) => !v)}
        aria-haspopup="listbox"
        aria-expanded={abierto}
        aria-label={`Rol activo: ${actual.nombre}. Cambiar rol`}
        className="mt-0.5 inline-flex items-center gap-1.5 rounded-full bg-white/10 py-1 pl-2.5 pr-2 text-[12px] font-semibold text-crema transition-colors hover:bg-white/15"
      >
        <actual.Icono className="size-3.5" aria-hidden />
        Como {actual.nombre.toLowerCase()}
        <ChevronDown className={`size-3.5 transition-transform ${abierto ? 'rotate-180' : ''}`} aria-hidden />
      </button>
      <AnimatePresence>
        {abierto && (
          <motion.ul
            role="listbox"
            aria-label="Cambiar rol"
            initial={{ opacity: 0, y: -6, scale: 0.97 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -6, scale: 0.97 }}
            transition={{ duration: 0.15 }}
            className="absolute left-0 top-full z-50 mt-2 w-64 origin-top-left rounded-[20px] bg-white p-1.5 text-tinta shadow-[0_18px_40px_-16px_rgba(29,27,24,0.5)] ring-1 ring-black/5"
          >
            {roles.map((rol) => {
              const { nombre, detalle, Icono } = datosRol(rol);
              const elegido = rol === activo;
              return (
                <li key={rol} role="option" aria-selected={elegido}>
                  <button
                    type="button"
                    onClick={() => {
                      setAbierto(false);
                      if (!elegido) alElegir(rol);
                    }}
                    className={`flex w-full items-center gap-3 rounded-2xl px-2.5 py-2.5 text-left transition-colors ${elegido ? 'bg-crema' : 'hover:bg-crema'}`}
                  >
                    <span className={`grid size-9 shrink-0 place-items-center rounded-xl ${elegido ? 'bg-tinta text-crema' : 'bg-crema text-tinta'}`}>
                      <Icono className="size-[17px]" aria-hidden />
                    </span>
                    <span className="min-w-0 flex-1">
                      <span className="block text-[14px] font-semibold">{nombre}</span>
                      <span className="block truncate text-[12px] text-gris">{detalle}</span>
                    </span>
                    {elegido && <Check className="size-4 shrink-0 text-salvia" aria-hidden />}
                  </button>
                </li>
              );
            })}
          </motion.ul>
        )}
      </AnimatePresence>
    </div>
  );
}

const VARIANTES = { tarjetas: Tarjetas, pildoras: Pildoras, menu: Menu };

/** Selector del rol activo para cuentas con más de un rol. variante: 'tarjetas' | 'pildoras' | 'menu'. */
export default function SelectorRol({ variante = 'tarjetas', ...props }) {
  const Variante = VARIANTES[variante] ?? Tarjetas;
  return <Variante {...props} />;
}
