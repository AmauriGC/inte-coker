import { LoaderCircle } from 'lucide-react';
import { Link } from 'react-router';

const VARIANTES = {
  primario: 'gc-boton-primario',
  acento: 'gc-boton-acento',
  secundario: 'gc-boton-secundario',
  fantasma: 'gc-boton-fantasma',
  peligro: 'gc-boton-peligro',
};

/**
 * Botón de la app. Con "a" se vuelve un Link de react-router.
 * "cargando" lo deshabilita y muestra un spinner en lugar del icono.
 */
export default function Boton({
  variante = 'primario',
  chico = false,
  bloque = false,
  icono: Icono,
  cargando = false,
  a,
  className = '',
  children,
  ...resto
}) {
  const clases = [
    'gc-boton',
    VARIANTES[variante],
    chico && 'gc-boton-chico',
    bloque && 'w-full',
    className,
  ]
    .filter(Boolean)
    .join(' ');

  const contenido = (
    <>
      {cargando ? (
        <LoaderCircle className="size-[18px] animate-spin" aria-hidden />
      ) : (
        Icono && <Icono className="size-[18px]" aria-hidden strokeWidth={2.2} />
      )}
      {children}
    </>
  );

  if (a) {
    return (
      <Link to={a} className={clases} {...resto}>
        {contenido}
      </Link>
    );
  }
  return (
    <button type="button" className={clases} disabled={cargando || resto.disabled} {...resto}>
      {contenido}
    </button>
  );
}
