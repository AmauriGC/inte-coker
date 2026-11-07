package com.gc.back.pedido.dto;

import com.gc.back.pedido.entity.TipoEntrega;

/** Lo que trae una solicitud de pedido, venga de "Comprar" o de convertir una consulta. */
public interface DatosSolicitud {

    Integer cantidad();

    TipoEntrega tipoEntrega();

    String nombreRecibe();

    String telefono();

    String direccion();

    String ciudad();

    String codigoPostal();

    String mensaje();

    /** Color elegido; null si el mueble no se vende por color. */
    default Long varianteId() {
        return null;
    }
}
