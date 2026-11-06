import { PackagePlus, Plus, Search } from 'lucide-react';
import { useCallback, useState } from 'react';
import { urlArchivo } from '../../app/config';
import { catalogoApi } from '../../catalogo/api/catalogoApi';
import { confirmar, error as alertaError, exito } from '../../common/alertas/alertas';
import Boton from '../../common/components/Boton';
import EstadoVacio from '../../common/components/EstadoVacio';
import Hoja from '../../common/components/Hoja';
import Pagina from '../../common/components/Pagina';
import EncabezadoPanel from '../../layout/EncabezadoPanel';
import { useConsulta } from '../../common/hooks/useConsulta';
import { useRetraso } from '../../common/hooks/useRetraso';
import { useNotificaciones } from '../../notificaciones/context/NotificacionesContext';
import { vendedorApi } from '../api/vendedorApi';
import FormularioMueble from '../components/FormularioMueble';
import TablaMuebles from '../components/TablaMuebles';

export default function PanelMueblesPage() {
  const [texto, setTexto] = useState('');
  const buscar = useRetraso(texto.trim());
  const { datos, cargando, error, mutar, recargar } = useConsulta((s) => vendedorApi.listar({ buscar }, s), [buscar]);
  const categorias = useConsulta((s) => catalogoApi.categorias(s));
  const [editando, setEditando] = useState(null); // null cerrado, {} nuevo, mueble para editar
  const [guardando, setGuardando] = useState(false);
  const [publicando, setPublicando] = useState(null);
  const { notificar } = useNotificaciones();

  const muebles = datos?.contenido ?? [];
  const cerrar = useCallback(() => setEditando(null), []);

  function reemplazar(mueble) {
    mutar((pagina) => {
      if (!pagina) return pagina;
      const existe = pagina.contenido.some((m) => m.id === mueble.id);
      const contenido = existe ? pagina.contenido.map((m) => (m.id === mueble.id ? mueble : m)) : [mueble, ...pagina.contenido];
      return { ...pagina, contenido, totalElementos: pagina.totalElementos + (existe ? 0 : 1) };
    });
    setEditando((actual) => (actual && (actual.id === mueble.id || !actual.id) ? mueble : actual));
  }

  function alGuardar(mueble, esNuevo) {
    reemplazar(mueble);
    notificar({
      tipo: 'mueble',
      titulo: esNuevo ? 'Borrador creado' : 'Cambios guardados',
      texto: esNuevo ? `${mueble.nombre}: ahora sube el modelo 3D y la foto.` : mueble.nombre,
      guardar: esNuevo,
    });
  }

  async function alPublicar(mueble, publicado) {
    setPublicando(mueble.id);
    try {
      const actualizado = await vendedorApi.publicar(mueble.id, publicado);
      reemplazar(actualizado);
      if (publicado) {
        notificar({ tipo: 'exito', titulo: `${mueble.nombre} ya está publicado`, texto: 'Aparece en el catálogo con 3D y AR.', guardar: true, duracion: 2500 });
        exito({ titulo: `¡${mueble.nombre} publicado!`, texto: 'Tus clientes ya pueden verlo en 3D y probarlo en su espacio.', imagen: urlArchivo(actualizado.imagenUrl) });
      } else {
        notificar({ tipo: 'info', titulo: 'Pasó a borrador', texto: mueble.nombre, guardar: false });
      }
    } catch (e) {
      alertaError({ titulo: 'No se pudo cambiar la publicación', texto: e.message });
    } finally {
      setPublicando(null);
    }
  }

  async function alEliminar(mueble) {
    const ok = await confirmar({
      titulo: `¿Eliminar ${mueble.nombre}?`,
      texto: 'Se borran también su modelo 3D y su foto. Esta acción no se puede deshacer.',
      boton: 'Sí, eliminar',
      peligro: true,
    });
    if (!ok) return;
    try {
      await vendedorApi.eliminar(mueble.id);
      mutar((p) => p && { ...p, contenido: p.contenido.filter((m) => m.id !== mueble.id), totalElementos: p.totalElementos - 1 });
      notificar({ tipo: 'info', titulo: 'Mueble eliminado', texto: mueble.nombre, guardar: false });
    } catch (e) {
      alertaError({ titulo: 'No se pudo eliminar', texto: e.message });
    }
  }

  return (
    <Pagina className="mx-auto max-w-6xl px-4 py-6 lg:px-8 lg:py-8">
      <EncabezadoPanel titulo="Mis muebles" texto={datos ? `${datos.totalElementos} en total · ${muebles.filter((m) => m.publicado).length} publicados` : 'Cargando…'}>
        <Boton icono={Plus} variante="acento" onClick={() => setEditando({})}>
          Nuevo mueble
        </Boton>
      </EncabezadoPanel>

      <label className="relative mb-5 block max-w-sm">
        <span className="sr-only">Buscar en mis muebles</span>
        <Search className="pointer-events-none absolute left-4 top-1/2 size-[18px] -translate-y-1/2 text-gris-2" aria-hidden />
        <input
          type="search"
          value={texto}
          onChange={(e) => setTexto(e.target.value)}
          placeholder="Buscar por nombre"
          className="h-11 w-full rounded-full border border-borde bg-white pl-11 pr-4 text-[14.5px] outline-none focus:border-tinta focus:ring-4 focus:ring-tinta/5"
        />
      </label>

      {error && !datos ? (
        <EstadoVacio titulo="No pudimos cargar tus muebles" texto={error.message}>
          <Boton variante="secundario" onClick={recargar}>
            Reintentar
          </Boton>
        </EstadoVacio>
      ) : cargando && !datos ? (
        <div className="grid gap-3">
          {[0, 1, 2].map((i) => (
            <div key={i} className="esqueleto h-20 rounded-[22px]" />
          ))}
        </div>
      ) : muebles.length === 0 ? (
        <EstadoVacio icono={PackagePlus} titulo={buscar ? 'Sin coincidencias' : 'Aún no tienes muebles'} texto={buscar ? 'Prueba con otro nombre.' : 'Crea el primero, sube su modelo 3D y publícalo.'}>
          {!buscar && (
            <Boton icono={Plus} onClick={() => setEditando({})}>
              Crear mi primer mueble
            </Boton>
          )}
        </EstadoVacio>
      ) : (
        <TablaMuebles muebles={muebles} alEditar={setEditando} alEliminar={alEliminar} alPublicar={alPublicar} publicando={publicando} />
      )}

      <Hoja
        abierta={editando !== null}
        alCerrar={cerrar}
        titulo={editando?.id ? `Editar ${editando.nombre}` : 'Nuevo mueble'}
        pie={
          <div className="flex gap-2 pb-2">
            <Boton variante="secundario" onClick={cerrar} className="flex-1">
              {editando?.id ? 'Cerrar' : 'Cancelar'}
            </Boton>
            <Boton type="submit" form="form-mueble" cargando={guardando} className="flex-1">
              {editando?.id ? 'Guardar cambios' : 'Crear borrador'}
            </Boton>
          </div>
        }
      >
        {editando && (
          <FormularioMueble
            key={editando.id ?? 'nuevo'}
            mueble={editando.id ? editando : null}
            categorias={categorias.datos?.contenido}
            alGuardar={alGuardar}
            alCambiarArchivos={reemplazar}
            alEstado={setGuardando}
          />
        )}
      </Hoja>
    </Pagina>
  );
}
