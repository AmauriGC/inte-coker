import { createContext, useContext } from 'react';

export const AvisosContext = createContext(null);

/** { sinLeer, refrescar }: cuántos avisos de la cuenta faltan por leer (0 sin sesión). */
export function useAvisos() {
  const contexto = useContext(AvisosContext);
  if (!contexto) throw new Error('useAvisos debe usarse dentro de AvisosProvider');
  return contexto;
}
