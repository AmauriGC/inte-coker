import Swal from 'sweetalert2';

/** Clases de index.css (gc-alerta, gc-boton) en lugar del estilo propio de SweetAlert2. */
const CLASES = {
  popup: 'gc-alerta',
  confirmButton: 'gc-boton gc-boton-primario',
  cancelButton: 'gc-boton gc-boton-secundario',
  denyButton: 'gc-boton gc-boton-secundario',
};

const base = Swal.mixin({
  buttonsStyling: false,
  reverseButtons: true,
  showClass: { popup: 'gc-alerta-entra' },
  hideClass: { popup: 'gc-alerta-sale' },
  customClass: CLASES,
});

/** Pregunta antes de una acción. Devuelve true si la persona confirma. */
export async function confirmar({ titulo, texto, boton = 'Sí, continuar', peligro = false }) {
  const { isConfirmed } = await base.fire({
    title: titulo,
    text: texto,
    icon: peligro ? 'warning' : 'question',
    showCancelButton: true,
    confirmButtonText: boton,
    cancelButtonText: 'Cancelar',
    focusCancel: peligro,
    customClass: { ...CLASES, confirmButton: peligro ? 'gc-boton gc-boton-peligro' : CLASES.confirmButton },
  });
  return isConfirmed;
}

/** Éxito destacado; con imagen (por ejemplo, el mueble recién publicado). */
export function exito({ titulo, texto, imagen, boton = 'Listo' }) {
  return base.fire({
    title: titulo,
    text: texto,
    icon: imagen ? undefined : 'success',
    imageUrl: imagen ?? undefined,
    imageHeight: imagen ? 150 : undefined,
    imageAlt: imagen ? titulo : undefined,
    confirmButtonText: boton,
  });
}

export function error({ titulo = 'Algo salió mal', texto }) {
  return base.fire({ title: titulo, text: texto, icon: 'error', confirmButtonText: 'Entendido' });
}

/**
 * Pide un texto corto (por ejemplo, el motivo de un rechazo).
 * Devuelve el texto (puede ser "" si no es obligatorio) o null si la persona se arrepiente.
 */
export async function pedirTexto({ titulo, texto, placeholder, boton = 'Enviar', obligatorio = false, peligro = false, maximo = 300 }) {
  const r = await base.fire({
    title: titulo,
    text: texto,
    input: 'textarea',
    inputPlaceholder: placeholder,
    inputAttributes: { maxlength: String(maximo), 'aria-label': titulo },
    showCancelButton: true,
    confirmButtonText: boton,
    cancelButtonText: 'Volver',
    customClass: { ...CLASES, input: 'gc-alerta-texto', confirmButton: peligro ? 'gc-boton gc-boton-peligro' : CLASES.confirmButton },
    inputValidator: (valor) => (obligatorio && !valor.trim() ? 'Escribe el motivo para continuar' : undefined),
  });
  return r.isConfirmed ? r.value.trim() : null;
}

/**
 * Aviso informativo. Con "extra" muestra un segundo botón;
 * devuelve 'extra' si lo eligen, 'ok' si confirman o null si cierran.
 */
export async function informar({ titulo, texto, boton = 'Entendido', extra }) {
  const r = await base.fire({
    title: titulo,
    text: texto,
    icon: 'info',
    confirmButtonText: boton,
    showDenyButton: Boolean(extra),
    denyButtonText: extra,
  });
  if (r.isDenied) return 'extra';
  return r.isConfirmed ? 'ok' : null;
}
