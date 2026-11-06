import { createContext, useContext } from 'react';

export const FavoritosContext = createContext(null);

/** { favoritos, esFavorito(id), alternar(mueble) } */
export function useFavoritos() {
  const contexto = useContext(FavoritosContext);
  if (!contexto) throw new Error('useFavoritos debe usarse dentro de FavoritosProvider');
  return contexto;
}
