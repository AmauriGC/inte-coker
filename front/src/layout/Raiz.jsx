import { Outlet, ScrollRestoration } from 'react-router';

/** Ruta raíz: restaura el scroll al navegar. */
export default function Raiz() {
  return (
    <>
      <ScrollRestoration />
      <Outlet />
    </>
  );
}
