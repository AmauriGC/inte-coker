package com.gc.back.mueble.service;

import com.gc.back.mueble.entity.Mueble;

/**
 * Regla que otro módulo agrega antes de borrar un mueble (por ejemplo, pedido: no se borra
 * con pedidos en curso). Así el módulo mueble no depende de los demás. Lanza una
 * ApiException si el mueble no se puede borrar.
 */
public interface ReglaBorradoMueble {

    void validarBorrado(Mueble mueble);
}
