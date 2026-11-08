import { BadgeCheck, Search, Users } from 'lucide-react';
import { AnimatePresence, motion } from 'motion/react';
import { useState } from 'react';
import { useSesion } from '../../auth/context/SesionContext';
import { datosRol } from '../../auth/roles';
import { error as alertaError } from '../../common/alertas/alertas';
import Boton from '../../common/components/Boton';
import EstadoVacio from '../../common/components/EstadoVacio';
import Interruptor from '../../common/components/Interruptor';
import Pagina from '../../common/components/Pagina';
import { useConsulta } from '../../common/hooks/useConsulta';
import { useRetraso } from '../../common/hooks/useRetraso';
import EncabezadoPanel from '../../layout/EncabezadoPanel';
import { useNotificaciones } from '../../notificaciones/context/NotificacionesContext';
import { adminApi } from '../api/adminApi';

/**
 * Roles que el administrador asigna, de menor a mayor alcance. Transportista no: lo registra
 * cada vendedor desde su panel; aquí solo se muestra como etiqueta.
 */
const ROLES = ['CLIENTE', 'VENDEDOR', 'ADMIN'];

/** Chips para activar o quitar roles (multirol). Al menos un rol debe quedar. */
function ChipsRoles({ usuario, alCambiar, ocupado }) {
  return (
    <div className="flex flex-wrap gap-1.5">
      {ROLES.map((rol) => {
        const activo = usuario.roles.includes(rol);
        return (
          <button
            key={rol}
            type="button"
            disabled={ocupado || (activo && usuario.roles.length === 1)}
            aria-pressed={activo}
            onClick={() => alCambiar(activo ? usuario.roles.filter((r) => r !== rol) : [...usuario.roles, rol])}
            className={`h-8 rounded-full border px-3 text-[12.5px] font-semibold transition-colors disabled:cursor-not-allowed ${
              activo ? 'border-tinta bg-tinta text-crema' : 'border-borde bg-white text-gris hover:text-tinta'
            }`}
          >
            {datosRol(rol).nombre}
          </button>
        );
      })}
      {usuario.roles.includes('TRANSPORTISTA') && (
        <span className="inline-flex h-8 items-center rounded-full border border-dashed border-borde px-3 text-[12.5px] font-semibold text-gris" title="Lo registró un vendedor">
          {datosRol('TRANSPORTISTA').nombre}
        </span>
      )}
    </div>
  );
}

export default function UsuariosPage() {
  const { usuario: yo } = useSesion();
  const [texto, setTexto] = useState('');
  const [pagina, setPagina] = useState(0);
  const buscar = useRetraso(texto.trim());
  const { datos, cargando, mutar } = useConsulta((s) => adminApi.usuarios({ buscar, page: pagina }, s), [buscar, pagina]);
  const [ocupado, setOcupado] = useState(null);
  const { notificar } = useNotificaciones();
  const usuarios = datos?.contenido ?? [];

  async function aplicar(u, accion, mensaje) {
    setOcupado(u.id);
    try {
      const actualizado = await accion();
      mutar((p) => p && { ...p, contenido: p.contenido.map((x) => (x.id === u.id ? actualizado : x)) });
      notificar({ tipo: 'exito', titulo: mensaje, texto: u.nombre, guardar: false });
    } catch (e) {
      alertaError({ titulo: 'No se pudo guardar', texto: e.message });
    } finally {
      setOcupado(null);
    }
  }

  return (
    <Pagina className="mx-auto max-w-5xl px-4 py-6 lg:px-8 lg:py-8">
      <EncabezadoPanel titulo="Usuarios" texto={datos ? `${datos.totalElementos} cuentas` : 'Cargando…'} />

      <label className="relative mb-5 block max-w-sm">
        <span className="sr-only">Buscar usuarios</span>
        <Search className="pointer-events-none absolute left-4 top-1/2 size-[18px] -translate-y-1/2 text-gris-2" aria-hidden />
        <input
          type="search"
          value={texto}
          onChange={(e) => {
            setTexto(e.target.value);
            setPagina(0);
          }}
          placeholder="Nombre o correo"
          className="h-11 w-full rounded-full border border-borde bg-white pl-11 pr-4 text-[14.5px] outline-none focus:border-tinta focus:ring-4 focus:ring-tinta/5"
        />
      </label>

      {cargando && !datos ? (
        <div className="grid gap-3">{[0, 1, 2].map((i) => <div key={i} className="esqueleto h-20 rounded-[22px]" />)}</div>
      ) : usuarios.length === 0 ? (
        <EstadoVacio icono={Users} titulo="Sin usuarios" texto="No hay cuentas que coincidan con la búsqueda." />
      ) : (
        <ul className={`grid gap-3 transition-opacity ${cargando ? 'opacity-60' : ''}`}>
          <AnimatePresence initial={false}>
            {usuarios.map((u, i) => {
              const soyYo = u.id === yo?.id;
              return (
                <motion.li key={u.id} layout initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0, transition: { delay: i * 0.03 } }}
                  className={`flex flex-wrap items-center gap-4 rounded-[22px] border border-linea bg-white p-4 ${u.activo ? '' : 'opacity-70'}`}>
                  <span className="grid size-11 shrink-0 place-items-center rounded-2xl bg-crema font-display text-[17px] font-bold">{u.nombre?.[0]?.toUpperCase()}</span>
                  <div className="min-w-0 flex-1 basis-48">
                    <p className="flex items-center gap-1.5 truncate font-semibold">
                      {u.nombre} {soyYo && <span className="text-[12px] font-medium text-gris">(tú)</span>}
                      {u.verificado && <BadgeCheck className="size-4 text-salvia" aria-label="Correo verificado" />}
                    </p>
                    <p className="truncate text-[12.5px] text-gris">{u.email}</p>
                  </div>
                  <ChipsRoles usuario={u} ocupado={ocupado === u.id || soyYo} alCambiar={(roles) => aplicar(u, () => adminApi.cambiarRoles(u.id, roles), 'Roles actualizados')} />
                  <label className="flex items-center gap-2 text-[12.5px] font-semibold text-texto">
                    <Interruptor activo={u.activo} deshabilitado={ocupado === u.id || soyYo} etiqueta={`Cuenta activa de ${u.nombre}`}
                      alCambiar={(activo) => aplicar(u, () => adminApi.cambiarEstado(u.id, activo), activo ? 'Cuenta activada' : 'Cuenta desactivada')} />
                    {u.activo ? 'Activa' : 'Inactiva'}
                  </label>
                </motion.li>
              );
            })}
          </AnimatePresence>
        </ul>
      )}

      {datos && datos.totalPaginas > 1 && (
        <div className="mt-6 flex items-center justify-center gap-3">
          <Boton variante="secundario" chico disabled={datos.primera} onClick={() => setPagina((p) => p - 1)}>Anterior</Boton>
          <span className="text-[13px] text-gris">Página {datos.pagina + 1} de {datos.totalPaginas}</span>
          <Boton variante="secundario" chico disabled={datos.ultima} onClick={() => setPagina((p) => p + 1)}>Siguiente</Boton>
        </div>
      )}
    </Pagina>
  );
}
