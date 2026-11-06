import { useEffect, useState } from 'react';

/** Devuelve el valor cuando deja de cambiar durante "ms" (para búsquedas mientras se escribe). */
export function useRetraso(valor, ms = 350) {
  const [retrasado, setRetrasado] = useState(valor);
  useEffect(() => {
    const id = setTimeout(() => setRetrasado(valor), ms);
    return () => clearTimeout(id);
  }, [valor, ms]);
  return retrasado;
}
