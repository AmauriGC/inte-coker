import { obtener } from '../../common/api/cliente';

/** Los transportistas que registra cada vendedor (/api/transportistas). */
export const transportistasApi = {
  listar: (signal) => obtener('/transportistas', { signal }),
  crear: (datos) => obtener('/transportistas', { metodo: 'POST', cuerpo: datos }),
  reenviarInvitacion: (id) => obtener(`/transportistas/${id}/invitacion`, { metodo: 'POST' }),
  cambiarActivo: (id, activo) => obtener(`/transportistas/${id}/activo`, { metodo: 'PATCH', cuerpo: { activo } }),
};

/** Solo estos se pueden asignar a un envío. */
export const disponible = (t) => t.activo && !t.invitacionPendiente;
