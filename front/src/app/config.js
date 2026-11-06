/** URL base de la API (VITE_API_URL del .env de la raíz). */
export const API_URL = (import.meta.env.VITE_API_URL ?? 'http://localhost:8080/api').replace(/\/+$/, '');

/** Origen del back: los archivos subidos se sirven en ORIGEN_API + /uploads/... */
export const ORIGEN_API = new URL(API_URL).origin;

/** Convierte la ruta relativa que devuelve la API en una URL completa. */
export function urlArchivo(ruta) {
  if (!ruta) return null;
  return /^https?:\/\//.test(ruta) ? ruta : ORIGEN_API + ruta;
}
