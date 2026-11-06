import { BadgeCheck, ChevronRight, Heart, LogIn, LogOut, Package, Shield, Tags, Users } from 'lucide-react';
import { motion } from 'motion/react';
import { Link, useNavigate } from 'react-router';
import { confirmar } from '../../common/alertas/alertas';
import Boton from '../../common/components/Boton';
import EstadoVacio from '../../common/components/EstadoVacio';
import Pagina from '../../common/components/Pagina';
import { useFavoritos } from '../../favoritos/context/FavoritosContext';
import Encabezado from '../../layout/Encabezado';
import { useSesion } from '../context/SesionContext';

const NOMBRE_ROL = { ADMIN: 'Administrador', VENDEDOR: 'Vendedor', CLIENTE: 'Cliente' };

const ACCESOS = [
  { a: '/panel/muebles', texto: 'Mis muebles', detalle: 'Crea, sube modelos y publica', Icono: Package, permiso: 'MUEBLE_CREAR' },
  { a: '/panel/categorias', texto: 'Categorías', detalle: 'Organiza el catálogo', Icono: Tags, permiso: 'CATEGORIA_GESTIONAR' },
  { a: '/panel/usuarios', texto: 'Usuarios', detalle: 'Roles y cuentas activas', Icono: Users, permiso: 'USUARIO_GESTIONAR' },
  { a: '/panel/roles', texto: 'Roles y permisos', detalle: 'Qué puede hacer cada rol', Icono: Shield, permiso: 'ROL_GESTIONAR' },
];

function Fila({ a, Icono, texto, detalle, i }) {
  return (
    <motion.li initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0, transition: { delay: 0.05 * i } }}>
      <Link to={a} className="flex items-center gap-3.5 rounded-2xl px-3 py-3 transition-colors hover:bg-crema">
        <span className="grid size-10 place-items-center rounded-xl bg-crema text-tinta">
          <Icono className="size-[19px]" aria-hidden />
        </span>
        <span className="min-w-0 flex-1">
          <span className="block text-[15px] font-semibold">{texto}</span>
          <span className="block truncate text-[12.5px] text-gris">{detalle}</span>
        </span>
        <ChevronRight className="size-[18px] text-gris-2" aria-hidden />
      </Link>
    </motion.li>
  );
}

export default function CuentaPage() {
  const { usuario, tienePermiso, salir } = useSesion();
  const { favoritos } = useFavoritos();
  const navegar = useNavigate();

  if (!usuario) {
    return (
      <Pagina className="mx-auto max-w-md px-4">
        <Encabezado titulo="Cuenta" />
        <EstadoVacio icono={LogIn} titulo="Entra a tu cuenta" texto="Así guardas favoritos y, si vendes, publicas tus muebles en 3D.">
          <Boton a="/entrar" icono={LogIn}>
            Entrar o crear cuenta
          </Boton>
        </EstadoVacio>
      </Pagina>
    );
  }

  const accesos = ACCESOS.filter((x) => tienePermiso(x.permiso));

  async function cerrarSesion() {
    if (await confirmar({ titulo: '¿Cerrar sesión?', texto: 'Tus favoritos se quedan guardados en este dispositivo.', boton: 'Cerrar sesión' })) {
      salir();
      navegar('/');
    }
  }

  return (
    <Pagina className="mx-auto max-w-md px-4">
      <Encabezado titulo="Cuenta" />

      <motion.section initial={{ opacity: 0, scale: 0.97 }} animate={{ opacity: 1, scale: 1 }} className="relative overflow-hidden rounded-[28px] bg-tinta p-5 text-crema">
        <div aria-hidden className="absolute -right-14 -top-16 size-48 rounded-full bg-[radial-gradient(circle,rgba(168,70,31,0.5),transparent_70%)]" />
        <div className="relative flex items-center gap-4">
          <span className="grid size-14 place-items-center rounded-2xl bg-terracota font-display text-2xl font-bold">{usuario.nombre?.[0]?.toUpperCase()}</span>
          <div className="min-w-0">
            <p className="truncate font-display text-lg font-semibold">{usuario.nombre}</p>
            <p className="truncate text-[13px] text-crema/60">{usuario.email}</p>
          </div>
        </div>
        <div className="relative mt-4 flex flex-wrap gap-2">
          {usuario.roles?.map((r) => (
            <span key={r} className="rounded-full bg-white/10 px-3 py-1 text-[12px] font-semibold">
              {NOMBRE_ROL[r] ?? r}
            </span>
          ))}
          {usuario.verificado && (
            <span className="inline-flex items-center gap-1 rounded-full bg-salvia px-3 py-1 text-[12px] font-semibold">
              <BadgeCheck className="size-3.5" /> Verificado
            </span>
          )}
        </div>
      </motion.section>

      <ul className="mt-4 rounded-[24px] border border-linea bg-white p-1.5">
        <Fila a="/favoritos" Icono={Heart} texto="Favoritos" detalle={`${favoritos.length} guardados en este dispositivo`} i={0} />
        {accesos.map((x, i) => (
          <Fila key={x.a} {...x} i={i + 1} />
        ))}
      </ul>

      <Boton variante="secundario" bloque icono={LogOut} onClick={cerrarSesion} className="mt-4">
        Cerrar sesión
      </Boton>
    </Pagina>
  );
}
