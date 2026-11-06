import { ArrowLeft, ChevronDown, LogOut, Package, Shield, Tags, Users } from 'lucide-react';
import { motion } from 'motion/react';
import { Suspense } from 'react';
import { NavLink, useNavigate } from 'react-router';
import { useSesion } from '../auth/context/SesionContext';
import { datosRol } from '../auth/roles';
import { confirmar } from '../common/alertas/alertas';
import Logo from '../common/components/Logo';
import SalidaAnimada from './SalidaAnimada';

const SECCIONES = [
  { a: '/panel/muebles', texto: 'Mis muebles', Icono: Package, permisos: ['MUEBLE_CREAR'] },
  { a: '/panel/categorias', texto: 'Categorías', Icono: Tags, permisos: ['CATEGORIA_GESTIONAR'] },
  { a: '/panel/usuarios', texto: 'Usuarios', Icono: Users, permisos: ['USUARIO_GESTIONAR'] },
  { a: '/panel/roles', texto: 'Roles y permisos', Icono: Shield, permisos: ['ROL_GESTIONAR'] },
];

function Cargando() {
  return (
    <div className="grid gap-3 p-6">
      {[0, 1, 2].map((i) => (
        <div key={i} className="esqueleto h-16 rounded-2xl" />
      ))}
    </div>
  );
}

/** Panel de vendedor y administrador: sidebar oscura en escritorio, pestañas arriba en móvil. */
export default function LayoutPanel() {
  const { usuario, tienePermiso, salir, roles, multiRol, rolActivo, cambiarRol } = useSesion();
  const navegar = useNavigate();
  const secciones = SECCIONES.filter((s) => tienePermiso(...s.permisos));
  const etiquetaPanel = tienePermiso('USUARIO_GESTIONAR') ? 'Administración' : 'Panel de vendedor';

  async function cerrarSesion() {
    if (await confirmar({ titulo: '¿Cerrar sesión?', texto: 'Tendrás que volver a entrar para gestionar el catálogo.', boton: 'Cerrar sesión' })) {
      salir();
      navegar('/');
    }
  }

  const enlace = ({ isActive }) =>
    `relative flex items-center gap-3 rounded-2xl px-3.5 py-2.5 text-[14px] font-medium transition-colors ${
      isActive ? 'text-tinta' : 'text-crema/70 hover:bg-white/5 hover:text-crema'
    }`;

  return (
    <div className="min-h-dvh bg-crema lg:grid lg:grid-cols-[260px_1fr]">
      <aside className="sticky top-0 z-30 bg-tinta text-crema lg:h-dvh lg:p-5">
        <div className="flex items-center gap-3 px-4 py-3 lg:px-2 lg:pb-7 lg:pt-1">
          <span className="grid size-9 place-items-center rounded-xl bg-crema text-tinta">
            <Logo className="size-5" />
          </span>
          <div className="min-w-0 flex-1">
            <p className="font-display text-[17px] font-bold leading-tight">GC-Confort</p>
            {multiRol ? (
              <label className="relative mt-0.5 inline-flex items-center gap-1 text-[12px] text-crema/70">
                <span className="sr-only">Rol activo</span>
                <select
                  value={rolActivo}
                  onChange={(e) => {
                    cambiarRol(e.target.value);
                    navegar(datosRol(e.target.value).inicio);
                  }}
                  className="cursor-pointer appearance-none rounded-full bg-white/10 py-0.5 pl-2.5 pr-6 font-semibold text-crema outline-none focus-visible:ring-2 focus-visible:ring-crema/40"
                >
                  {roles.map((r) => (
                    <option key={r} value={r} className="text-tinta">
                      Como {datosRol(r).nombre.toLowerCase()}
                    </option>
                  ))}
                </select>
                <ChevronDown className="pointer-events-none absolute right-1.5 size-3.5" aria-hidden />
              </label>
            ) : (
              <p className="text-[12px] text-crema/55">{etiquetaPanel}</p>
            )}
          </div>
          <button type="button" onClick={cerrarSesion} className="grid size-9 place-items-center rounded-full text-crema/70 hover:bg-white/10 lg:hidden" aria-label="Cerrar sesión">
            <LogOut className="size-[18px]" />
          </button>
        </div>

        <nav aria-label="Secciones del panel" className="overflow-x-auto px-3 pb-3 lg:overflow-visible lg:p-0">
          <ul className="flex gap-1 lg:flex-col">
            {secciones.map(({ a, texto, Icono }) => (
              <li key={a} className="shrink-0">
                <NavLink to={a} className={enlace}>
                  {({ isActive }) => (
                    <>
                      {isActive && (
                        <motion.span layoutId="pildora-panel" className="absolute inset-0 rounded-2xl bg-crema" transition={{ type: 'spring', stiffness: 500, damping: 40 }} />
                      )}
                      <Icono className="relative size-[18px]" aria-hidden />
                      <span className="relative whitespace-nowrap">{texto}</span>
                    </>
                  )}
                </NavLink>
              </li>
            ))}
            <li className="shrink-0 lg:mt-4 lg:border-t lg:border-white/10 lg:pt-4">
              <NavLink to="/" className={enlace({ isActive: false })}>
                <ArrowLeft className="size-[18px]" aria-hidden />
                <span className="whitespace-nowrap">Ver catálogo público</span>
              </NavLink>
            </li>
          </ul>
        </nav>

        <div className="absolute inset-x-5 bottom-5 hidden items-center gap-3 rounded-2xl bg-white/5 p-3 lg:flex">
          <span className="grid size-9 place-items-center rounded-full bg-terracota font-display text-sm font-bold">
            {usuario?.nombre?.[0]?.toUpperCase()}
          </span>
          <div className="min-w-0 flex-1">
            <p className="truncate text-[13.5px] font-semibold">{usuario?.nombre}</p>
            <p className="truncate text-[12px] text-crema/55">{usuario?.email}</p>
          </div>
          <button type="button" onClick={cerrarSesion} className="grid size-8 place-items-center rounded-full text-crema/70 hover:bg-white/10" aria-label="Cerrar sesión">
            <LogOut className="size-4" />
          </button>
        </div>
      </aside>

      <div className="min-w-0">
        <Suspense fallback={<Cargando />}>
          <SalidaAnimada />
        </Suspense>
      </div>
    </div>
  );
}
