import { obtener, peticion } from '../../common/api/cliente';

const CLAVE_VISTAS = 'gc.vistas';

export const metricasApi = {
  /** dias: 1 a 365. tienda = true para toda la tienda (solo con METRICA_GLOBAL). */
  metricas: ({ dias, tienda }, signal) => obtener('/metricas', { consulta: { dias, tienda }, signal }),

  /**
   * Cuenta una vista del mueble una sola vez por sesión del navegador. Si falla no pasa
   * nada: la métrica es aproximada y no debe estorbar al catálogo.
   */
  vista(muebleId) {
    let vistos;
    try {
      vistos = JSON.parse(sessionStorage.getItem(CLAVE_VISTAS) ?? '[]');
    } catch {
      vistos = [];
    }
    if (vistos.includes(muebleId)) return;
    try {
      sessionStorage.setItem(CLAVE_VISTAS, JSON.stringify([...vistos, muebleId].slice(-200)));
    } catch {
      // Sin almacenamiento (modo privado): se cuenta igual.
    }
    peticion(`/muebles/${muebleId}/vista`, { metodo: 'POST' }).catch(() => {});
  },
};
