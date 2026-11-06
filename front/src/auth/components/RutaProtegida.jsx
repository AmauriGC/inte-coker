import { ShieldX } from 'lucide-react';
import { Navigate, Outlet, useLocation } from 'react-router';
import Boton from '../../common/components/Boton';
import EstadoVacio from '../../common/components/EstadoVacio';
import { useSesion } from '../context/SesionContext';

/**
 * Exige sesión y, si se indican, alguno de los permisos.
 * Sin sesión manda a /entrar recordando a dónde quería ir.
 */
export default function RutaProtegida({ permisos = [], children }) {
  const { autenticado, tienePermiso } = useSesion();
  const ubicacion = useLocation();

  if (!autenticado) {
    return <Navigate to="/entrar" replace state={{ desde: ubicacion.pathname + ubicacion.search }} />;
  }
  if (permisos.length > 0 && !tienePermiso(...permisos)) {
    return (
      <EstadoVacio icono={ShieldX} titulo="No tienes acceso" texto="Tu cuenta no tiene permiso para ver esta sección." className="min-h-[60dvh] justify-center">
        <Boton a="/">Ir al inicio</Boton>
      </EstadoVacio>
    );
  }
  return children ?? <Outlet />;
}
