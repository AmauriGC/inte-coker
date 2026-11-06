const CLAVE = 'gc.sesion';

/**
 * Guarda la sesión (access, refresh y usuario) en localStorage.
 * Todo acceso va en try/catch: en modo privado el almacenamiento puede fallar.
 */
export const tokens = {
  leer() {
    try {
      return JSON.parse(localStorage.getItem(CLAVE)) ?? null;
    } catch {
      return null;
    }
  },
  access() {
    return this.leer()?.accessToken ?? null;
  },
  refresh() {
    return this.leer()?.refreshToken ?? null;
  },
  usuario() {
    return this.leer()?.usuario ?? null;
  },
  guardar({ accessToken, refreshToken, usuario }) {
    try {
      localStorage.setItem(CLAVE, JSON.stringify({ accessToken, refreshToken, usuario }));
    } catch {
      /* sin almacenamiento: la sesión dura lo que la pestaña */
    }
  },
  actualizarUsuario(usuario) {
    const actual = this.leer();
    if (actual) this.guardar({ ...actual, usuario });
  },
  limpiar() {
    try {
      localStorage.removeItem(CLAVE);
    } catch {
      /* nada que limpiar */
    }
  },
};
