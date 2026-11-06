import { ShoppingBag } from 'lucide-react';
import { useState } from 'react';
import Boton from '../../common/components/Boton';
import EstadoVacio from '../../common/components/EstadoVacio';
import Pagina from '../../common/components/Pagina';
import Selector from '../../common/components/Selector';
import { useConsulta } from '../../common/hooks/useConsulta';
import Encabezado from '../../layout/Encabezado';
import { pedidosApi } from '../api/pedidosApi';
import ListaPedidos from '../components/ListaPedidos';
import { OPCIONES_ESTADO } from '../estados';

const PASO = 20;

/** Compras y consultas del cliente, de la actividad más reciente a la más antigua. */
export default function MisPedidosPage() {
  const [estado, setEstado] = useState('');
  const [cuantos, setCuantos] = useState(PASO);
  const { datos, error, cargando, recargar } = useConsulta((s) => pedidosApi.compras({ estado, size: cuantos }, s), [estado, cuantos]);
  const pedidos = datos?.contenido ?? [];

  return (
    <Pagina className="mx-auto max-w-2xl px-4 pb-32">
      <Encabezado
        volver
        titulo="Mis pedidos"
        subtitulo="Compras y preguntas a vendedores"
        acciones={
          <Selector
            compacto
            etiqueta="Filtrar por estado"
            opciones={OPCIONES_ESTADO}
            value={estado}
            onChange={(e) => {
              setEstado(e.target.value);
              setCuantos(PASO);
            }}
            className="w-40"
          />
        }
      />

      {error && !datos ? (
        <EstadoVacio
          icono={ShoppingBag}
          titulo={error.estado === 403 ? 'Tu cuenta no hace pedidos' : 'No pudimos cargar tus pedidos'}
          texto={error.estado === 403 ? 'Pedir muebles es parte del rol Cliente.' : error.message}
        >
          {error.estado !== 403 && (
            <Boton variante="secundario" onClick={recargar}>
              Reintentar
            </Boton>
          )}
        </EstadoVacio>
      ) : !datos ? (
        <div className="grid gap-3">
          {[0, 1, 2].map((i) => (
            <div key={i} className="esqueleto h-24 rounded-[22px]" />
          ))}
        </div>
      ) : pedidos.length === 0 ? (
        <EstadoVacio
          icono={ShoppingBag}
          titulo={estado ? 'Nada en este estado' : 'Aún no tienes pedidos'}
          texto={estado ? 'Prueba con otro filtro.' : 'Cuando preguntes o pidas un mueble, aquí sigues la conversación con quien lo vende.'}
        >
          {!estado && <Boton a="/catalogo">Explorar el catálogo</Boton>}
        </EstadoVacio>
      ) : (
        <>
          <ListaPedidos pedidos={pedidos} base="/pedidos" />
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
