import { ChevronRight, Truck } from 'lucide-react';
import { motion } from 'motion/react';
import { useState } from 'react';
import { Link } from 'react-router';
import Boton from '../../common/components/Boton';
import EstadoVacio from '../../common/components/EstadoVacio';
import ImagenMueble from '../../common/components/ImagenMueble';
import Pagina from '../../common/components/Pagina';
import { useConsulta } from '../../common/hooks/useConsulta';
import { precio } from '../../common/utils/formato';
import Encabezado from '../../layout/Encabezado';
import ChipEstado from '../../pedidos/components/ChipEstado';
import { PAGOS } from '../../pedidos/estados';
import { entregasApi } from '../api/entregasApi';

const PASO = 20;
const FILTROS = [
  { id: true, texto: 'Por entregar' },
  { id: false, texto: 'Hechas' },
];

/** Inicio del transportista: lo que va en camino y lo que ya cerró. */
export default function EntregasPage() {
  const [pendientes, setPendientes] = useState(true);
  const [cuantos, setCuantos] = useState(PASO);
  const { datos, error, cargando, recargar } = useConsulta((s) => entregasApi.listar({ pendientes, size: cuantos }, s), [pendientes, cuantos]);
  const entregas = datos?.contenido ?? [];

  return (
    <Pagina className="mx-auto max-w-2xl px-4 pb-32">
      <Encabezado titulo="Entregas" subtitulo="Lo que te asignaron los vendedores" />

      <div role="tablist" className="mb-4 flex gap-2">
        {FILTROS.map((f) => (
          <button
            key={String(f.id)}
            type="button"
            role="tab"
            aria-selected={pendientes === f.id}
            onClick={() => {
              setPendientes(f.id);
              setCuantos(PASO);
            }}
            className={`relative h-9 rounded-full border px-4 text-[13px] font-semibold ${pendientes === f.id ? 'border-tinta text-crema' : 'border-borde bg-white text-tinta'}`}
          >
            {pendientes === f.id && <motion.span layoutId="filtro-entregas" className="absolute inset-0 rounded-full bg-tinta" transition={{ type: 'spring', stiffness: 500, damping: 38 }} />}
            <span className="relative">{f.texto}</span>
          </button>
        ))}
      </div>

      {error && !datos ? (
        <EstadoVacio icono={Truck} titulo="No pudimos cargar tus entregas" texto={error.message}>
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
      ) : entregas.length === 0 ? (
        <EstadoVacio
          icono={Truck}
          titulo={pendientes ? 'Sin entregas por ahora' : 'Aún no cierras entregas'}
          texto={pendientes ? 'Cuando un vendedor te asigne un envío te avisamos por correo y aparece aquí.' : 'Aquí quedan las que entregues.'}
        />
      ) : (
        <>
          <ul className="grid gap-2.5">
            {entregas.map((e, i) => (
              <motion.li key={e.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0, transition: { delay: Math.min(i, 8) * 0.04 } }}>
                <Link to={`/entregas/${e.id}`} className="flex items-center gap-3.5 rounded-[22px] border border-linea bg-white p-3 transition-colors hover:bg-crema/60">
                  <ImagenMueble mueble={{ nombre: e.mueble, imagenUrl: e.imagenUrl }} sombra={false} redondeo="rounded-2xl" className="size-16 shrink-0" />
                  <div className="min-w-0 flex-1">
                    <div className="flex items-start justify-between gap-2">
                      <p className="truncate font-display text-[15.5px] font-semibold leading-tight">{e.mueble}</p>
                      <ChipEstado estado={e.estado} tipoEntrega="DOMICILIO" />
                    </div>
                    <p className="mt-0.5 truncate text-[12.5px] text-gris">
                      {e.folio}
                      {e.entrega && ` · ${e.entrega.ciudad} ${e.entrega.codigoPostal}`}
                    </p>
                    <p className="mt-1 text-[13px] font-bold">
                      {Number(e.porCobrar) > 0 ? `Cobrar ${precio(e.porCobrar)} · ${PAGOS[e.metodoPago]?.texto ?? ''}` : 'Ya pagado'}
                    </p>
                  </div>
                  <ChevronRight className="hidden size-[18px] shrink-0 text-gris-2 sm:block" aria-hidden />
                </Link>
              </motion.li>
            ))}
          </ul>
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
