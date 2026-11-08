import { createContext, useContext } from 'react';

export const NotificacionesContext = createContext(null);

/**
 * notificar({ titulo, texto, tipo, accion }) muestra un toast. accion = { texto, alHacer } agrega
 * un botón. La bandeja de avisos es de la cuenta: ver AvisosContext.
 */
export function useNotificaciones() {
  const contexto = useContext(NotificacionesContext);
  if (!contexto) throw new Error('useNotificaciones debe usarse dentro de NotificacionesProvider');
  return contexto;
}
