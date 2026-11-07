import { urlArchivo } from '../../app/config';

/** Foto de quien vende o, si no tiene, su inicial sobre terracota. */
export default function AvatarVendedor({ nombre, fotoUrl, className = 'size-12 text-[19px]' }) {
  if (fotoUrl) {
    return <img src={urlArchivo(fotoUrl)} alt="" className={`shrink-0 rounded-full bg-crema object-cover ${className}`} />;
  }
  return (
    <span className={`grid shrink-0 place-items-center rounded-full bg-terracota font-display font-bold text-white ${className}`} aria-hidden>
      {nombre?.[0]?.toUpperCase()}
    </span>
  );
}
