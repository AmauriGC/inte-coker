import { useSyncExternalStore } from 'react';
import { leerEstado, suscribir } from './estadoPwa';

/** { actualizacion, instalable, instalada } */
export function usePwa() {
  return useSyncExternalStore(suscribir, leerEstado, leerEstado);
}
