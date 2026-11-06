import { KeyRound, Mail, User } from 'lucide-react';
import { AnimatePresence, motion } from 'motion/react';
import { useState } from 'react';
import { Link, Navigate, useLocation, useNavigate } from 'react-router';
import { authApi } from '../api/authApi';
import Boton from '../../common/components/Boton';
import Campo from '../../common/components/Campo';
import Hoja from '../../common/components/Hoja';
import { useEnvio } from '../../common/hooks/useEnvio';
import { primerNombre } from '../../common/utils/formato';
import { useNotificaciones } from '../../notificaciones/context/NotificacionesContext';
import MarcoCuenta from '../components/MarcoCuenta';
import RevisaTuCorreo from '../components/RevisaTuCorreo';
import SelectorRol from '../components/SelectorRol';
import { useSesion } from '../context/SesionContext';
import { datosRol, ordenarRoles } from '../roles';

const PESTANAS = [
  { id: 'entrar', texto: 'Entrar' },
  { id: 'registro', texto: 'Crear cuenta' },
];

function Aviso({ children }) {
  return (
    <motion.p initial={{ opacity: 0, y: -4 }} animate={{ opacity: 1, y: 0 }} role="alert" className="rounded-2xl bg-[#F6DAD7] px-4 py-3 text-[13.5px] font-medium text-[#8C1D17]">
      {children}
    </motion.p>
  );
}

function FormEntrar({ alPendiente }) {
  const { entrar, cambiarRol } = useSesion();
  const { notificar } = useNotificaciones();
  const navegar = useNavigate();
  const { state } = useLocation();
  const [datos, setDatos] = useState({ email: '', password: '' });
  const [rolesPorElegir, setRolesPorElegir] = useState(null);
  const { enviar, enviando, error, errores } = useEnvio(entrar);

  async function alEnviar(e) {
    e.preventDefault();
    const r = await enviar(datos.email.trim(), datos.password);
    if (r.ok) {
      notificar({ tipo: 'exito', titulo: `Hola, ${primerNombre(r.datos.nombre)}`, texto: 'Entraste a tu cuenta.', guardar: false });
      const roles = ordenarRoles(r.datos.roles);
      if (roles.length > 1) {
        setRolesPorElegir(roles);
        return;
      }
      const destino = state?.desde ?? (r.datos.permisos?.includes('MUEBLE_CREAR') ? '/panel/muebles' : '/');
      navegar(destino, { replace: true });
    } else if (r.error.estado === 403 && /verifica/i.test(r.error.message)) {
      alPendiente(datos.email.trim());
    }
  }

  function elegirRol(rol) {
    cambiarRol(rol);
    setRolesPorElegir(null);
    navegar(state?.desde ?? datosRol(rol).inicio, { replace: true });
  }

  return (
    <>
    <Hoja abierta={Boolean(rolesPorElegir)} alCerrar={() => elegirRol(rolesPorElegir[0])} titulo="¿Cómo quieres entrar?">
      <p className="mb-4 text-[14px] leading-relaxed text-texto">
        Tu cuenta tiene varios roles. Elige con cuál trabajar; puedes cambiarlo cuando quieras desde Cuenta.
      </p>
      {rolesPorElegir && <SelectorRol roles={rolesPorElegir} activo={null} alElegir={elegirRol} />}
    </Hoja>
    <form onSubmit={alEnviar} className="grid gap-4" noValidate>
      {error && !Object.keys(errores).length && <Aviso>{error.message}</Aviso>}
      <Campo etiqueta="Correo" type="email" autoComplete="email" icono={Mail} placeholder="tu@correo.com" value={datos.email} error={errores.email}
        onChange={(e) => setDatos({ ...datos, email: e.target.value })} required />
      <Campo etiqueta="Contraseña" type="password" autoComplete="current-password" icono={KeyRound} placeholder="Tu contraseña" value={datos.password} error={errores.password}
        onChange={(e) => setDatos({ ...datos, password: e.target.value })} required />
      <Link to="/olvide-password" className="-mt-1 justify-self-end text-[13px] font-semibold text-terracota">
        ¿Olvidaste tu contraseña?
      </Link>
      <Boton type="submit" bloque cargando={enviando} className="h-[52px]">
        Entrar
      </Boton>
    </form>
    </>
  );
}

