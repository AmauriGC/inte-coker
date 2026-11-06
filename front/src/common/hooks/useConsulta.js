import { useCallback, useEffect, useEffectEvent, useState } from 'react';

/**
 * Carga datos asíncronos y los vuelve a pedir cuando cambian las dependencias.
 * Mientras recarga conserva los datos anteriores (útil al paginar o filtrar).
 *
 * @param cargar función (signal) => Promise con los datos
 * @param deps valores que, al cambiar, disparan otra carga
 */
export function useConsulta(cargar, deps = []) {
  const [version, setVersion] = useState(0);
  const clave = JSON.stringify(deps) + '#' + version;
  const [estado, setEstado] = useState({ clave: null, datos: undefined, error: null });

  const ejecutar = useEffectEvent((signal) => cargar(signal));

  useEffect(() => {
    const control = new AbortController();
    ejecutar(control.signal).then(
      (datos) => setEstado({ clave, datos, error: null }),
      (error) => {
        if (error?.name !== 'AbortError') setEstado((previo) => ({ clave, datos: previo.datos, error }));
      },
    );
    return () => control.abort();
  }, [clave]);

  const recargar = useCallback(() => setVersion((v) => v + 1), []);
  const mutar = useCallback((fn) => setEstado((previo) => ({ ...previo, datos: fn(previo.datos) })), []);

  return {
    datos: estado.datos,
    error: estado.clave === clave ? estado.error : null,
    cargando: estado.clave !== clave,
    recargar,
    mutar,
  };
}
