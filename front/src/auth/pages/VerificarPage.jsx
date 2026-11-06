import { BadgeCheck, CircleAlert, LoaderCircle } from 'lucide-react';
import { motion } from 'motion/react';
import { useSearchParams } from 'react-router';
import Boton from '../../common/components/Boton';
import { useConsulta } from '../../common/hooks/useConsulta';
import { authApi } from '../api/authApi';
import MarcoCuenta from '../components/MarcoCuenta';

/**
 * Un token de verificación sirve una sola vez: se guarda la promesa por token para que
 * el doble montaje de StrictMode (o volver a la pantalla) no lo gaste dos veces.
 */
const verificaciones = new Map();
function verificarUnaVez(token) {
  if (!verificaciones.has(token)) verificaciones.set(token, authApi.verificar(token));
  return verificaciones.get(token);
}

export default function VerificarPage() {
  const [parametros] = useSearchParams();
  const token = parametros.get('token');
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
        ) : (
          <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }}>
            <motion.span
              initial={{ scale: 0.5 }}
              animate={{ scale: 1 }}
              transition={{ type: 'spring', stiffness: 320, damping: 12 }}
              className={`mx-auto grid size-16 place-items-center rounded-3xl ${error ? 'bg-[#F6DAD7] text-[#B3261E]' : 'bg-salvia-suave text-salvia'}`}
            >
              {error ? <CircleAlert className="size-7" /> : <BadgeCheck className="size-7" />}
            </motion.span>
            <h2 className="mt-4 font-display text-xl font-semibold">{error ? 'No pudimos verificarte' : '¡Cuenta activada!'}</h2>
            <p className="mx-auto mt-1.5 max-w-xs text-[14px] text-gris">{error ? error.message : datos?.mensaje}</p>
            <Boton a="/entrar" bloque className="mt-6">
              {error ? 'Ir a entrar' : 'Entrar a mi cuenta'}
            </Boton>
          </motion.div>
        )}
      </div>
    </MarcoCuenta>
  );
}
