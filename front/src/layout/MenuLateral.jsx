import { LogOut, X } from 'lucide-react';
import { motion } from 'motion/react';
import { NavLink, useNavigate } from 'react-router';
import SelectorRol from '../auth/components/SelectorRol';
import { useSesion } from '../auth/context/SesionContext';
import { datosRol } from '../auth/roles';
import { confirmar } from '../common/alertas/alertas';
import Logo from '../common/components/Logo';
import { AVISOS, CUENTA, TIENDA, useNavegacion } from './useNavegacion';

const enlace = ({ isActive }) =>
  `relative flex items-center gap-3 rounded-2xl px-3.5 py-2.5 text-[14px] font-medium transition-colors ${
    isActive ? 'text-tinta' : 'text-crema/70 hover:bg-white/5 hover:text-crema'
  }`;

function Grupo({ titulo, enlaces, cuentas, pildora, alNavegar }) {
  return (
    <section aria-label={titulo}>
      <h2 className="px-3.5 pb-1.5 text-[11px] font-semibold uppercase tracking-wider text-crema/40">{titulo}</h2>
      <ul className="grid gap-0.5">
        {enlaces.map(({ a, texto, Icono, fin, cuenta, contador }) => {
          const clave = cuenta ?? (contador ? 'ventas' : '');
          const n = cuentas[clave] ?? 0;
          return (
            <li key={`${a}-${texto}`}>
              <NavLink to={a} end={fin} className={enlace} onClick={alNavegar}>
                {({ isActive }) => (
                  <>
                    {isActive && <motion.span layoutId={pildora} className="absolute inset-0 rounded-2xl bg-crema" transition={{ type: 'spring', stiffness: 500, damping: 40 }} />}
                    <Icono className="relative size-[18px] shrink-0" aria-hidden />
                    <span className="relative truncate">{texto}</span>
                    {n > 0 && (
                      <span className="relative ml-auto grid h-5 min-w-5 place-items-center rounded-full bg-terracota px-1.5 text-[11px] font-bold text-white">
                        {n > 9 ? '9+' : n}
                        <span className="sr-only">{clave === 'avisos' ? ' sin leer' : ' por atender'}</span>
                      </span>
                    )}
                  </>
                )}
              </NavLink>
            </li>
          );
        })}
      </ul>
    </section>
  );
}

/**
 * Menú lateral oscuro de quien tiene panel (vendedor, administrador): las secciones de su rol
 * activo, la tienda y su cuenta. Es la sidebar fija en escritorio y el cajón del botón "Menú"
 * en móvil (con `alCerrar`). `pildora` separa la animación de cada instancia.
 */
export default function MenuLateral({ pildora = 'pildora-lateral', alCerrar }) {
  const { usuario, salir, roles, multiRol, rolActivo, cambiarRol } = useSesion();
  const { secciones, etiqueta, cuentas } = useNavegacion();
  const navegar = useNavigate();

  async function cerrarSesion() {
    if (await confirmar({ titulo: '¿Cerrar sesión?', texto: 'Tendrás que volver a entrar para gestionar la tienda.', boton: 'Cerrar sesión' })) {
      alCerrar?.();
      salir();
      navegar('/');
    }
  }

  return (
    <div className="flex h-full flex-col bg-tinta text-crema">
      <div className="flex items-center gap-3 px-5 pb-5 pt-[calc(env(safe-area-inset-top)+20px)] lg:pt-6">
        <span className="grid size-9 shrink-0 place-items-center rounded-xl bg-crema text-tinta">
          <Logo className="size-5" />
        </span>
        <div className="min-w-0 flex-1">
          <p className="font-display text-[17px] font-bold leading-tight">GC-Confort</p>
          {multiRol ? (
            <SelectorRol
              variante="menu"
              roles={roles}
              activo={rolActivo}
              alElegir={(rol) => {
                cambiarRol(rol);
                alCerrar?.();
                navegar(datosRol(rol).inicio);
              }}
            />
          ) : (
            <p className="text-[12px] text-crema/55">{etiqueta}</p>
          )}
        </div>
        {alCerrar && (
          <button type="button" onClick={alCerrar} className="grid size-10 shrink-0 place-items-center rounded-full text-crema/70 hover:bg-white/10" aria-label="Cerrar menú">
            <X className="size-5" />
          </button>
        )}
      </div>

      <nav aria-label="Menú" className="grid flex-1 content-start gap-5 overflow-y-auto px-3 pb-4">
        <Grupo titulo={etiqueta} enlaces={secciones} cuentas={cuentas} pildora={pildora} alNavegar={alCerrar} />
        <Grupo titulo="Tienda" enlaces={TIENDA} cuentas={cuentas} pildora={pildora} alNavegar={alCerrar} />
        <Grupo titulo="Tú" enlaces={[AVISOS, CUENTA]} cuentas={cuentas} pildora={pildora} alNavegar={alCerrar} />
      </nav>

      <div className="pb-segura px-3">
        <div className="mb-3 flex items-center gap-3 rounded-2xl bg-white/5 p-3">
          {usuario?.fotoUrl ? (
            <img src={usuario.fotoUrl} alt="" className="size-9 shrink-0 rounded-full object-cover" />
          ) : (
            <span className="grid size-9 shrink-0 place-items-center rounded-full bg-terracota font-display text-sm font-bold">{usuario?.nombre?.[0]?.toUpperCase()}</span>
          )}
          <div className="min-w-0 flex-1">
            <p className="truncate text-[13.5px] font-semibold">{usuario?.nombre}</p>
            <p className="truncate text-[12px] text-crema/55">{usuario?.email}</p>
          </div>
          <button type="button" onClick={cerrarSesion} className="grid size-9 shrink-0 place-items-center rounded-full text-crema/70 hover:bg-white/10" aria-label="Cerrar sesión">
            <LogOut className="size-4" />
          </button>
        </div>
      </div>
    </div>
  );
}
