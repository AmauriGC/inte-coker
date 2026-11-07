import { Bell, Heart, House, LayoutGrid, Truck, User } from 'lucide-react';
import { AnimatePresence, motion } from 'motion/react';
import { NavLink } from 'react-router';
import { useSesion } from '../auth/context/SesionContext';
import { useNotificaciones } from '../notificaciones/context/NotificacionesContext';
import { usePedidos } from '../pedidos/context/PedidosContext';

const ENLACES = [
  { a: '/', texto: 'Inicio', Icono: House, fin: true },
  { a: '/catalogo', texto: 'Catálogo', Icono: LayoutGrid },
  { a: '/favoritos', texto: 'Favoritos', Icono: Heart },
  { a: '/avisos', texto: 'Avisos', Icono: Bell, cuenta: 'avisos' },
  { a: '/cuenta', texto: 'Cuenta', Icono: User, cuenta: 'pedidos' },
];

/** Con el rol Transportista activo: solo sus entregas, avisos y cuenta. */
const ENLACES_TRANSPORTISTA = [
  { a: '/entregas', texto: 'Entregas', Icono: Truck },
  { a: '/avisos', texto: 'Avisos', Icono: Bell, cuenta: 'avisos' },
  { a: '/cuenta', texto: 'Cuenta', Icono: User },
];

/** Barra inferior flotante; la píldora negra se desliza al cambiar de pestaña (layoutId). */
export default function BottomBar() {
  const { tienePermiso } = useSesion();
  const enlaces = tienePermiso('ENTREGA_REALIZAR') && !tienePermiso('PEDIDO_CREAR') ? ENLACES_TRANSPORTISTA : ENLACES;
  const { sinLeer } = useNotificaciones();
  const { resumen } = usePedidos();
  // Cuenta lleva el punto de "Mis pedidos" (mensajes nuevos de vendedores).
  const cuentas = { avisos: sinLeer, pedidos: resumen.comprasSinLeer };

  return (
    <nav
      aria-label="Navegación principal"
      className="pb-segura fixed inset-x-0 bottom-0 z-40 px-3 pt-2 md:bottom-4"
    >
      <ul className="mx-auto flex max-w-md items-stretch justify-between rounded-[26px] border border-black/5 bg-white/90 p-1.5 shadow-[0_18px_40px_-20px_rgba(29,27,24,0.45)] backdrop-blur-xl">
        {enlaces.map(({ a, texto, Icono, fin, cuenta }) => (
          <li key={a} className="flex-1">
            <NavLink to={a} end={fin} className="relative flex h-14 flex-col items-center justify-center gap-0.5 rounded-[20px]">
              {({ isActive }) => (
                <>
                  {isActive && (
                    <motion.span
                      layoutId="pildora-bottombar"
                      className="absolute inset-0 rounded-[20px] bg-tinta"
                      transition={{ type: 'spring', stiffness: 520, damping: 38 }}
                    />
                  )}
                  <span className="relative">
                    <motion.span
                      animate={{ y: isActive ? -1 : 0, scale: isActive ? 1.06 : 1 }}
                      className={`block ${isActive ? 'text-crema' : 'text-gris'}`}
                    >
                      <Icono className="size-[21px]" strokeWidth={isActive ? 2.3 : 1.9} aria-hidden />
                    </motion.span>
                    <AnimatePresence>
                      {cuenta && cuentas[cuenta] > 0 && (
                        <motion.span
                          key={cuentas[cuenta]}
                          initial={{ scale: 0 }}
                          animate={{ scale: 1 }}
                          exit={{ scale: 0 }}
                          transition={{ type: 'spring', stiffness: 700, damping: 22 }}
                          className="absolute -right-2.5 -top-1.5 grid h-[17px] min-w-[17px] place-items-center rounded-full bg-terracota px-1 text-[10px] font-bold text-white ring-2 ring-white"
                        >
                          {cuentas[cuenta] > 9 ? '9+' : cuentas[cuenta]}
                        </motion.span>
                      )}
                    </AnimatePresence>
                  </span>
                  <span className={`relative text-[11px] font-semibold ${isActive ? 'text-crema' : 'text-gris'}`}>{texto}</span>
                </>
              )}
            </NavLink>
          </li>
        ))}
      </ul>
    </nav>
  );
}
