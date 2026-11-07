import { BarChart3, Clock, Eye, MapPin, Package, Percent, ReceiptText, Star, Wallet } from 'lucide-react';
import { motion } from 'motion/react';
import { useState } from 'react';
import { Link } from 'react-router';
import { useSesion } from '../../auth/context/SesionContext';
import Boton from '../../common/components/Boton';
import EstadoVacio from '../../common/components/EstadoVacio';
import { useConsulta } from '../../common/hooks/useConsulta';
import { precio } from '../../common/utils/formato';
import EncabezadoPanel from '../../layout/EncabezadoPanel';
import { PAGOS } from '../../pedidos/estados';
import { metricasApi } from '../api/metricasApi';
import GraficaSerie from '../components/GraficaSerie';

const PERIODOS = [7, 30, 90];
const numero = new Intl.NumberFormat('es-MX');

/** Ventas, zonas, muebles y conversión del vendedor; el administrador puede ver toda la tienda. */
export default function MetricasPage() {
  const { tienePermiso } = useSesion();
  const global = tienePermiso('METRICA_GLOBAL');
  const [dias, setDias] = useState(30);
  const [tienda, setTienda] = useState(global && !tienePermiso('METRICA_VER'));
  const { datos, error, recargar } = useConsulta((s) => metricasApi.metricas({ dias, tienda }, s), [dias, tienda]);

  return (
    <div className="mx-auto max-w-6xl px-4 py-6 lg:px-8 lg:py-8">
      <EncabezadoPanel titulo="Métricas" texto={tienda ? 'Ventas, zonas y conversión de toda la tienda' : 'Ventas, zonas y conversión de tus muebles'} />

      <div className="mb-5 flex flex-wrap items-center gap-2">
        <Chips opciones={PERIODOS.map((d) => ({ valor: d, texto: `${d} días` }))} valor={dias} alElegir={setDias} id="periodo" etiqueta="Periodo" />
        {global && tienePermiso('METRICA_VER') && (
          <Chips
            opciones={[
              { valor: false, texto: 'Mis muebles' },
              { valor: true, texto: 'Toda la tienda' },
            ]}
            valor={tienda}
            alElegir={setTienda}
            id="alcance"
            etiqueta="Alcance"
          />
        )}
      </div>

      {error && !datos ? (
        <EstadoVacio icono={BarChart3} titulo="No pudimos cargar las métricas" texto={error.message}>
          <Boton variante="secundario" onClick={recargar}>
            Reintentar
          </Boton>
        </EstadoVacio>
      ) : !datos ? (
        <div className="grid gap-4" aria-busy>
          <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
            {[0, 1, 2, 3].map((i) => (
              <div key={i} className="esqueleto h-24 rounded-[22px]" />
            ))}
          </div>
          <div className="esqueleto h-64 rounded-[24px]" />
        </div>
      ) : (
        <Contenido datos={datos} />
      )}
    </div>
  );
}

function Chips({ opciones, valor, alElegir, id, etiqueta }) {
  return (
    <div role="radiogroup" aria-label={etiqueta} className="flex gap-1 rounded-full border border-linea bg-white p-1">
      {opciones.map((o) => {
        const activo = o.valor === valor;
        return (
          <button
            key={String(o.valor)}
            type="button"
            role="radio"
            aria-checked={activo}
            onClick={() => alElegir(o.valor)}
            className={`relative h-8 rounded-full px-3.5 text-[13px] font-semibold ${activo ? 'text-crema' : 'text-tinta hover:bg-crema'}`}
          >
            {activo && <motion.span layoutId={`chip-${id}`} className="absolute inset-0 rounded-full bg-tinta" transition={{ type: 'spring', stiffness: 500, damping: 38 }} />}
            <span className="relative">{o.texto}</span>
          </button>
        );
      })}
    </div>
  );
}

