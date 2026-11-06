import { Repeat, ShieldX } from 'lucide-react';
import { Navigate, Outlet, useLocation } from 'react-router';
import Boton from '../../common/components/Boton';
import EstadoVacio from '../../common/components/EstadoVacio';
import { useSesion } from '../context/SesionContext';
import { datosRol } from '../roles';

/**
 * Exige sesión y, si se indican, alguno de los permisos del rol activo.
 * Sin sesión manda a /entrar recordando a dónde quería ir. Si la sección es de otro rol
 * de la misma cuenta, ofrece cambiar a ese rol.
 */
export default function RutaProtegida({ permisos = [], children }) {
  const { autenticado, tienePermiso, rolCon, cambiarRol } = useSesion();
  const ubicacion = useLocation();

  if (!autenticado) {
    return <Navigate to="/entrar" replace state={{ desde: ubicacion.pathname + ubicacion.search }} />;
  }
  if (permisos.length > 0 && !tienePermiso(...permisos)) {
    const otroRol = rolCon(...permisos);
    if (otroRol) {
      const { nombre } = datosRol(otroRol);
      return (
        <EstadoVacio icono={Repeat} titulo={`Esta sección es de tu rol ${nombre}`} texto="Cambia de rol para verla; puedes volver cuando quieras." className="min-h-[60dvh] justify-center">
          <Boton icono={Repeat} onClick={() => cambiarRol(otroRol)}>
            Entrar como {nombre.toLowerCase()}
          </Boton>
        </EstadoVacio>
      );
    }
    return (
      <EstadoVacio icono={ShieldX} titulo="No tienes acceso" texto="Tu cuenta no tiene permiso para ver esta sección." className="min-h-[60dvh] justify-center">
        <Boton a="/">Ir al inicio</Boton>
      </EstadoVacio>
    );
  }
  return children ?? <Outlet />;
}
