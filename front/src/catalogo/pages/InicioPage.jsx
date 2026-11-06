import { ArrowRight, Bell, Rotate3d, ScanLine, Sparkles } from 'lucide-react';
import { motion } from 'motion/react';
import { Link, useNavigate } from 'react-router';
import { useSesion } from '../../auth/context/SesionContext';
import Boton from '../../common/components/Boton';
import EstadoVacio from '../../common/components/EstadoVacio';
import ImagenMueble from '../../common/components/ImagenMueble';
import Logo from '../../common/components/Logo';
import Pagina from '../../common/components/Pagina';
import { useConsulta } from '../../common/hooks/useConsulta';
import { estiloCategoria } from '../../common/utils/categorias';
import { precio, primerNombre } from '../../common/utils/formato';
import { useNotificaciones } from '../../notificaciones/context/NotificacionesContext';
import { catalogoApi } from '../api/catalogoApi';
import ChipsCategorias from '../components/ChipsCategorias';
import TarjetaMueble, { TarjetaEsqueleto } from '../components/TarjetaMueble';

const PASOS = [
  { Icono: Rotate3d, titulo: 'Gíralo en 3D', texto: 'Mira cada ángulo y sus medidas reales.' },
  { Icono: ScanLine, titulo: 'Ponlo en tu sala', texto: 'Con AR lo ves a escala en tu espacio.' },
  { Icono: Sparkles, titulo: 'Decide tranquilo', texto: 'Guarda tus favoritos para después.' },
];

function Portada({ mueble }) {
  const { tinte } = estiloCategoria(mueble.categoria?.slug);
  return (
    <motion.section
      initial={{ opacity: 0, scale: 0.97 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.45, ease: [0.2, 0.8, 0.2, 1] }}
      className="relative overflow-hidden rounded-[30px] p-5 md:grid md:grid-cols-2 md:items-center md:p-8"
      style={{ backgroundColor: tinte }}
    >
      <div className="relative z-10">
        <span className="inline-flex items-center gap-1.5 rounded-full bg-white/80 px-3 py-1 text-[12px] font-bold text-terracota">
          <span className="size-1.5 rounded-full bg-terracota" /> Nuevo · {mueble.nombre}
        </span>
        <h2 className="mt-3 max-w-[15ch] font-display text-[30px] font-bold leading-[1.05] tracking-[-0.03em] md:text-[42px]">
          Míralo en tu sala antes de comprarlo
        </h2>
        <p className="mt-2 text-[14px] text-texto">Desde {precio(mueble.precio)}</p>
      </div>
      <Link to={`/mueble/${mueble.slug}`} className="relative -mx-2 my-2 block h-52 md:h-72" aria-label={`Ver ${mueble.nombre}`}>
        <div aria-hidden className="absolute inset-x-[18%] bottom-3 h-5 animate-sombra rounded-[50%] bg-black/30 blur-md" />
        <ImagenMueble mueble={mueble} sombra={false} redondeo="" prioridad className="size-full animate-flotar bg-transparent!" />
      </Link>
      <div className="relative z-10 flex gap-2 md:col-start-1">
        <Boton a={`/mueble/${mueble.slug}`} icono={Rotate3d} className="flex-1 md:flex-none">
          Ver en 3D
        </Boton>
        <Boton a={`/mueble/${mueble.slug}`} variante="acento" icono={ScanLine} className="flex-1 md:flex-none">
          Probar en AR
        </Boton>
      </div>
    </motion.section>
  );
}

export default function InicioPage() {
  const { usuario } = useSesion();
  const { sinLeer } = useNotificaciones();
  const navegar = useNavigate();
  const categorias = useConsulta((s) => catalogoApi.categorias(s));
  const destacados = useConsulta((s) => catalogoApi.muebles({ size: 6, sort: 'creadoEn,desc' }, s));
  const lista = destacados.datos?.contenido ?? [];

  return (
    <Pagina className="mx-auto max-w-5xl px-4">
      <header className="flex items-center gap-3 pb-5 pt-[calc(env(safe-area-inset-top)+18px)]">
        <span className="grid size-11 place-items-center rounded-2xl bg-tinta text-crema">
          <Logo className="size-6" />
        </span>
        <div className="min-w-0 flex-1">
          <p className="text-[13px] text-gris">{usuario ? `Hola, ${primerNombre(usuario.nombre)}` : 'Bienvenido'}</p>
          <p className="font-display text-[19px] font-bold leading-tight">GC-Confort</p>
        </div>
        <Link to="/avisos" className="relative grid size-11 place-items-center rounded-full border border-borde bg-white" aria-label="Avisos">
          <Bell className="size-5" />
          {sinLeer > 0 && <span className="absolute right-2.5 top-2.5 size-2.5 rounded-full bg-terracota ring-2 ring-white" />}
        </Link>
      </header>

      {destacados.cargando && !destacados.datos ? (
        <div className="esqueleto h-[420px] rounded-[30px] md:h-80" />
      ) : lista[0] ? (
        <Portada mueble={lista[0]} />
      ) : null}

      <section className="mt-6">
        <ChipsCategorias
          categorias={categorias.datos?.contenido}
          activa=""
          idLayout="chip-inicio"
          alElegir={(id) => navegar(id ? `/catalogo?categoria=${id}` : '/catalogo')}
        />
      </section>

      <section className="mt-7">
        <div className="mb-3 flex items-end justify-between">
          <h2 className="font-display text-xl font-semibold tracking-[-0.02em]">Destacados</h2>
          <Link to="/catalogo" className="inline-flex items-center gap-1 text-[13.5px] font-semibold text-terracota">
            Ver todo <ArrowRight className="size-4" />
          </Link>
        </div>
        {destacados.error ? (
          <EstadoVacio titulo="No pudimos cargar el catálogo" texto={destacados.error.message}>
            <Boton variante="secundario" onClick={destacados.recargar}>
              Reintentar
            </Boton>
          </EstadoVacio>
        ) : (
          <div className="grid grid-cols-2 gap-x-3 gap-y-5 md:grid-cols-3">
            {destacados.cargando && !destacados.datos
              ? [0, 1, 2, 3].map((i) => <TarjetaEsqueleto key={i} />)
              : lista.slice(1).concat(lista.slice(0, 1)).slice(0, 6).map((m, i) => <TarjetaMueble key={m.id} mueble={m} indice={i} />)}
          </div>
        )}
      </section>

      <section className="mt-9 grid gap-3 md:grid-cols-3">
        {PASOS.map(({ Icono, titulo, texto }, i) => (
          <motion.div
            key={titulo}
            initial={{ opacity: 0, y: 14 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: i * 0.08 }}
            className="flex items-center gap-3.5 rounded-3xl border border-linea bg-white p-4"
          >
            <span className="grid size-11 shrink-0 place-items-center rounded-2xl bg-crema text-terracota">
              <Icono className="size-5" aria-hidden />
            </span>
            <div>
              <p className="font-display text-[15px] font-semibold">{titulo}</p>
              <p className="text-[13px] text-gris">{texto}</p>
            </div>
          </motion.div>
        ))}
      </section>
    </Pagina>
  );
}
