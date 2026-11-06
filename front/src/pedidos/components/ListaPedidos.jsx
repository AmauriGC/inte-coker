import { ChevronRight } from 'lucide-react';
import { motion } from 'motion/react';
import { Link } from 'react-router';
import ImagenMueble from '../../common/components/ImagenMueble';
import { haceCuanto, precio } from '../../common/utils/formato';
import ChipEstado from './ChipEstado';

/**
 * Lista de pedidos como tarjetas. base: "/pedidos" o "/panel/pedidos".
 * Muestra a la otra persona según el lado (vendedor para el cliente, cliente para el vendedor).
 */
export default function ListaPedidos({ pedidos, base }) {
  return (
    <ul className="grid gap-2.5">
      {pedidos.map((p, i) => {
        const otro = p.lado === 'CLIENTE' ? p.vendedor.nombre : p.lado === 'VENDEDOR' ? p.cliente.nombre : `${p.cliente.nombre} → ${p.vendedor.nombre}`;
        return (
          <motion.li key={p.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0, transition: { delay: Math.min(i, 8) * 0.04 } }}>
            <Link
              to={`${base}/${p.id}`}
              className={`flex items-center gap-3.5 rounded-[22px] border bg-white p-3 transition-colors hover:bg-crema/60 ${p.sinLeer > 0 ? 'border-terracota/40' : 'border-linea'}`}
            >
              <div className="relative shrink-0">
                <ImagenMueble mueble={p.mueble} sombra={false} redondeo="rounded-2xl" className="size-16" />
                {p.sinLeer > 0 && (
                  <span className="absolute -right-1.5 -top-1.5 grid h-5 min-w-5 place-items-center rounded-full bg-terracota px-1 text-[11px] font-bold text-white ring-2 ring-white">
                    {p.sinLeer > 9 ? '9+' : p.sinLeer}
                    <span className="sr-only"> mensajes sin leer</span>
                  </span>
                )}
              </div>
              <div className="min-w-0 flex-1">
                <div className="flex items-start justify-between gap-2">
                  <p className="truncate font-display text-[15.5px] font-semibold leading-tight">{p.mueble.nombre}</p>
                  <ChipEstado estado={p.estado} tipoEntrega={p.tipoEntrega} />
                </div>
                <p className="mt-0.5 truncate text-[12.5px] text-gris">
                  {p.folio} · {otro}
                </p>
                <p className="mt-1 flex items-center justify-between gap-2 text-[13px]">
                  <span className="font-bold">
                    {p.estado === 'CONSULTA' ? 'Consulta' : `${p.cantidad} × ${precio(p.precioUnitario)} = ${precio(p.total)}`}
                  </span>
                  <span className="shrink-0 text-[12px] text-gris">{haceCuanto(p.actividadEn)}</span>
                </p>
              </div>
              <ChevronRight className="hidden size-[18px] shrink-0 text-gris-2 sm:block" aria-hidden />
            </Link>
          </motion.li>
        );
      })}
    </ul>
  );
}
