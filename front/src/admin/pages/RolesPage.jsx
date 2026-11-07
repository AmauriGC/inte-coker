import { Lock, Shield } from 'lucide-react';
import { motion } from 'motion/react';
import { useState } from 'react';
import { datosRol } from '../../auth/roles';
import { error as alertaError } from '../../common/alertas/alertas';
import Boton from '../../common/components/Boton';
import Pagina from '../../common/components/Pagina';
import { useConsulta } from '../../common/hooks/useConsulta';
import EncabezadoPanel from '../../layout/EncabezadoPanel';
import { useNotificaciones } from '../../notificaciones/context/NotificacionesContext';
import { adminApi } from '../api/adminApi';

function TarjetaRol({ rol, permisos, alGuardar, i }) {
  const fijo = rol.nombre === 'ADMIN';
  const [seleccion, setSeleccion] = useState(() => new Set(rol.permisos));
  const [guardando, setGuardando] = useState(false);
  const cambiado = seleccion.size !== rol.permisos.length || rol.permisos.some((p) => !seleccion.has(p));

  function alternar(nombre) {
    setSeleccion((s) => {
      const n = new Set(s);
      if (n.has(nombre)) n.delete(nombre);
      else n.add(nombre);
      return n;
    });
  }

  async function guardar() {
    setGuardando(true);
    await alGuardar(rol, [...seleccion]);
    setGuardando(false);
  }

  return (
    <motion.section initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0, transition: { delay: i * 0.06 } }} className="rounded-[24px] border border-linea bg-white p-5">
      <div className="flex items-start gap-3">
        <span className={`grid size-11 shrink-0 place-items-center rounded-2xl ${fijo ? 'bg-tinta text-crema' : 'bg-crema'}`}>
          {fijo ? <Lock className="size-5" /> : <Shield className="size-5" />}
        </span>
        <div className="min-w-0 flex-1">
          <h2 className="font-display text-lg font-semibold">{datosRol(rol.nombre).nombre}</h2>
          <p className="text-[13px] text-gris">{fijo ? 'Siempre conserva todos los permisos.' : rol.descripcion}</p>
        </div>
      </div>
      <ul className="mt-4 flex flex-wrap gap-2">
        {permisos.map((p) => {
          const activo = fijo || seleccion.has(p.nombre);
          return (
            <li key={p.nombre}>
              <button
                type="button"
                disabled={fijo}
                aria-pressed={activo}
                title={p.descripcion}
                onClick={() => alternar(p.nombre)}
                className={`rounded-full border px-3 py-1.5 text-[12.5px] font-semibold transition-colors disabled:cursor-default ${
                  activo ? 'border-salvia bg-salvia text-white' : 'border-borde bg-white text-gris hover:text-tinta'
                }`}
              >
                {p.descripcion}
              </button>
            </li>
          );
        })}
      </ul>
      {!fijo && (
        <div className="mt-4 flex justify-end gap-2">
          <Boton variante="fantasma" chico disabled={!cambiado || guardando} onClick={() => setSeleccion(new Set(rol.permisos))}>Descartar</Boton>
          <Boton chico disabled={!cambiado} cargando={guardando} onClick={guardar}>Guardar permisos</Boton>
        </div>
      )}
    </motion.section>
  );
}

export default function RolesPage() {
  const roles = useConsulta((s) => adminApi.roles(s));
  const permisos = useConsulta((s) => adminApi.permisos(s));
  const { notificar } = useNotificaciones();

  async function alGuardar(rol, lista) {
    try {
      const actualizado = await adminApi.cambiarPermisos(rol.id, lista);
      roles.mutar((rs) => rs.map((r) => (r.id === rol.id ? actualizado : r)));
      notificar({ tipo: 'exito', titulo: 'Permisos guardados', texto: `${datosRol(rol.nombre).nombre}: aplican desde la siguiente acción de cada usuario.`, guardar: false });
    } catch (e) {
      alertaError({ titulo: 'No se pudieron guardar', texto: e.message });
    }
  }

  const listo = roles.datos && permisos.datos;

  return (
    <Pagina className="mx-auto max-w-4xl px-4 py-6 lg:px-8 lg:py-8">
      <EncabezadoPanel titulo="Roles y permisos" texto="Elige qué puede hacer cada rol. Una cuenta puede tener varios roles." />
      {!listo ? (
        <div className="grid gap-4">{[0, 1, 2].map((i) => <div key={i} className="esqueleto h-44 rounded-[24px]" />)}</div>
      ) : (
        <div className="grid gap-4">
          {roles.datos.map((r, i) => (
            <TarjetaRol key={`${r.id}-${r.permisos.join()}`} rol={r} permisos={permisos.datos} alGuardar={alGuardar} i={i} />
          ))}
        </div>
      )}
    </Pagina>
  );
}
