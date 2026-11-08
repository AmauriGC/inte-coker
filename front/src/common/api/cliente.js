import { API_URL } from '../../app/config';
import { tokens } from './tokens';

/** Error con el mensaje en español que manda el back (ApiResponse) y sus errores por campo. */
export class ApiError extends Error {
  constructor(mensaje, estado, errores = null) {
    super(mensaje);
    this.name = 'ApiError';
    this.estado = estado;
    this.errores = errores;
  }
}

const oyentesExpiracion = new Set();

/** Avisa cuando la sesión ya no se pudo renovar (el contexto de sesión cierra la sesión). */
export function alExpirarSesion(fn) {
  oyentesExpiracion.add(fn);
  return () => oyentesExpiracion.delete(fn);
}

let refrescoEnCurso = null;

/** Pide un par nuevo de tokens una sola vez aunque fallen varias peticiones a la vez. */
function refrescarSesion() {
  const refresh = tokens.refresh();
  if (!refresh) return Promise.resolve(false);
  if (!refrescoEnCurso) {
    refrescoEnCurso = fetch(`${API_URL}/auth/refresh`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ token: refresh }),
    })
      .then(async (r) => {
        if (!r.ok) return false;
        const json = await r.json();
        tokens.guardar(json.datos);
        return true;
      })
      .catch(() => false)
      .finally(() => {
        refrescoEnCurso = null;
      });
  }
  return refrescoEnCurso;
}

function expirar() {
  tokens.limpiar();
  oyentesExpiracion.forEach((fn) => fn());
}

function construirUrl(ruta, consulta) {
  const url = new URL(API_URL + ruta);
  Object.entries(consulta ?? {}).forEach(([clave, valor]) => {
    if (valor !== undefined && valor !== null && valor !== '') url.searchParams.set(clave, valor);
  });
  return url;
}

/**
 * Petición a la API. Devuelve el ApiResponse completo ({ exito, mensaje, datos }).
 * Con un 401 intenta renovar la sesión una vez y repite la petición.
 */
export async function peticion(ruta, { metodo = 'GET', cuerpo, consulta, auth = true, signal, reintento = true } = {}) {
  const esFormulario = cuerpo instanceof FormData;
  const headers = { Accept: 'application/json' };
  if (cuerpo !== undefined && !esFormulario) headers['Content-Type'] = 'application/json';
  const access = tokens.access();
  if (auth && access) headers.Authorization = `Bearer ${access}`;

  let respuesta;
  try {
    respuesta = await fetch(construirUrl(ruta, consulta), {
      method: metodo,
      headers,
      signal,
      body: cuerpo === undefined ? undefined : esFormulario ? cuerpo : JSON.stringify(cuerpo),
    });
  } catch (error) {
    if (error.name === 'AbortError') throw error;
    throw new ApiError('No hay conexión con el servidor. Revisa tu internet.', 0);
  }

  if (respuesta.status === 401 && auth && access && reintento) {
    if (await refrescarSesion()) {
      return peticion(ruta, { metodo, cuerpo, consulta, auth, signal, reintento: false });
    }
    expirar();
  }

  const json = await respuesta.json().catch(() => null);
  if (!respuesta.ok || json?.exito === false) {
    throw new ApiError(json?.mensaje ?? 'Ocurrió un error inesperado', respuesta.status, json?.errores);
  }
  return json;
}

/**
 * Atajo: solo los datos. La API omite `datos` cuando es null (JsonInclude NON_NULL); aquí vuelve a ser
 * null para que useConsulta no lo confunda con "todavía cargando" (undefined).
 */
export async function obtener(ruta, opciones) {
  return (await peticion(ruta, opciones)).datos ?? null;
}

/**
 * Sube un archivo con XMLHttpRequest para poder mostrar el progreso.
 * alProgreso recibe un número de 0 a 100.
 */
export function subirArchivo(ruta, archivo, { campo = 'archivo', alProgreso, reintento = true } = {}) {
  return new Promise((resolver, rechazar) => {
    const xhr = new XMLHttpRequest();
    xhr.open('POST', API_URL + ruta);
    xhr.setRequestHeader('Accept', 'application/json');
    const access = tokens.access();
    if (access) xhr.setRequestHeader('Authorization', `Bearer ${access}`);
    xhr.upload.onprogress = (e) => {
      if (e.lengthComputable) alProgreso?.(Math.round((e.loaded / e.total) * 100));
    };
    xhr.onerror = () => rechazar(new ApiError('No hay conexión con el servidor. Revisa tu internet.', 0));
    xhr.onload = async () => {
      let json = null;
      try {
        json = JSON.parse(xhr.responseText);
      } catch {
        /* respuesta sin JSON */
      }
      if (xhr.status === 401 && reintento && (await refrescarSesion())) {
        subirArchivo(ruta, archivo, { campo, alProgreso, reintento: false }).then(resolver, rechazar);
        return;
      }
      if (xhr.status === 401) expirar();
      if (xhr.status >= 200 && xhr.status < 300 && json?.exito !== false) resolver(json);
      else rechazar(new ApiError(json?.mensaje ?? 'No se pudo subir el archivo', xhr.status, json?.errores));
    };
    const formulario = new FormData();
    formulario.append(campo, archivo);
    xhr.send(formulario);
  });
}
