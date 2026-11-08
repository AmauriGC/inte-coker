import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import Toaster from '../components/Toaster';
import { NotificacionesContext } from './NotificacionesContext';


function nuevoId() {
  return globalThis.crypto?.randomUUID?.() ?? `${Date.now()}-${Math.random().toString(16).slice(2)}`;
}

/**
 * Toasts de la app. La bandeja de avisos vive en la cuenta (AvisosProvider y la API); lo que
 * antes se guardaba en el navegador se borra al abrir.
 */
export default function NotificacionesProvider({ children }) {
  const [toasts, setToasts] = useState([]);
  const temporizadores = useRef(new Map());

  const cerrarToast = useCallback((id) => {
    clearTimeout(temporizadores.current.get(id));
    temporizadores.current.delete(id);
    setToasts((lista) => lista.filter((t) => t.id !== id));
  }, []);

  const notificar = useCallback(
    ({ titulo, texto, tipo = 'info', accion, duracion = 3800 }) => {
      const id = nuevoId();
      setToasts((lista) => [...lista.slice(-2), { id, titulo, texto, tipo, accion }]);
      temporizadores.current.set(id, setTimeout(() => cerrarToast(id), duracion));
      return id;
    },
    [cerrarToast],
  );

  useEffect(() => {
    try {
      localStorage.removeItem('gc.avisos');
    } catch {
      /* sin almacenamiento */
    }
  }, []);

  // Avisos de conexión.
  useEffect(() => {
    const sinRed = () =>
      notificar({ tipo: 'conexion', titulo: 'Sin conexión', texto: 'Puedes seguir viendo lo que ya cargaste.', guardar: false, duracion: 5000 });
    const conRed = () => notificar({ tipo: 'exito', titulo: 'Conexión recuperada', guardar: false });
    window.addEventListener('offline', sinRed);
    window.addEventListener('online', conRed);
    return () => {
      window.removeEventListener('offline', sinRed);
      window.removeEventListener('online', conRed);
    };
  }, [notificar]);

  useEffect(() => {
    const mapa = temporizadores.current;
    return () => mapa.forEach(clearTimeout);
  }, []);

  const valor = useMemo(() => ({ notificar }), [notificar]);

  return (
    <NotificacionesContext value={valor}>
      {children}
      <Toaster toasts={toasts} alCerrar={cerrarToast} />
    </NotificacionesContext>
  );
}
