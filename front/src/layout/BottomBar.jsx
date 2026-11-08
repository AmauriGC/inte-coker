import { Menu } from 'lucide-react';
import { AnimatePresence, motion } from 'motion/react';
import { useCallback, useState } from 'react';
import { matchPath, NavLink, useLocation } from 'react-router';
import CajonMenu from './CajonMenu';
import { useNavegacion } from './useNavegacion';

function Burbuja({ n }) {
  return (
    <AnimatePresence>
      {n > 0 && (
        <motion.span
          key={n}
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          exit={{ scale: 0 }}
          transition={{ type: 'spring', stiffness: 700, damping: 22 }}
          className="absolute -right-2.5 -top-1.5 grid h-[17px] min-w-[17px] place-items-center rounded-full bg-terracota px-1 text-[10px] font-bold text-white ring-2 ring-white"
        >
          {n > 9 ? '9+' : n}
        </motion.span>
      )}
    </AnimatePresence>
  );
}

/** Contenido de una pestaña: la píldora negra se desliza a la activa (layoutId). */
function Pestana({ activa, Icono, texto, n = 0 }) {
  return (
    <>
      {activa && <motion.span layoutId="pildora-bottombar" className="absolute inset-0 rounded-[20px] bg-tinta" transition={{ type: 'spring', stiffness: 520, damping: 38 }} />}
      <span className="relative">
        <motion.span animate={{ y: activa ? -1 : 0, scale: activa ? 1.06 : 1 }} className={`block ${activa ? 'text-crema' : 'text-gris'}`}>
          <Icono className="size-[21px]" strokeWidth={activa ? 2.3 : 1.9} aria-hidden />
        </motion.span>
        <Burbuja n={n} />
      </span>
      <span className={`relative text-[11px] font-semibold ${activa ? 'text-crema' : 'text-gris'}`}>{texto}</span>
    </>
  );
}

const CLASE = 'relative flex h-14 w-full flex-col items-center justify-center gap-0.5 rounded-[20px]';

/**
 * Barra inferior flotante, fija y de hasta 5 pestañas según el rol activo. Quien tiene panel ve
 * sus 3 secciones principales, Avisos y "Menú", que abre el menú lateral con todo lo demás;
 * "Menú" queda activo cuando la pantalla actual no es una de las pestañas.
 */
export default function BottomBar({ className = '' }) {
  const { pestanas, conMenu, cuentas } = useNavegacion();
  const { pathname } = useLocation();
  const [menu, setMenu] = useState(false);
  const cerrarMenu = useCallback(() => setMenu(false), []);
  const enPestana = pestanas.some((p) => matchPath({ path: p.a, end: Boolean(p.fin) }, pathname));
  const sinLeerEnMenu = conMenu ? cuentas.ventas > 0 && !pestanas.some((p) => p.cuenta === 'ventas') : false;

  return (
    <>
      <nav aria-label="Navegación principal" className={`pb-segura fixed inset-x-0 bottom-0 z-40 px-3 pt-2 lg:bottom-4 ${className}`}>
        <ul className="mx-auto flex max-w-md items-stretch justify-between rounded-[26px] border border-black/5 bg-white/90 p-1.5 shadow-[0_18px_40px_-20px_rgba(29,27,24,0.45)] backdrop-blur-xl">
          {pestanas.map(({ a, texto, Icono, fin, cuenta }) => (
            <li key={a} className="flex-1">
              <NavLink to={a} end={fin} className={CLASE}>
                {({ isActive }) => <Pestana activa={isActive} Icono={Icono} texto={texto} n={cuentas[cuenta] ?? 0} />}
              </NavLink>
            </li>
          ))}
          {conMenu && (
            <li className="flex-1">
              <button type="button" onClick={() => setMenu(true)} aria-haspopup="dialog" aria-expanded={menu} className={CLASE}>
                <Pestana activa={!enPestana} Icono={Menu} texto="Menú" n={sinLeerEnMenu ? cuentas.ventas : 0} />
              </button>
            </li>
          )}
        </ul>
      </nav>
      {conMenu && <CajonMenu abierto={menu} alCerrar={cerrarMenu} />}
    </>
  );
}
