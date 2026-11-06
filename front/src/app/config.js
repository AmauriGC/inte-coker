/**
 * URL base de la API.
 * - Desarrollo (npm run dev): misma dirección que la página + /api. Vite reenvía /api y /uploads
 *   al back (proxy en vite.config.js), así funciona igual desde la laptop o desde el teléfono
 *   por la IP de la red, sin tocar CORS.
 * - Producción: VITE_API_URL. Si es relativa ("/api", como en Docker), se usa la misma dirección
 *   de la página y nginx reenvía al back; si es absoluta, se llama directo a ese back.
 */
const API_ENV = (import.meta.env.VITE_API_URL ?? 'http://localhost:8080/api').replace(/\/+$/, '');

function resolverApi() {
  if (import.meta.env.DEV) return `${window.location.origin}/api`;
  return API_ENV.startsWith('/') ? window.location.origin + API_ENV : API_ENV;
}

export const API_URL = resolverApi();

/** Origen del back: los archivos subidos se sirven en ORIGEN_API + /uploads/... */
export const ORIGEN_API = new URL(API_URL).origin;

/** Convierte la ruta relativa que devuelve la API en una URL completa. */
export function urlArchivo(ruta) {
  if (!ruta) return null;
  return /^https?:\/\//.test(ruta) ? ruta : ORIGEN_API + ruta;
}
