import { Mail, MailCheck } from 'lucide-react';
import { motion } from 'motion/react';
import { useState } from 'react';
import Boton from '../../common/components/Boton';
import Campo from '../../common/components/Campo';
import { useEnvio } from '../../common/hooks/useEnvio';
import { authApi } from '../api/authApi';
import MarcoCuenta from '../components/MarcoCuenta';

export default function OlvidePasswordPage() {
  const [email, setEmail] = useState('');
  const [enviado, setEnviado] = useState(null);
  const { enviar, enviando, error, errores } = useEnvio(authApi.olvidePassword);

  async function alEnviar(e) {
    e.preventDefault();
    const r = await enviar(email.trim());
    if (r.ok) setEnviado(r.datos.mensaje);
  }

  return (
    <MarcoCuenta titulo="Recupera tu acceso" subtitulo="Te mandamos un enlace para crear una contraseña nueva." volverA="/entrar">
      {enviado ? (
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="text-center">
          <span className="mx-auto grid size-16 place-items-center rounded-3xl bg-salvia-suave text-salvia">
            <MailCheck className="size-7" />
          </span>
          <p className="mx-auto mt-4 max-w-xs text-[14px] leading-relaxed text-texto">{enviado}</p>
          <Boton a="/entrar" bloque className="mt-6">
            Volver a entrar
          </Boton>
        </motion.div>
      ) : (
        <form onSubmit={alEnviar} className="grid gap-4" noValidate>
          <Campo etiqueta="Correo de tu cuenta" type="email" autoComplete="email" icono={Mail} placeholder="tu@correo.com" value={email}
            error={errores.email ?? (error && !Object.keys(errores).length ? error.message : undefined)} onChange={(e) => setEmail(e.target.value)} required />
          <Boton type="submit" bloque cargando={enviando} className="h-[52px]">
            Enviar enlace
          </Boton>
        </form>
      )}
    </MarcoCuenta>
  );
}
