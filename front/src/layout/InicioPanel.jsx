import { Navigate } from 'react-router';
import { useNavegacion } from './useNavegacion';

/** /panel lleva a la primera sección del rol activo (Mis muebles al vendedor, Métricas al administrador). */
export default function InicioPanel() {
  const { secciones } = useNavegacion();
  return <Navigate to={secciones[0]?.a ?? '/'} replace />;
}
