import { createContext, useContext } from 'react';

export const SesionContext = createContext(null);

/**
 * { usuario, autenticado, entrar, salir, refrescarUsuario,
 *   roles, multiRol, rolActivo, cambiarRol(rol),
 *   tienePermiso (del rol activo), cuentaTienePermiso (de toda la cuenta), rolCon(...permisos), tieneRol }
 */
export function useSesion() {
  const contexto = useContext(SesionContext);
  if (!contexto) throw new Error('useSesion debe usarse dentro de SesionProvider');
  return contexto;
}
