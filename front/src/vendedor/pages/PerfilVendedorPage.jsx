import { ArrowLeft, Images, MapPin, Package, PenLine, Share2, Star } from 'lucide-react';
import { motion } from 'motion/react';
import { useState } from 'react';
import { useNavigate, useParams, useSearchParams } from 'react-router';
import { urlArchivo } from '../../app/config';
import { TarjetaEsqueleto } from '../../catalogo/components/TarjetaMueble';
import TarjetaMueble from '../../catalogo/components/TarjetaMueble';
import Boton from '../../common/components/Boton';
import EstadoVacio from '../../common/components/EstadoVacio';
import Hoja from '../../common/components/Hoja';
import Pagina from '../../common/components/Pagina';
import { useConsulta } from '../../common/hooks/useConsulta';
import { useNotificaciones } from '../../notificaciones/context/NotificacionesContext';
import { perfilApi } from '../api/perfilApi';
import AvatarVendedor from '../components/AvatarVendedor';

const PASO = 12;

/** Perfil público de quien vende: portada, datos, cifras y pestañas de muebles y trabajos. */
export default function PerfilVendedorPage() {
  const { slug } = useParams();
  const navegar = useNavigate();
  const [parametros, setParametros] = useSearchParams();
  const { notificar } = useNotificaciones();
  const pestana = parametros.get('ver') === 'trabajos' ? 'trabajos' : 'muebles';
  const [cuantos, setCuantos] = useState(PASO);
  const [abierto, setAbierto] = useState(null);

  const perfilC = useConsulta((s) => perfilApi.perfil(slug, s), [slug]);
  const mueblesC = useConsulta((s) => perfilApi.muebles(slug, { size: cuantos }, s), [slug, cuantos]);
  const trabajosC = useConsulta((s) => perfilApi.trabajos(slug, s), [slug]);
  const v = perfilC.datos;
  const muebles = mueblesC.datos?.contenido ?? [];
  const trabajos = trabajosC.datos ?? [];

  async function compartir() {
    const url = window.location.href;
    try {
      if (navigator.share) await navigator.share({ title: v?.nombre, url });
      else {
        await navigator.clipboard.writeText(url);
        notificar({ tipo: 'exito', titulo: 'Enlace copiado', guardar: false });
      }
    } catch {
      /* compartir cancelado */
    }
  }

  if (perfilC.error) {
    return (
      <Pagina className="mx-auto grid min-h-[70dvh] max-w-md place-items-center px-4">
        <EstadoVacio titulo="Este vendedor no está" texto={perfilC.error.message}>
          <Boton a="/catalogo">Ir al catálogo</Boton>
        </EstadoVacio>
      </Pagina>
    );
  }

  const cifras = v && [
    { valor: v.totalResenas > 0 ? Number(v.calificacion).toFixed(1) : '—', texto: v.totalResenas > 0 ? `${v.totalResenas} reseñas` : 'Sin reseñas', estrella: v.totalResenas > 0 },
    { valor: v.ventas, texto: v.ventas === 1 ? 'venta' : 'ventas' },
    { valor: v.mueblesPublicados, texto: v.mueblesPublicados === 1 ? 'mueble' : 'muebles' },
  ];

  return (
    <Pagina className="mx-auto max-w-5xl pb-6">
      <div className="relative">
        <div className="h-44 overflow-hidden bg-gradient-to-br from-[#E9DCCB] via-crema to-[#D9B8A3] md:mx-4 md:mt-4 md:h-60 md:rounded-[28px]">
          {v?.portadaUrl && <img src={urlArchivo(v.portadaUrl)} alt="" className="size-full object-cover" />}
        </div>
        <div className="absolute inset-x-0 top-0 flex justify-between px-4 pt-[calc(env(safe-area-inset-top)+12px)] md:px-7 md:pt-7">
          <button type="button" onClick={() => navegar(-1)} aria-label="Volver" className="grid size-11 place-items-center rounded-full bg-white/90 shadow-sm backdrop-blur">
            <ArrowLeft className="size-5" />
          </button>
          <button type="button" onClick={compartir} aria-label="Compartir perfil" className="grid size-11 place-items-center rounded-full bg-white/90 shadow-sm backdrop-blur">
            <Share2 className="size-[18px]" />
          </button>
        </div>
      </div>

      <div className="px-4 md:px-8">
        <div className="relative z-10 -mt-12 flex items-end justify-between gap-3">
          {v ? (
            <AvatarVendedor nombre={v.nombre} fotoUrl={v.fotoUrl} className="size-24 text-[36px] ring-4 ring-crema" />
          ) : (
            <span className="esqueleto size-24 rounded-full ring-4 ring-crema" />
          )}
          {v?.propio && (
            <Boton variante="secundario" icono={PenLine} a="/panel/perfil" className="mb-1">
              Editar perfil
            </Boton>
          )}
        </div>

        {!v ? (
          <div className="mt-4 grid gap-2">
            <div className="esqueleto h-7 w-48 rounded-lg" />
            <div className="esqueleto h-4 w-32 rounded-lg" />
          </div>
        ) : (
          <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}>
            <h1 className="mt-3 font-display text-[26px] font-bold leading-tight tracking-[-0.02em]">{v.nombre}</h1>
            <p className="mt-1 flex flex-wrap items-center gap-x-3 gap-y-1 text-[13.5px] text-gris">
              {v.ciudad && (
                <span className="inline-flex items-center gap-1">
                  <MapPin className="size-3.5" aria-hidden /> {v.ciudad}
                </span>
              )}
              <span>Vende desde {v.vendeDesde}</span>
            </p>
            {v.bio && <p className="mt-3 max-w-2xl whitespace-pre-line text-[14.5px] leading-relaxed text-texto">{v.bio}</p>}

            <dl className="mt-4 grid grid-cols-3 gap-2 md:max-w-md">
              {cifras.map((c) => (
                <div key={c.texto} className="rounded-[18px] border border-linea bg-white px-3 py-2.5 text-center">
                  <dt className="sr-only">{c.texto}</dt>
                  <dd className="inline-flex items-center gap-1 font-display text-[19px] font-bold">
                    {c.estrella && <Star className="size-4 text-terracota" fill="currentColor" strokeWidth={0} aria-hidden />}
                    {c.valor}
                  </dd>
                  <dd className="text-[12px] text-gris">{c.texto}</dd>
                </div>
              ))}
            </dl>
          </motion.div>
        )}

        <div role="tablist" aria-label="Contenido del vendedor" className="mt-6 flex gap-1 rounded-full border border-linea bg-white p-1 md:max-w-sm">
          {[
            { id: 'muebles', texto: 'Muebles', Icono: Package, n: v?.mueblesPublicados },
            { id: 'trabajos', texto: 'Trabajos', Icono: Images, n: v?.trabajos },
          ].map((t) => (
            <button
              key={t.id}
              type="button"
              role="tab"
              aria-selected={pestana === t.id}
              onClick={() => setParametros(t.id === 'trabajos' ? { ver: 'trabajos' } : {}, { replace: true })}
              className={`relative flex h-10 flex-1 items-center justify-center gap-1.5 rounded-full text-[13.5px] font-semibold transition-colors ${
                pestana === t.id ? 'text-crema' : 'text-texto hover:bg-crema'
              }`}
            >
              {pestana === t.id && <motion.span layoutId="pestana-vendedor" className="absolute inset-0 rounded-full bg-tinta" />}
              <t.Icono className="relative size-4" aria-hidden />
              <span className="relative">
                {t.texto}
                {t.n > 0 && <span className="ml-1 opacity-70">{t.n}</span>}
              </span>
            </button>
          ))}
        </div>

        <div role="tabpanel" className="mt-5">
          {pestana === 'muebles' ? (
            !mueblesC.datos ? (
              <div className="grid grid-cols-2 gap-x-3 gap-y-5 md:grid-cols-3">
                {[0, 1, 2, 3].map((i) => (
                  <TarjetaEsqueleto key={i} />
                ))}
              </div>
            ) : muebles.length === 0 ? (
              <EstadoVacio icono={Package} titulo="Aún no publica muebles" texto="Vuelve pronto para ver sus piezas en 3D." />
            ) : (
              <>
                <div className="grid grid-cols-2 gap-x-3 gap-y-5 md:grid-cols-3">
                  {muebles.map((m, i) => (
                    <TarjetaMueble key={m.id} mueble={m} indice={i} />
                  ))}
                </div>
                {!mueblesC.datos.ultima && (
                  <Boton variante="secundario" bloque cargando={mueblesC.cargando} onClick={() => setCuantos((n) => n + PASO)} className="mt-5">
                    Ver más muebles
                  </Boton>
                )}
              </>
            )
          ) : !trabajosC.datos ? (
            <div className="grid grid-cols-2 gap-3 md:grid-cols-3">
              {[0, 1, 2, 3].map((i) => (
                <div key={i} className="esqueleto aspect-square rounded-[22px]" />
              ))}
            </div>
          ) : trabajos.length === 0 ? (
            <EstadoVacio icono={Images} titulo="Sin trabajos todavía" texto="Aquí aparecerán fotos de muebles que ya entregó." />
          ) : (
            <div className="grid grid-cols-2 gap-3 md:grid-cols-3">
              {trabajos.map((t, i) => (
                <motion.button
                  key={t.id}
                  type="button"
                  onClick={() => setAbierto(t)}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: Math.min(i, 8) * 0.04 }}
                  className="group text-left"
                >
                  <span className="block aspect-square overflow-hidden rounded-[22px] bg-white">
                    <img src={urlArchivo(t.imagenUrl)} alt={t.titulo} loading="lazy" className="size-full object-cover transition-transform duration-300 group-hover:scale-[1.03]" />
                  </span>
                  <span className="mt-1.5 block truncate px-1 text-[13.5px] font-semibold">{t.titulo}</span>
                </motion.button>
              ))}
            </div>
          )}
        </div>
      </div>

      <Hoja abierta={Boolean(abierto)} alCerrar={() => setAbierto(null)} titulo={abierto?.titulo}>
        {abierto && (
          <div className="grid gap-3">
            <img src={urlArchivo(abierto.imagenUrl)} alt={abierto.titulo} className="max-h-[60dvh] w-full rounded-[22px] bg-white object-contain" />
            {abierto.descripcion && <p className="whitespace-pre-line text-[14.5px] leading-relaxed text-texto">{abierto.descripcion}</p>}
          </div>
        )}
      </Hoja>
    </Pagina>
  );
}
