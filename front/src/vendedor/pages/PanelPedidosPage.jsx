import { Inbox, Search } from 'lucide-react';
import { useState } from 'react';
import { useSesion } from '../../auth/context/SesionContext';
import Boton from '../../common/components/Boton';
import EstadoVacio from '../../common/components/EstadoVacio';
import Pagina from '../../common/components/Pagina';
import Selector from '../../common/components/Selector';
import { useConsulta } from '../../common/hooks/useConsulta';
import { useRetraso } from '../../common/hooks/useRetraso';
import EncabezadoPanel from '../../layout/EncabezadoPanel';
import { pedidosApi } from '../../pedidos/api/pedidosApi';
import ListaPedidos from '../../pedidos/components/ListaPedidos';
import { usePedidos } from '../../pedidos/context/PedidosContext';
import { OPCIONES_ESTADO } from '../../pedidos/estados';

const PASO = 20;

/**
 * Pedidos del panel. El vendedor ve los de sus muebles; el administrador puede cambiar a
 * "Todos" para supervisar (buscar por folio, mueble o persona y cancelar si hace falta).
 */
export default function PanelPedidosPage() {
  const { tienePermiso } = useSesion();
  const { resumen } = usePedidos();
  const atiende = tienePermiso('PEDIDO_ATENDER');
  const supervisa = tienePermiso('PEDIDO_SUPERVISAR');
  const [vista, setVista] = useState(atiende ? 'ventas' : 'todos');
  const [estado, setEstado] = useState('');
  const [texto, setTexto] = useState('');
  const [cuantos, setCuantos] = useState(PASO);
  const buscar = useRetraso(texto.trim());
  const todos = vista === 'todos';

  const { datos, error, cargando, recargar } = useConsulta(
    (s) => (todos ? pedidosApi.todos({ estado, buscar, size: cuantos }, s) : pedidosApi.ventas({ estado, size: cuantos }, s)),
    [vista, estado, buscar, cuantos],
  );
  const pedidos = datos?.contenido ?? [];

  const cambiar = (fn) => (valor) => {
    fn(valor);
    setCuantos(PASO);
  };

  const texto1 = todos
    ? 'Todos los pedidos de la tienda'
    : resumen.ventasPorAtender > 0
      ? `${resumen.ventasPorAtender} por aceptar o rechazar`
      : 'Pedidos y preguntas sobre tus muebles';

  return (
    <Pagina className="mx-auto max-w-4xl px-4 py-6 lg:px-8 lg:py-8">
      <EncabezadoPanel titulo="Pedidos" texto={texto1}>
        {atiende && supervisa && (
          <div className="grid grid-cols-2 gap-1 rounded-full border border-borde bg-white p-1" role="radiogroup" aria-label="Qué pedidos ver">
            {[
              ['ventas', 'Mis ventas'],
              ['todos', 'Todos'],
            ].map(([valor, etiqueta]) => (
              <button
                key={valor}
                type="button"
                role="radio"
                aria-checked={vista === valor}
                onClick={() => cambiar(setVista)(valor)}
                className={`rounded-full px-4 py-1.5 text-[13px] font-semibold transition-colors ${vista === valor ? 'bg-tinta text-crema' : 'text-texto hover:bg-crema'}`}
              >
                {etiqueta}
              </button>
            ))}
          </div>
        )}
      </EncabezadoPanel>

      <div className="mb-5 flex flex-wrap items-center gap-2">
        <Selector compacto etiqueta="Filtrar por estado" opciones={OPCIONES_ESTADO} value={estado} onChange={(e) => cambiar(setEstado)(e.target.value)} className="w-48" />
        {todos && (
          <label className="relative block min-w-56 flex-1 sm:max-w-sm">
            <span className="sr-only">Buscar pedidos</span>
            <Search className="pointer-events-none absolute left-4 top-1/2 size-[18px] -translate-y-1/2 text-gris-2" aria-hidden />
            <input
              type="search"
              value={texto}
              onChange={(e) => cambiar(setTexto)(e.target.value)}
              placeholder="Folio, mueble o persona"
              className="h-10 w-full rounded-full border border-borde bg-white pl-11 pr-4 text-[14px] outline-none focus:border-tinta focus:ring-4 focus:ring-tinta/5"
            />
          </label>
        )}
      </div>

      {error && !datos ? (
        <EstadoVacio titulo="No pudimos cargar los pedidos" texto={error.message}>
          <Boton variante="secundario" onClick={recargar}>
            Reintentar
          </Boton>
        </EstadoVacio>
      ) : !datos ? (
        <div className="grid gap-3">
          {[0, 1, 2].map((i) => (
            <div key={i} className="esqueleto h-24 rounded-[22px]" />
          ))}
        </div>
      ) : pedidos.length === 0 ? (
        <EstadoVacio
          icono={Inbox}
          titulo={estado || buscar ? 'Sin coincidencias' : 'Aún no hay pedidos'}
          texto={estado || buscar ? 'Prueba con otro filtro.' : 'Cuando un cliente pregunte o pida uno de tus muebles, aparece aquí y te llega un correo.'}
        />
      ) : (
        <>
          <ListaPedidos pedidos={pedidos} base="/panel/pedidos" />
          {!datos.ultima && (
            <Boton variante="secundario" bloque cargando={cargando} onClick={() => setCuantos((n) => n + PASO)} className="mt-4">
              Ver más
            </Boton>
          )}
        </>
      )}
    </Pagina>
  );
}