function FormRegistro({ alRegistrar }) {
  const [datos, setDatos] = useState({ nombre: '', email: '', password: '' });
  const { enviar, enviando, error, errores } = useEnvio(authApi.registro);

  async function alEnviar(e) {
    e.preventDefault();
    const r = await enviar({ ...datos, nombre: datos.nombre.trim(), email: datos.email.trim() });
    if (r.ok) alRegistrar(datos.email.trim());
  }

  return (
    <form onSubmit={alEnviar} className="grid gap-4" noValidate>
      {error && !Object.keys(errores).length && <Aviso>{error.message}</Aviso>}
      <Campo etiqueta="Nombre" autoComplete="name" icono={User} placeholder="Cómo te llamas" value={datos.nombre} error={errores.nombre}
        onChange={(e) => setDatos({ ...datos, nombre: e.target.value })} required />
      <Campo etiqueta="Correo" type="email" autoComplete="email" icono={Mail} placeholder="tu@correo.com" value={datos.email} error={errores.email}
        onChange={(e) => setDatos({ ...datos, email: e.target.value })} required />
      <Campo etiqueta="Contraseña" type="password" autoComplete="new-password" icono={KeyRound} placeholder="Mínimo 8 caracteres" value={datos.password}
        error={errores.password} ayuda="Al menos 8 caracteres, con una letra y un número."
        onChange={(e) => setDatos({ ...datos, password: e.target.value })} required />
      <Boton type="submit" bloque variante="acento" cargando={enviando} className="h-[52px]">
        Crear mi cuenta
      </Boton>
      <p className="text-center text-[12.5px] leading-relaxed text-gris">
        Las cuentas nuevas son de cliente. Si vendes muebles, un administrador te da el rol de vendedor.
      </p>
    </form>
  );
}

export default function LoginPage() {
  // Solo se redirige si ya había sesión al abrir; tras entrar, FormEntrar decide el destino.
  const { autenticado } = useSesion();
  const [yaTeniaSesion] = useState(autenticado);
  const [pestana, setPestana] = useState('entrar');
  const [pendiente, setPendiente] = useState(null);

  if (yaTeniaSesion) return <Navigate to="/cuenta" replace />;

  return (
    <MarcoCuenta
      titulo={pendiente ? 'Casi listo' : pestana === 'entrar' ? 'Qué gusto verte' : 'Crea tu cuenta'}
      subtitulo={pendiente ? null : 'Guarda favoritos y prueba los muebles en tu espacio.'}
    >
      {pendiente ? (
        <RevisaTuCorreo
          email={pendiente}
          alVolver={() => {
            setPendiente(null);
            setPestana('entrar');
          }}
        />
      ) : (
        <>
          <div role="tablist" className="mb-6 grid grid-cols-2 rounded-full bg-crema p-1">
            {PESTANAS.map((p) => (
              <button
                key={p.id}
                type="button"
                role="tab"
                aria-selected={pestana === p.id}
                onClick={() => setPestana(p.id)}
                className={`relative h-10 rounded-full text-[14px] font-semibold transition-colors ${pestana === p.id ? 'text-crema' : 'text-gris'}`}
              >
                {pestana === p.id && (
                  <motion.span layoutId="pestana-cuenta" className="absolute inset-0 rounded-full bg-tinta" transition={{ type: 'spring', stiffness: 500, damping: 38 }} />
                )}
                <span className="relative">{p.texto}</span>
              </button>
            ))}
          </div>
          <AnimatePresence mode="wait" initial={false}>
            <motion.div
              key={pestana}
              initial={{ opacity: 0, x: pestana === 'entrar' ? -16 : 16 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: pestana === 'entrar' ? 16 : -16 }}
              transition={{ duration: 0.2 }}
            >
              {pestana === 'entrar' ? <FormEntrar alPendiente={setPendiente} /> : <FormRegistro alRegistrar={setPendiente} />}
            </motion.div>
          </AnimatePresence>
        </>
      )}
    </MarcoCuenta>
  );
}