function Contenido({ datos }) {
  const { resumen: r, serie, periodo, muebles, pagos } = datos;
  const [zona, setZona] = useState('ciudades');
  const zonas = zona === 'ciudades' ? datos.ciudades : datos.codigosPostales;
  const totalPagos = Object.values(pagos).reduce((a, b) => a + b, 0);

  return (
    <div className="grid gap-4">
      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        <Indicador Icono={Wallet} etiqueta="Ingresos" valor={precio(r.ingresos)} detalle={`${r.ventas} ${r.ventas === 1 ? 'venta entregada' : 'ventas entregadas'}`} />
        <Indicador Icono={Package} etiqueta="Piezas vendidas" valor={numero.format(r.piezas)} detalle={`Ticket promedio ${precio(r.ticketPromedio)}`} />
        <Indicador
          Icono={Percent}
          etiqueta="Conversión"
          valor={r.conversion == null ? 'Sin datos' : `${r.conversion}%`}
          detalle={`${numero.format(r.pedidos)} pedidos de ${numero.format(r.vistas)} vistas`}
        />
        <Indicador
          Icono={Star}
          etiqueta="Calificación"
          valor={r.calificacion == null ? 'Sin reseñas' : `${r.calificacion} de 5`}
          detalle={`${r.resenas} ${r.resenas === 1 ? 'reseña nueva' : 'reseñas nuevas'}`}
        />
      </div>

      <div className="grid gap-4 lg:grid-cols-[1.6fr_1fr]">
        <Tarjeta titulo="Ingresos" detalle={periodo.agrupacion === 'SEMANA' ? 'Por semana' : 'Por día'}>
          <GraficaSerie serie={serie} agrupacion={periodo.agrupacion} />
        </Tarjeta>

        <div className="grid gap-4">
          <Tarjeta titulo="Tiempos promedio">
            <dl className="grid grid-cols-2 gap-3">
              <Tiempo etiqueta="Para aceptar" horas={r.horasAceptacion} />
              <Tiempo etiqueta="Para entregar" horas={r.horasEntrega} />
            </dl>
          </Tarjeta>
          <Tarjeta titulo="Cómo pagan" detalle={totalPagos ? `${totalPagos} ventas` : null}>
            {totalPagos === 0 ? (
              <p className="text-[13px] text-gris">Aún no hay ventas con método de pago.</p>
            ) : (
              <Barras filas={Object.entries(pagos).map(([clave, n]) => ({ clave, nombre: PAGOS[clave]?.texto ?? clave, valor: n, texto: `${n} · ${Math.round((n * 100) / totalPagos)}%` }))} />
            )}
          </Tarjeta>
        </div>
      </div>

      <div className="grid gap-4 lg:grid-cols-[1fr_1.6fr]">
        <Tarjeta
          titulo="Zonas que más compran"
          detalle="Envíos a domicilio entregados"
          acciones={
            <Chips
              opciones={[
                { valor: 'ciudades', texto: 'Ciudad' },
                { valor: 'cp', texto: 'C. P.' },
              ]}
              valor={zona}
              alElegir={setZona}
              id="zona"
              etiqueta="Agrupar zonas por"
            />
          }
        >
          {zonas.length === 0 ? (
            <p className="flex items-center gap-2 text-[13px] text-gris">
              <MapPin className="size-4" aria-hidden />
              Sin envíos a domicilio entregados en el periodo.
            </p>
          ) : (
            <Barras
              filas={zonas.map((z) => ({
                clave: z.nombre,
                nombre: z.detalle ? `${z.nombre} · ${z.detalle}` : z.nombre,
                valor: z.ventas,
                texto: `${z.ventas} · ${precio(z.ingresos)}`,
              }))}
            />
          )}
        </Tarjeta>

        <Tarjeta titulo="Muebles" detalle="Ventas, vistas y conversión del periodo">
          {muebles.length === 0 ? (
            <p className="text-[13px] text-gris">Sin vistas ni pedidos en el periodo.</p>
          ) : (
            <TablaMuebles muebles={muebles} tienda={periodo.tienda} />
          )}
        </Tarjeta>
      </div>
    </div>
  );
}

function Tarjeta({ titulo, detalle, acciones, children }) {
  return (
    <section className="min-w-0 rounded-[24px] border border-linea bg-white p-4 lg:p-5">
      <header className="mb-4 flex flex-wrap items-center justify-between gap-2">
        <div>
          <h2 className="font-display text-[16px] font-semibold">{titulo}</h2>
          {detalle && <p className="text-[12.5px] text-gris">{detalle}</p>}
        </div>
        {acciones}
      </header>
      {children}
    </section>
  );
}

