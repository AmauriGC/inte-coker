import { Rotate3d } from 'lucide-react';
import { motion } from 'motion/react';
import { Link } from 'react-router';
import ImagenMueble from '../../common/components/ImagenMueble';
import { medidas, precio } from '../../common/utils/formato';
import BotonFavorito from './BotonFavorito';

/** Tarjeta de la cuadrícula: imagen sobre el tinte de la categoría, insignia 3D · AR y favorito. */
export default function TarjetaMueble({ mueble, indice = 0 }) {
  return (
    <motion.article
      layout
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0, transition: { delay: Math.min(indice, 8) * 0.045, duration: 0.35 } }}
      exit={{ opacity: 0, scale: 0.96 }}
      whileTap={{ scale: 0.98 }}
      className="group"
    >
      <Link to={`/mueble/${mueble.slug}`} className="block">
        <div className="relative">
          <ImagenMueble mueble={mueble} className="aspect-square transition-transform duration-300 group-hover:scale-[1.015]" />
          {mueble.modeloUrl && (
            <span className="absolute left-2.5 top-2.5 inline-flex items-center gap-1 rounded-full bg-white/90 px-2.5 py-1 text-[11px] font-bold tracking-wide text-tinta backdrop-blur">
              <Rotate3d className="size-3.5" aria-hidden /> 3D · AR
            </span>
          )}
          {mueble.existencias === 0 && (
            <span className="absolute bottom-2.5 left-2.5 rounded-full bg-tinta/85 px-2.5 py-1 text-[11px] font-bold text-crema backdrop-blur">Agotado</span>
          )}
          <BotonFavorito mueble={mueble} className="absolute right-2 top-2 size-9" />
        </div>
        <div className="px-1 pt-2.5">
          <h3 className="truncate font-display text-[15.5px] font-semibold leading-tight">{mueble.nombre}</h3>
          <p className="mt-0.5 truncate text-[12.5px] text-gris">
            {mueble.categoria?.nombre} · {medidas(mueble)}
          </p>
          <p className="mt-1 text-[15px] font-bold">{precio(mueble.precio)}</p>
        </div>
      </Link>
    </motion.article>
  );
}

export function TarjetaEsqueleto() {
  return (
    <div aria-hidden>
      <div className="esqueleto aspect-square rounded-[22px]" />
      <div className="esqueleto mt-3 h-4 w-3/4 rounded-full" />
      <div className="esqueleto mt-2 h-3 w-1/2 rounded-full" />
      <div className="esqueleto mt-2 h-4 w-1/3 rounded-full" />
    </div>
  );
}
