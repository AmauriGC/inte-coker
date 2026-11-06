import { useEffect, useState } from 'react';

function leer(clave, inicial) {
  try {
    const crudo = localStorage.getItem(clave);
    return crudo === null ? inicial : JSON.parse(crudo);
  } catch {
    return inicial;
  }
}

/** useState que persiste en localStorage. Si el almacenamiento falla, sigue funcionando en memoria. */
export function useAlmacen(clave, inicial) {
  const [valor, setValor] = useState(() => leer(clave, inicial));
  useEffect(() => {
    try {
      localStorage.setItem(clave, JSON.stringify(valor));
    } catch {
      /* sin almacenamiento disponible */
    }
  }, [clave, valor]);
  return [valor, setValor];
}
