import { createContext, useContext } from 'react';

export const NotificacionesContext = createContext(null);

/**
 * notificar({ titulo, texto, tipo, accion, guardar }) muestra un toast y, salvo guardar:false,
 * lo deja en la bandeja de avisos. accion = { texto, alHacer } agrega un botón al toast.
 */
export function useNotificaciones() {
  const contexto = useContext(NotificacionesContext);
  if (!contexto) throw new Error('useNotificaciones debe usarse dentro de NotificacionesProvider');
  return contexto;
}
