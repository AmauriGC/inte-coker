import { createContext, useContext } from 'react';

export const SesionContext = createContext(null);

/** { usuario, autenticado, entrar, salir, tienePermiso, tieneRol, refrescarUsuario } */
export function useSesion() {
  const contexto = useContext(SesionContext);
  if (!contexto) throw new Error('useSesion debe usarse dentro de SesionProvider');
  return contexto;
}
