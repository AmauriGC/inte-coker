import { obtener, peticion } from '../../common/api/cliente';

/** Endpoints de /api/auth. Las funciones que solo confirman devuelven el mensaje del back. */
export const authApi = {
  login: (email, password) => obtener('/auth/login', { metodo: 'POST', cuerpo: { email, password }, auth: false }),
  registro: (datos) => peticion('/auth/registro', { metodo: 'POST', cuerpo: datos, auth: false }),
  verificar: (token) => peticion('/auth/verificar', { metodo: 'POST', cuerpo: { token }, auth: false }),
  reenviarVerificacion: (email) => peticion('/auth/reenviar-verificacion', { metodo: 'POST', cuerpo: { email }, auth: false }),
  olvidePassword: (email) => peticion('/auth/olvide-password', { metodo: 'POST', cuerpo: { email }, auth: false }),
  restablecerPassword: (token, password) =>
    peticion('/auth/restablecer-password', { metodo: 'POST', cuerpo: { token, password }, auth: false }),
  yo: (signal) => obtener('/auth/yo', { signal }),
};
