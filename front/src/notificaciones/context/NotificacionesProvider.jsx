import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useAlmacen } from '../../common/hooks/useAlmacen';
import Toaster from '../components/Toaster';
import { NotificacionesContext } from './NotificacionesContext';

const MAXIMO = 30;
const BIENVENIDA = [
  {
    id: 'bienvenida',
    tipo: 'novedad',
    titulo: 'Bienvenido a GC-Confort',
    texto: 'Gira cada mueble en 3D y pruébalo en tu sala con realidad aumentada.',
    fecha: new Date().toISOString(),
    leido: false,
  },
];

function nuevoId() {
  return globalThis.crypto?.randomUUID?.() ?? `${Date.now()}-${Math.random().toString(16).slice(2)}`;
}

export default function NotificacionesProvider({ children }) {
  const [avisos, setAvisos] = useAlmacen('gc.avisos', BIENVENIDA);
  const [toasts, setToasts] = useState([]);
  const temporizadores = useRef(new Map());

  const cerrarToast = useCallback((id) => {
    clearTimeout(temporizadores.current.get(id));
    temporizadores.current.delete(id);
    setToasts((lista) => lista.filter((t) => t.id !== id));
  }, []);

  const notificar = useCallback(
    ({ titulo, texto, tipo = 'info', accion, guardar = true, duracion = 3800 }) => {
      const id = nuevoId();
      setToasts((lista) => [...lista.slice(-2), { id, titulo, texto, tipo, accion }]);
      temporizadores.current.set(id, setTimeout(() => cerrarToast(id), duracion));
      if (guardar) {
        setAvisos((lista) =>
          [{ id, tipo, titulo, texto, fecha: new Date().toISOString(), leido: false }, ...lista].slice(0, MAXIMO),
        );
      }
      return id;
    },
    [cerrarToast, setAvisos],
  );

  // Avisos de conexión: solo toast, no se guardan en la bandeja.
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

  const valor = useMemo(
    () => ({
      avisos,
      sinLeer: avisos.filter((a) => !a.leido).length,
      notificar,
      marcarLeido: (id) => setAvisos((lista) => lista.map((a) => (a.id === id ? { ...a, leido: true } : a))),
      marcarTodo: () => setAvisos((lista) => lista.map((a) => ({ ...a, leido: true }))),
      eliminar: (id) => setAvisos((lista) => lista.filter((a) => a.id !== id)),
      vaciar: () => setAvisos([]),
    }),
    [avisos, notificar, setAvisos],
  );

  return (
    <NotificacionesContext value={valor}>
      {children}
      <Toaster toasts={toasts} alCerrar={cerrarToast} />
    </NotificacionesContext>
  );
}
