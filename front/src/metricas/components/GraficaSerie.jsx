import { useState } from 'react';
import { precio } from '../../common/utils/formato';

const diaCorto = new Intl.DateTimeFormat('es-MX', { day: 'numeric', month: 'short', timeZone: 'UTC' });

/** "2026-11-02" -> fecha en UTC para que el día no se recorra por la zona del navegador. */
function fecha(iso) {
  return new Date(`${iso}T00:00:00Z`);
}

function etiqueta(punto, agrupacion) {
  return agrupacion === 'SEMANA' ? `Semana del ${diaCorto.format(fecha(punto.inicio))}` : diaCorto.format(fecha(punto.inicio));
}

/**
 * Ingresos por día o por semana: una sola serie en barras (terracota), con tooltip al pasar
 * o tocar cada columna y una tabla equivalente para lectores de pantalla.
 */
export default function GraficaSerie({ serie, agrupacion }) {
  const [activo, setActivo] = useState(null);
  const maximo = Math.max(0, ...serie.map((p) => Number(p.ingresos)));
  const vacia = maximo === 0;
  const punto = activo === null ? null : serie[activo];
  const marcas = [0, Math.floor((serie.length - 1) / 2), serie.length - 1].filter((v, i, a) => a.indexOf(v) === i);

  return (
    <figure className="m-0">
      <div className="relative">
        <div className="pointer-events-none absolute inset-x-0 top-0 flex items-start justify-between text-[11px] text-gris">
          <span>{vacia ? '' : precio(maximo)}</span>
        </div>
        <div
          className="relative mt-5 flex h-40 items-end gap-[2px] border-b border-linea"
          onMouseLeave={() => setActivo(null)}
          role="img"
          aria-label="Ingresos por periodo; los datos están en la tabla siguiente"
        >
          <div className="pointer-events-none absolute inset-x-0 top-0 border-t border-dashed border-linea" aria-hidden />
          <div className="pointer-events-none absolute inset-x-0 top-1/2 border-t border-dashed border-linea" aria-hidden />
          {serie.map((p, i) => {
            const alto = vacia ? 0 : (Number(p.ingresos) / maximo) * 100;
            return (
              <button
                key={p.inicio}
                type="button"
                tabIndex={-1}
                aria-hidden
                onMouseEnter={() => setActivo(i)}
                onFocus={() => setActivo(i)}
                onClick={() => setActivo(i)}
                className="relative flex h-full min-w-0 flex-1 items-end"
              >
                <span
                  className={`block w-full rounded-t-[4px] transition-opacity ${activo !== null && activo !== i ? 'opacity-45' : ''} ${alto > 0 ? 'bg-terracota' : ''}`}
                  style={{ height: alto > 0 ? `max(${alto}%, 3px)` : 0 }}
                />
              </button>
            );
          })}
          {vacia && <p className="absolute inset-0 grid place-items-center text-[13px] text-gris">Sin ventas entregadas en el periodo</p>}
          {punto && (
            <div
              className="pointer-events-none absolute -top-2 z-10 -translate-x-1/2 -translate-y-full whitespace-nowrap rounded-xl bg-tinta px-3 py-2 text-[12px] text-crema shadow-lg"
              style={{ left: `${Math.min(85, Math.max(15, ((activo + 0.5) / serie.length) * 100))}%` }}
            >
              <p className="font-semibold">{etiqueta(punto, agrupacion)}</p>
              <p>
                {precio(punto.ingresos)} · {punto.ventas} {punto.ventas === 1 ? 'venta' : 'ventas'}
              </p>
            </div>
          )}
        </div>
        <div className="relative mt-1.5 h-4 text-[11px] text-gris">
          {marcas.map((i) => (
            <span
              key={i}
              className={`absolute ${i === 0 ? 'left-0' : i === serie.length - 1 ? 'right-0' : '-translate-x-1/2'}`}
              style={i !== 0 && i !== serie.length - 1 ? { left: `${((i + 0.5) / serie.length) * 100}%` } : undefined}
            >
              {diaCorto.format(fecha(serie[i].inicio))}
            </span>
          ))}
        </div>
      </div>
      <table className="sr-only">
        <caption>Ingresos y ventas por {agrupacion === 'SEMANA' ? 'semana' : 'día'}</caption>
        <thead>
          <tr>
            <th scope="col">Periodo</th>
            <th scope="col">Ventas</th>
            <th scope="col">Ingresos</th>
          </tr>
        </thead>
        <tbody>
          {serie.map((p) => (
            <tr key={p.inicio}>
              <td>{etiqueta(p, agrupacion)}</td>
              <td>{p.ventas}</td>
              <td>{precio(p.ingresos)}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </figure>
  );
}
