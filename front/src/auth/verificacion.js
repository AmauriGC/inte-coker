/**
 * Aviso entre pestañas: la pestaña que abre el enlace del correo avisa que la cuenta quedó
 * verificada y la que espera en "Revisa tu correo" se actualiza sola.
 * BroadcastChannel cuando existe; si no, el evento storage de localStorage.
 */
const CANAL = 'gc-verificacion';
const CLAVE = 'gc.verificada';

export function avisarVerificada() {
  try {
    if ('BroadcastChannel' in window) {
      const canal = new BroadcastChannel(CANAL);
      canal.postMessage('verificada');
      canal.close();
    } else {
      localStorage.setItem(CLAVE, String(Date.now()));
    }
  } catch {
    // Sin canal no pasa nada: la otra pestaña sigue con su botón "Ya verifiqué".
  }
}

/** Llama a `alVerificar` cuando otra pestaña verifica la cuenta. Devuelve cómo dejar de escuchar. */
export function escucharVerificada(alVerificar) {
  if ('BroadcastChannel' in window) {
    const canal = new BroadcastChannel(CANAL);
    canal.onmessage = (e) => e.data === 'verificada' && alVerificar();
    return () => canal.close();
  }
  const alCambiar = (e) => e.key === CLAVE && alVerificar();
  window.addEventListener('storage', alCambiar);
  return () => window.removeEventListener('storage', alCambiar);
}
