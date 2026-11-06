import { useState } from 'react';
import { urlArchivo } from '../../app/config';
import { estiloCategoria } from '../utils/categorias';

/** La foto con su propio estado de carga; se monta de nuevo cuando cambia la URL (key). */
function Foto({ src, alt, prioridad, Icono }) {
  const [estado, setEstado] = useState('cargando');
  if (estado === 'fallo') return <Respaldo Icono={Icono} />;
  return (
    <>
      <img
        src={src}
        alt={alt}
        loading={prioridad ? 'eager' : 'lazy'}
        decoding="async"
        onLoad={() => setEstado('lista')}
        onError={() => setEstado('fallo')}
        className={`absolute inset-0 size-full object-contain p-[9%] transition duration-500 ${
          estado === 'lista' ? 'scale-100 opacity-100' : 'scale-95 opacity-0'
        }`}
      />
      {estado === 'cargando' && <div className="esqueleto absolute inset-0 opacity-40" aria-hidden />}
    </>
  );
}

function Respaldo({ Icono }) {
  return (
    <div className="absolute inset-0 grid place-items-center text-tinta/25">
      <Icono className="size-1/3" strokeWidth={1.2} aria-hidden />
    </div>
  );
}

/**
 * Foto del mueble sobre el color de su categoría, con sombra elíptica difuminada
 * (la imagen va en object-contain para no recortar el mueble).
 */
export default function ImagenMueble({ mueble, className = '', redondeo = 'rounded-[22px]', sombra = true, prioridad = false }) {
  const { tinte, Icono } = estiloCategoria(mueble?.categoria?.slug);
  const src = urlArchivo(mueble?.imagenUrl);

  return (
    <div className={`relative isolate overflow-hidden ${redondeo} ${className}`} style={{ backgroundColor: tinte }}>
      {sombra && (
        <div
          aria-hidden
          className="absolute bottom-[12%] left-1/2 -z-10 h-[9%] w-[62%] -translate-x-1/2 rounded-[50%] bg-black/25 blur-md"
        />
      )}
      {src ? <Foto key={src} src={src} alt={mueble.nombre} prioridad={prioridad} Icono={Icono} /> : <Respaldo Icono={Icono} />}
    </div>
  );
}
