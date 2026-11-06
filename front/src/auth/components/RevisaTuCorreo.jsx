import { Mail, RefreshCw } from 'lucide-react';
import { motion } from 'motion/react';
import { useState } from 'react';
import Boton from '../../common/components/Boton';
import { useNotificaciones } from '../../notificaciones/context/NotificacionesContext';
import { authApi } from '../api/authApi';

/** Estado "Revisa tu correo" tras registrarse o cuando falta verificar la cuenta. */
export default function RevisaTuCorreo({ email, alVolver, textoVolver = 'Ya verifiqué, entrar' }) {
  const { notificar } = useNotificaciones();
  const [enviando, setEnviando] = useState(false);

  async function reenviar() {
    setEnviando(true);
    try {
      const r = await authApi.reenviarVerificacion(email);
      notificar({ tipo: 'exito', titulo: 'Correo enviado', texto: r.mensaje, guardar: false });
    } catch (e) {
      notificar({ tipo: 'error', titulo: 'No se pudo reenviar', texto: e.message, guardar: false });
    } finally {
      setEnviando(false);
    }
  }

  return (
    <motion.div initial={{ opacity: 0, scale: 0.97 }} animate={{ opacity: 1, scale: 1 }} className="text-center">
      <motion.span
        initial={{ rotate: -12, scale: 0.6 }}
        animate={{ rotate: 0, scale: 1 }}
        transition={{ type: 'spring', stiffness: 300, damping: 14 }}
        className="mx-auto grid size-16 place-items-center rounded-3xl bg-salvia-suave text-salvia"
      >
        <Mail className="size-7" />
      </motion.span>
      <h2 className="mt-4 font-display text-xl font-semibold">Revisa tu correo</h2>
      <p className="mx-auto mt-1.5 max-w-xs text-[14px] leading-relaxed text-gris">
        Te enviamos un enlace a <span className="font-semibold text-tinta">{email}</span> para activar tu cuenta.
      </p>
      <div className="mt-6 grid gap-2">
        <Boton bloque onClick={alVolver}>
          {textoVolver}
        </Boton>
        <Boton bloque variante="fantasma" icono={RefreshCw} cargando={enviando} onClick={reenviar}>
          Reenviar el correo
        </Boton>
      </div>
    </motion.div>
  );
}
