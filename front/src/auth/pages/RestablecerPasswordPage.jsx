import { KeyRound } from 'lucide-react';
import { useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router';
import Boton from '../../common/components/Boton';
import Campo from '../../common/components/Campo';
import { useEnvio } from '../../common/hooks/useEnvio';
import { useNotificaciones } from '../../notificaciones/context/NotificacionesContext';
import { authApi } from '../api/authApi';
import MarcoCuenta from '../components/MarcoCuenta';

/**
 * Nueva contraseña con el token del enlace. activacion = la cuenta la creó un vendedor
 * (transportista) y con esto queda lista para entrar.
 */
export default function RestablecerPasswordPage({ activacion = false }) {
  const [parametros] = useSearchParams();
  const token = parametros.get('token') ?? '';
  const navegar = useNavigate();
  const { notificar } = useNotificaciones();
  const [password, setPassword] = useState('');
  const [repetir, setRepetir] = useState('');
  const [noCoincide, setNoCoincide] = useState(false);
  const { enviar, enviando, error, errores } = useEnvio(activacion ? authApi.activar : authApi.restablecerPassword);

  async function alEnviar(e) {
    e.preventDefault();
    if (password !== repetir) {
      setNoCoincide(true);
      return;
    }
    const r = await enviar(token, password);
    if (r.ok) {
      notificar(
        activacion
          ? { tipo: 'exito', titulo: 'Cuenta activada', texto: 'Entra con tu correo y la contraseña que elegiste.' }
          : { tipo: 'exito', titulo: 'Contraseña actualizada', texto: 'Ya puedes entrar con la nueva.' },
      );
      navegar('/entrar', { replace: true });
    }
  }

  const errorGeneral = error && !errores.password ? error.message : null;

  return (
    <MarcoCuenta
      titulo={activacion ? 'Activa tu cuenta' : 'Nueva contraseña'}
      subtitulo={activacion ? 'Elige tu contraseña para ver las entregas que te asignen.' : 'Elige una que no uses en otros sitios.'}
      volverA="/entrar"
    >
      <form onSubmit={alEnviar} className="grid gap-4" noValidate>
        {!token && <p className="rounded-2xl bg-[#F6DAD7] px-4 py-3 text-[13.5px] text-[#8C1D17]">{activacion ? 'El enlace está incompleto. Pide a tu vendedor que te mande la invitación otra vez.' : 'El enlace está incompleto. Pide uno nuevo.'}</p>}
        {errorGeneral && <p role="alert" className="rounded-2xl bg-[#F6DAD7] px-4 py-3 text-[13.5px] text-[#8C1D17]">{errorGeneral}</p>}
        <Campo etiqueta="Contraseña nueva" type="password" autoComplete="new-password" icono={KeyRound} value={password} error={errores.password}
          ayuda="Al menos 8 caracteres, con una letra y un número." onChange={(e) => setPassword(e.target.value)} required />
        <Campo etiqueta="Repite la contraseña" type="password" autoComplete="new-password" icono={KeyRound} value={repetir}
          error={noCoincide ? 'Las contraseñas no coinciden' : undefined}
          onChange={(e) => {
            setRepetir(e.target.value);
            setNoCoincide(false);
          }}
          required />
        <Boton type="submit" bloque cargando={enviando} disabled={!token} className="h-[52px]">
          {activacion ? 'Activar mi cuenta' : 'Guardar contraseña'}
        </Boton>
        {errorGeneral && !activacion && (
          <Boton a="/olvide-password" variante="fantasma" bloque>
            Pedir otro enlace
          </Boton>
        )}
      </form>
    </MarcoCuenta>
  );
}
