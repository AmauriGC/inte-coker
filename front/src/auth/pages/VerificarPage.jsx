import { BadgeCheck, CircleAlert, LoaderCircle } from 'lucide-react';
import { motion } from 'motion/react';
import { useEffect, useEffectEvent, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router';
import Boton from '../../common/components/Boton';
import { useConsulta } from '../../common/hooks/useConsulta';
import { authApi } from '../api/authApi';
import MarcoCuenta from '../components/MarcoCuenta';
import { avisarVerificada } from '../verificacion';

const SEGUNDOS = 5;

/**
 * Un token de verificación sirve una sola vez: se guarda la promesa por token para que
 * el doble montaje de StrictMode (o volver a la pantalla) no lo gaste dos veces.
 */
const verificaciones = new Map();
function verificarUnaVez(token) {
  if (!verificaciones.has(token)) {
    verificaciones.set(
      token,
      authApi.verificar(token).then((r) => {
        avisarVerificada();
        return r;
      }),
    );
  }
  return verificaciones.get(token);
}

/**
 * Cuenta verificada: la pestaña se cierra sola en 5 segundos para volver a la anterior.
 * Si el navegador no deja cerrarla (no la abrió un enlace externo), regresa a la página
 * anterior o a Entrar. "Quedarme aquí" detiene la cuenta regresiva.
 */
function Verificada({ mensaje }) {
  const navegar = useNavigate();
  const [segundos, setSegundos] = useState(SEGUNDOS);
  const [detenida, setDetenida] = useState(false);

  const cerrar = useEffectEvent(() => {
    if (window.history.length > 1) {
      navegar(-1);
      return;
    }
    window.close();
    // Si el navegador no la cerró, se queda en la app.
    setTimeout(() => !window.closed && navegar('/entrar', { replace: true }), 300);
  });

  useEffect(() => {
    if (detenida) return undefined;
    if (segundos === 0) {
      cerrar();
      return undefined;
    }
    const t = setTimeout(() => setSegundos((s) => s - 1), 1000);
    return () => clearTimeout(t);
  }, [segundos, detenida]);

  return (
    <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }}>
      <motion.span
        initial={{ scale: 0.5 }}
        animate={{ scale: 1 }}
        transition={{ type: 'spring', stiffness: 320, damping: 12 }}
        className="mx-auto grid size-16 place-items-center rounded-3xl bg-salvia-suave text-salvia"
      >
        <BadgeCheck className="size-7" />
      </motion.span>
      <h2 className="mt-4 font-display text-xl font-semibold">¡Cuenta activada!</h2>
      <p className="mx-auto mt-1.5 max-w-xs text-[14px] text-gris">{mensaje}</p>

      {!detenida && (
        <div className="mx-auto mt-6 max-w-xs">
          <p className="text-[13px] font-medium text-texto" aria-hidden>
            Esta pestaña se cierra en {segundos} s
          </p>
          <p className="sr-only" role="status">
            Esta pestaña se cerrará sola en {SEGUNDOS} segundos.
          </p>
          <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-crema">
            <motion.div className="h-full rounded-full bg-salvia" initial={{ width: '100%' }} animate={{ width: '0%' }} transition={{ duration: SEGUNDOS, ease: 'linear' }} />
          </div>
        </div>
      )}

      <div className="mt-6 grid gap-2">
        <Boton a="/entrar" bloque onClick={() => setDetenida(true)}>
          Entrar a mi cuenta
        </Boton>
        {!detenida && (
          <Boton variante="fantasma" bloque onClick={() => setDetenida(true)}>
            Quedarme aquí
          </Boton>
        )}
      </div>
    </motion.div>
  );
}

export default function VerificarPage() {
  const [parametros] = useSearchParams();
  // Se toma al entrar: durante la animación de salida la URL ya es otra y no trae el token.
  const [token] = useState(() => parametros.get('token'));
  const { datos, error, cargando } = useConsulta(
    () => (token ? verificarUnaVez(token) : Promise.reject(new Error('El enlace no trae el código de verificación.'))),
    [token],
  );

  return (
    <MarcoCuenta titulo="Verificar correo" volverA="/entrar">
      <div className="py-4 text-center">
        {cargando ? (
          <>
            <LoaderCircle className="mx-auto size-10 animate-spin text-terracota" />
            <p className="mt-4 text-[14px] text-gris">Activando tu cuenta…</p>
          </>
        ) : error ? (
          <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }}>
            <motion.span
              initial={{ scale: 0.5 }}
              animate={{ scale: 1 }}
              transition={{ type: 'spring', stiffness: 320, damping: 12 }}
              className="mx-auto grid size-16 place-items-center rounded-3xl bg-[#F6DAD7] text-[#B3261E]"
            >
              <CircleAlert className="size-7" />
            </motion.span>
            <h2 className="mt-4 font-display text-xl font-semibold">No pudimos verificarte</h2>
            <p className="mx-auto mt-1.5 max-w-xs text-[14px] text-gris">{error.message}</p>
            <Boton a="/entrar" bloque className="mt-6">
              Ir a entrar
            </Boton>
          </motion.div>
        ) : (
          <Verificada mensaje={datos?.mensaje} />
        )}
      </div>
    </MarcoCuenta>
  );
}
