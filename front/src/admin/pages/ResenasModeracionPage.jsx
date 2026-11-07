import { MessageSquareText, Search } from 'lucide-react';
import { useState } from 'react';
import { confirmar } from '../../common/alertas/alertas';
import Boton from '../../common/components/Boton';
import EstadoVacio from '../../common/components/EstadoVacio';
import Pagina from '../../common/components/Pagina';
import Selector from '../../common/components/Selector';
import { useConsulta } from '../../common/hooks/useConsulta';
import { useRetraso } from '../../common/hooks/useRetraso';
import EncabezadoPanel from '../../layout/EncabezadoPanel';
import { useNotificaciones } from '../../notificaciones/context/NotificacionesContext';
import { resenasApi } from '../../resenas/api/resenasApi';
import TarjetaResena from '../../resenas/components/TarjetaResena';

const PASO = 20;
const VISTAS = [
  { valor: '', texto: 'Todas' },
  { valor: 'false', texto: 'Visibles' },
  { valor: 'true', texto: 'Ocultas' },
];

/** Moderación de reseñas: buscar por mueble, persona o texto y ocultar o volver a mostrar. */
export default function ResenasModeracionPage() {
  const { notificar } = useNotificaciones();
  const [vista, setVista] = useState('');
  const [texto, setTexto] = useState('');
  const [cuantos, setCuantos] = useState(PASO);
  const buscar = useRetraso(texto.trim());

  const { datos, error, cargando, recargar, mutar } = useConsulta(
    (s) => resenasApi.moderacion({ oculta: vista || undefined, buscar: buscar || undefined, size: cuantos }, s),
    [vista, buscar, cuantos],
  );
  const resenas = datos?.contenido ?? [];

  async function alternar(resena) {
    const ocultar = !resena.oculta;
    if (
      ocultar &&
      !(await confirmar({
        titulo: '¿Ocultar esta reseña?',
        texto: 'Deja de verse en el mueble y no cuenta para su calificación. Puedes volver a mostrarla.',
        boton: 'Ocultar',
      }))
    ) {
      return;
    }
    try {
      const nueva = await resenasApi.ocultar(resena.id, ocultar);
      mutar((d) => ({ ...d, contenido: d.contenido.map((r) => (r.id === nueva.id ? nueva : r)) }));
      notificar({ tipo: 'exito', titulo: ocultar ? 'Reseña oculta' : 'Reseña visible', guardar: false });
    } catch (e) {
      notificar({ tipo: 'error', titulo: 'No se pudo cambiar', texto: e.message, guardar: false });
    }
  }

  return (
    <Pagina className="mx-auto max-w-3xl px-4 py-6 lg:px-8 lg:py-8">
      <EncabezadoPanel titulo="Reseñas" texto="Opiniones de compra verificada de toda la tienda" />

      <div className="mb-5 flex flex-wrap items-center gap-2">
        <Selector
          compacto
          etiqueta="Qué reseñas ver"
          opciones={VISTAS}
          value={vista}
          onChange={(e) => {
            setVista(e.target.value);
            setCuantos(PASO);
          }}
          className="w-40"
        />
        <label className="relative block min-w-56 flex-1 sm:max-w-sm">
          <span className="sr-only">Buscar reseñas</span>
          <Search className="pointer-events-none absolute left-4 top-1/2 size-[18px] -translate-y-1/2 text-gris-2" aria-hidden />
          <input
            type="search"
            value={texto}
            onChange={(e) => {
              setTexto(e.target.value);
              setCuantos(PASO);
            }}
            placeholder="Mueble, persona o texto"
            className="h-10 w-full rounded-full border border-borde bg-white pl-11 pr-4 text-[14px] outline-none focus:border-tinta focus:ring-4 focus:ring-tinta/5"
          />
        </label>
      </div>

      {error && !datos ? (
        <EstadoVacio titulo="No pudimos cargar las reseñas" texto={error.message}>
          <Boton variante="secundario" onClick={recargar}>
            Reintentar
          </Boton>
        </EstadoVacio>
      ) : !datos ? (
        <div className="grid gap-3">
          {[0, 1, 2].map((i) => (
            <div key={i} className="esqueleto h-28 rounded-[22px]" />
          ))}
        </div>
      ) : resenas.length === 0 ? (
        <EstadoVacio icono={MessageSquareText} titulo={vista || buscar ? 'Sin coincidencias' : 'Aún no hay reseñas'} texto="Las reseñas llegan cuando un cliente recibe su mueble." />
      ) : (
        <div className="grid gap-3">
          {resenas.map((r) => (
            <TarjetaResena key={r.id} resena={r} alOcultar={alternar} />
          ))}
          {!datos.ultima && (
            <Boton variante="secundario" bloque cargando={cargando} onClick={() => setCuantos((n) => n + PASO)}>
              Ver más
            </Boton>
          )}
        </div>
      )}
    </Pagina>
  );
}
