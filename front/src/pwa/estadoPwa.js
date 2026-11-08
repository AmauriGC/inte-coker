/**
 * Estado de la PWA fuera de React (el evento beforeinstallprompt llega antes de montar la app).
 * Los componentes lo leen con usePwa() (useSyncExternalStore).
 */
/**
 * iPhone y iPad (también el iPad que se presenta como Mac): Safari no lanza beforeinstallprompt,
 * así que se muestra una guía para "Agregar a inicio".
 */
const ES_IOS =
  typeof navigator !== 'undefined' &&
  (/iphone|ipad|ipod/i.test(navigator.userAgent) || (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1));

/**
 * actualizacion: hay una versión esperando. instalable: el navegador ofrece su diálogo.
 * ios: se instala a mano (guía). hojaInstalar: alguien pidió ver cómo instalar.
 */
let estado = { actualizacion: false, instalable: false, instalada: false, ios: false, hojaInstalar: false };
let trabajadorEnEspera = null;
let promptInstalacion = null;
let aceptoActualizar = false;
const oyentes = new Set();

function cambiar(parcial) {
  estado = { ...estado, ...parcial };
  oyentes.forEach((fn) => fn());
}

export function suscribir(fn) {
  oyentes.add(fn);
  return () => oyentes.delete(fn);
}

export function leerEstado() {
  return estado;
}

function avisarActualizacion(trabajador) {
  trabajadorEnEspera = trabajador;
  cambiar({ actualizacion: true });
}

/**
 * Registra /sw.js solo en producción. En desarrollo desregistra cualquiera que haya quedado
 * de un "npm run preview" en el mismo puerto, porque serviría archivos viejos.
 */
export function registrarServiceWorker() {
  if (!('serviceWorker' in navigator)) return;
  if (!import.meta.env.PROD) {
    navigator.serviceWorker.getRegistrations().then((lista) => lista.forEach((r) => r.unregister()));
    return;
  }

  // Solo recarga si la persona pidió actualizar; la primera instalación también dispara controllerchange.
  navigator.serviceWorker.addEventListener('controllerchange', () => {
    if (aceptoActualizar) window.location.reload();
  });

  window.addEventListener('load', async () => {
    try {
      const registro = await navigator.serviceWorker.register('/sw.js');
      if (registro.waiting && navigator.serviceWorker.controller) avisarActualizacion(registro.waiting);
      registro.addEventListener('updatefound', () => {
        const nuevo = registro.installing;
        nuevo?.addEventListener('statechange', () => {
          if (nuevo.state === 'installed' && navigator.serviceWorker.controller) avisarActualizacion(nuevo);
        });
      });
      // Busca versiones nuevas cada hora mientras la app siga abierta.
      setInterval(() => registro.update().catch(() => {}), 60 * 60 * 1000);
    } catch {
      /* sin service worker la app sigue funcionando en línea */
    }
  });
}

/** Activa la versión que está esperando; la página se recarga al tomar el control. */
export function aplicarActualizacion() {
  if (!trabajadorEnEspera) return;
  aceptoActualizar = true;
  trabajadorEnEspera.postMessage({ tipo: 'ACTUALIZAR' });
}

/** Borra las respuestas de la API guardadas (al cerrar sesión). */
export function limpiarCacheApi() {
  navigator.serviceWorker?.controller?.postMessage({ tipo: 'LIMPIAR_API' });
}

/** Escucha el aviso de instalación del navegador (Chrome, Edge, Android). */
export function escucharInstalacion() {
  window.addEventListener('beforeinstallprompt', (e) => {
    e.preventDefault();
    promptInstalacion = e;
    cambiar({ instalable: true });
  });
  window.addEventListener('appinstalled', () => {
    promptInstalacion = null;
    cambiar({ instalable: false, instalada: true });
  });
  const instalada = window.matchMedia?.('(display-mode: standalone)').matches || navigator.standalone === true;
  cambiar({ instalada, ios: ES_IOS && !instalada });
}

/** Muestra la hoja de instalación (botón "Instalar la app" de Cuenta). */
export function abrirHojaInstalar() {
  cambiar({ hojaInstalar: true });
}

export function cerrarHojaInstalar() {
  cambiar({ hojaInstalar: false });
}

/**
 * Número de avisos sin leer en el icono de la app instalada (Badging API: Chrome, Edge y
 * Safari en iOS 16.4+ con la app en inicio). Donde no existe, no hace nada.
 */
export function ponerInsignia(cantidad) {
  try {
    if (cantidad > 0) navigator.setAppBadge?.(cantidad)?.catch(() => {});
    else navigator.clearAppBadge?.()?.catch(() => {});
  } catch {
    /* sin Badging API */
  }
}

/** Abre el diálogo del navegador. Devuelve true si la persona aceptó. */
export async function instalar() {
  if (!promptInstalacion) return false;
  promptInstalacion.prompt();
  const { outcome } = await promptInstalacion.userChoice;
  promptInstalacion = null;
  cambiar({ instalable: false, hojaInstalar: false });
  return outcome === 'accepted';
}
