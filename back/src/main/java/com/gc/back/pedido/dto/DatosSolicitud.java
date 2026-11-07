package com.gc.back.pedido.dto;

import com.gc.back.pedido.entity.MetodoPago;
import com.gc.back.pedido.entity.TipoEntrega;

/** Lo que trae una solicitud de pedido, venga de "Comprar" o de convertir una consulta. */
public interface DatosSolicitud {

    Integer cantidad();

    TipoEntrega tipoEntrega();

    MetodoPago metodoPago();

    String nombreRecibe();

    String telefono();

    String direccion();

    String ciudad();

    String codigoPostal();

    String mensaje();

    /** true = apartar con anticipo en vez de comprar de contado. */
    default Boolean apartar() {
        return false;
    }

    /** Color elegido; null si el mueble no se vende por color. */
    default Long varianteId() {
        return null;
    }
}
