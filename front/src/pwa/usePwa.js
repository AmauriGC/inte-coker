import { useSyncExternalStore } from 'react';
import { leerEstado, suscribir } from './estadoPwa';

/** { actualizacion, instalable, instalada, ios, hojaInstalar } */
export function usePwa() {
  return useSyncExternalStore(suscribir, leerEstado, leerEstado);
}
