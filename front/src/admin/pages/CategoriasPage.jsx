import { Pencil, Plus, Tags, Trash2 } from 'lucide-react';
import { AnimatePresence, motion } from 'motion/react';
import { useCallback, useState } from 'react';
import { confirmar, error as alertaError } from '../../common/alertas/alertas';
import Boton from '../../common/components/Boton';
import Campo from '../../common/components/Campo';
import EstadoVacio from '../../common/components/EstadoVacio';
import Hoja from '../../common/components/Hoja';
import Pagina from '../../common/components/Pagina';
import { useConsulta } from '../../common/hooks/useConsulta';
import { useEnvio } from '../../common/hooks/useEnvio';
import { estiloCategoria } from '../../common/utils/categorias';
import EncabezadoPanel from '../../layout/EncabezadoPanel';
import { useNotificaciones } from '../../notificaciones/context/NotificacionesContext';
import { adminApi } from '../api/adminApi';

function FormCategoria({ categoria, alGuardar }) {
  const [datos, setDatos] = useState({ nombre: categoria?.nombre ?? '', descripcion: categoria?.descripcion ?? '' });
  const guardar = (cuerpo) => (categoria?.id ? adminApi.actualizarCategoria(categoria.id, cuerpo) : adminApi.crearCategoria(cuerpo));
  const { enviar, error, errores } = useEnvio(guardar);

  async function alEnviar(e) {
    e.preventDefault();
    const r = await enviar({ nombre: datos.nombre.trim(), descripcion: datos.descripcion.trim() || null });
    if (r.ok) alGuardar(r.datos, !categoria?.id);
  }

  return (
    <form id="form-categoria" onSubmit={alEnviar} className="grid gap-4" noValidate>
      {error && !Object.keys(errores).length && <p role="alert" className="rounded-2xl bg-[#F6DAD7] px-4 py-3 text-[13.5px] text-[#8C1D17]">{error.message}</p>}
      <Campo etiqueta="Nombre" placeholder="Sofás" value={datos.nombre} error={errores.nombre} onChange={(e) => setDatos({ ...datos, nombre: e.target.value })} />
      <Campo etiqueta="Descripción" multilinea placeholder="Para qué tipo de muebles es" value={datos.descripcion} error={errores.descripcion}
        onChange={(e) => setDatos({ ...datos, descripcion: e.target.value })} />
    </form>
  );
}

export default function CategoriasPage() {
  const { datos, cargando, mutar } = useConsulta((s) => adminApi.categorias({}, s));
  const [editando, setEditando] = useState(null);
  const { notificar } = useNotificaciones();
  const categorias = datos?.contenido ?? [];
  const cerrar = useCallback(() => setEditando(null), []);

  function alGuardar(categoria, esNueva) {
    mutar((p) => {
      if (!p) return p;
      const contenido = esNueva ? [...p.contenido, categoria] : p.contenido.map((c) => (c.id === categoria.id ? categoria : c));
      return { ...p, contenido: contenido.sort((a, b) => a.nombre.localeCompare(b.nombre, 'es')) };
    });
    setEditando(null);
    notificar({ tipo: 'exito', titulo: esNueva ? 'Categoría creada' : 'Categoría actualizada', texto: categoria.nombre, guardar: false });
  }

  async function eliminar(c) {
    if (!(await confirmar({ titulo: `¿Eliminar ${c.nombre}?`, texto: 'Solo se puede si no tiene muebles.', boton: 'Eliminar', peligro: true }))) return;
    try {
      await adminApi.eliminarCategoria(c.id);
      mutar((p) => p && { ...p, contenido: p.contenido.filter((x) => x.id !== c.id) });
      notificar({ tipo: 'info', titulo: 'Categoría eliminada', texto: c.nombre, guardar: false });
    } catch (e) {
      alertaError({ titulo: 'No se pudo eliminar', texto: e.message });
    }
  }

  return (
    <Pagina className="mx-auto max-w-4xl px-4 py-6 lg:px-8 lg:py-8">
      <EncabezadoPanel titulo="Categorías" texto="Agrupan el catálogo y dan color a cada mueble.">
        <Boton icono={Plus} variante="acento" onClick={() => setEditando({})}>
          Nueva categoría
        </Boton>
      </EncabezadoPanel>

      {cargando && !datos ? (
        <div className="grid gap-3 sm:grid-cols-2">
          {[0, 1, 2, 3].map((i) => <div key={i} className="esqueleto h-24 rounded-[22px]" />)}
        </div>
      ) : categorias.length === 0 ? (
        <EstadoVacio icono={Tags} titulo="Sin categorías" texto="Crea la primera para empezar a ordenar el catálogo." />
      ) : (
        <ul className="grid gap-3 sm:grid-cols-2">
          <AnimatePresence initial={false}>
            {categorias.map((c, i) => {
              const { tinte, Icono } = estiloCategoria(c.slug);
              return (
                <motion.li key={c.id} layout initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0, transition: { delay: i * 0.03 } }} exit={{ opacity: 0, scale: 0.95 }}
                  className="flex items-center gap-3.5 rounded-[22px] border border-linea bg-white p-3.5">
                  <span className="grid size-12 shrink-0 place-items-center rounded-2xl" style={{ background: tinte }}>
                    <Icono className="size-[22px]" aria-hidden />
                  </span>
                  <div className="min-w-0 flex-1">
                    <p className="truncate font-semibold">{c.nombre}</p>
                    <p className="truncate text-[12.5px] text-gris">{c.descripcion || `/${c.slug}`}</p>
                  </div>
                  <button type="button" onClick={() => setEditando(c)} className="grid size-9 place-items-center rounded-full hover:bg-crema" aria-label={`Editar ${c.nombre}`}>
                    <Pencil className="size-[17px]" />
                  </button>
                  <button type="button" onClick={() => eliminar(c)} className="grid size-9 place-items-center rounded-full hover:bg-[#F6DAD7] hover:text-[#B3261E]" aria-label={`Eliminar ${c.nombre}`}>
                    <Trash2 className="size-[17px]" />
                  </button>
                </motion.li>
              );
            })}
          </AnimatePresence>
        </ul>
      )}

      <Hoja
        abierta={editando !== null}
        alCerrar={cerrar}
        titulo={editando?.id ? `Editar ${editando.nombre}` : 'Nueva categoría'}
        pie={
          <div className="flex gap-2 pb-2">
            <Boton variante="secundario" onClick={cerrar} className="flex-1">Cancelar</Boton>
            <Boton type="submit" form="form-categoria" className="flex-1">Guardar</Boton>
          </div>
        }
      >
        {editando && <FormCategoria key={editando.id ?? 'nueva'} categoria={editando.id ? editando : null} alGuardar={alGuardar} />}
      </Hoja>
    </Pagina>
  );
}
