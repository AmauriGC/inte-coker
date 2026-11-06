import { useCallback, useState } from 'react';

/**
 * Envía un formulario y guarda los errores del back.
 * enviar(...) devuelve { ok, datos } o { ok: false, error } (nunca lanza).
 * errores = mapa campo → mensaje (Bean Validation); error = el ApiError completo.
 */
export function useEnvio(accion) {
  const [enviando, setEnviando] = useState(false);
  const [error, setError] = useState(null);

  const enviar = useCallback(
    async (...args) => {
      setEnviando(true);
      setError(null);
      try {
        return { ok: true, datos: await accion(...args) };
      } catch (e) {
        setError(e);
        return { ok: false, error: e };
      } finally {
        setEnviando(false);
      }
    },
    [accion],
  );

  return { enviar, enviando, error, errores: error?.errores ?? {}, limpiar: () => setError(null) };
}
