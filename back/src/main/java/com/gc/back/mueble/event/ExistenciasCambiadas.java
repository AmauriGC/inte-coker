package com.gc.back.mueble.event;

import com.gc.back.mueble.entity.Mueble;

/**
 * Las existencias de un mueble pudieron subir (edición, devolución o publicación). Se
 * escucha dentro de la misma transacción: el módulo aviso revisa quién esperaba piezas.
 */
public record ExistenciasCambiadas(Mueble mueble) {
}