function Indicador({ Icono, etiqueta, valor, detalle }) {
  return (
    <div className="min-w-0 rounded-[22px] border border-linea bg-white p-4">
      <p className="flex items-center gap-1.5 text-[12px] font-semibold uppercase tracking-wider text-gris">
        <Icono className="size-[15px]" aria-hidden />
        {etiqueta}
      </p>
      <p className="mt-1.5 truncate font-display text-[22px] font-bold leading-tight lg:text-[26px]">{valor}</p>
      <p className="mt-0.5 truncate text-[12.5px] text-gris">{detalle}</p>
    </div>
  );
}

function Tiempo({ etiqueta, horas }) {
  const texto = horas == null ? 'Sin datos' : horas < 48 ? `${horas} h` : `${Math.round((horas / 24) * 10) / 10} días`;
  return (
    <div className="rounded-2xl bg-crema px-3.5 py-3">
      <dt className="flex items-center gap-1.5 text-[12px] text-gris">
        <Clock className="size-3.5" aria-hidden />
        {etiqueta}
      </dt>
      <dd className="mt-0.5 font-display text-[18px] font-bold">{texto}</dd>
    </div>
  );
}

/** Barras horizontales de una sola serie; el valor va en texto al lado (no solo en el color). */
function Barras({ filas }) {
  const maximo = Math.max(1, ...filas.map((f) => f.valor));
  return (
    <ul className="grid gap-2.5">
      {filas.map((f) => (
        <li key={f.clave} className="grid gap-1" title={`${f.nombre}: ${f.texto}`}>
          <div className="flex items-baseline justify-between gap-3 text-[13px]">
            <span className="truncate font-semibold text-tinta">{f.nombre}</span>
            <span className="shrink-0 text-gris">{f.texto}</span>
          </div>
          <div className="h-2 rounded-full bg-crema">
            <div className="h-full rounded-full bg-terracota" style={{ width: `${f.valor ? Math.max(3, (f.valor / maximo) * 100) : 0}%` }} />
          </div>
        </li>
      ))}
    </ul>
  );
}

function TablaMuebles({ muebles, tienda }) {
  return (
    <div className="-mx-4 overflow-x-auto px-4 lg:-mx-5 lg:px-5">
      <table className="w-full min-w-[560px] text-left text-[13px]">
        <thead>
          <tr className="border-b border-linea text-[11.5px] uppercase tracking-wider text-gris">
            <th scope="col" className="py-2 pr-3 font-semibold">Mueble</th>
            <th scope="col" className="px-2 py-2 text-right font-semibold">Vendidos</th>
            <th scope="col" className="px-2 py-2 text-right font-semibold">Ingresos</th>
            <th scope="col" className="px-2 py-2 text-right font-semibold">
              <Eye className="inline size-3.5" aria-hidden /> Vistas
            </th>
            <th scope="col" className="px-2 py-2 text-right font-semibold">
              <ReceiptText className="inline size-3.5" aria-hidden /> Pedidos
            </th>
            <th scope="col" className="px-2 py-2 text-right font-semibold">Conversión</th>
            <th scope="col" className="py-2 pl-2 text-right font-semibold">Calificación</th>
          </tr>
        </thead>
        <tbody>
          {muebles.map((m) => (
            <tr key={m.id} className="border-b border-linea last:border-0">
              <td className="max-w-[200px] truncate py-2.5 pr-3 font-semibold">
                {m.slug && !tienda ? (
                  <Link to={`/panel/muebles/${m.slug}`} className="hover:underline">
                    {m.nombre}
                  </Link>
                ) : (
                  m.nombre
                )}
              </td>
              <td className="px-2 py-2.5 text-right tabular-nums">{m.vendidos}</td>
              <td className="px-2 py-2.5 text-right tabular-nums">{precio(m.ingresos)}</td>
              <td className="px-2 py-2.5 text-right tabular-nums">{numero.format(m.vistas)}</td>
              <td className="px-2 py-2.5 text-right tabular-nums">{m.pedidos}</td>
              <td className="px-2 py-2.5 text-right tabular-nums">{m.conversion == null ? '—' : `${m.conversion}%`}</td>
              <td className="py-2.5 pl-2 text-right tabular-nums">{m.calificacion == null ? '—' : `${m.calificacion} (${m.resenas})`}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
