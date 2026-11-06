package com.gc.back.pedido.entity;

import java.util.EnumSet;
import java.util.Set;

/**
 * Estados del pedido y a cuáles puede pasar cada uno (sin importar quién lo pide; eso lo
 * decide PedidoService). RECHAZADO, ENTREGADO y CANCELADO cierran el pedido.
 */
public enum EstadoPedido {

    CONSULTA("Consulta"),
    SOLICITADO("Solicitado"),
    ACEPTADO("Aceptado"),
    RECHAZADO("Rechazado"),
    EN_CAMINO("En camino"),
    ENTREGADO("Entregado"),
    CANCELADO("Cancelado");

    public static final Set<EstadoPedido> ABIERTOS = EnumSet.of(CONSULTA, SOLICITADO, ACEPTADO, EN_CAMINO);

    private final String etiqueta;

    EstadoPedido(String etiqueta) {
        this.etiqueta = etiqueta;
    }

    public String getEtiqueta() {
        return etiqueta;
    }

    public boolean abierto() {
        return ABIERTOS.contains(this);
    }

    public Set<EstadoPedido> siguientes() {
        return switch (this) {
            case CONSULTA -> EnumSet.of(SOLICITADO, RECHAZADO, CANCELADO);
            case SOLICITADO -> EnumSet.of(ACEPTADO, RECHAZADO, CANCELADO);
            case ACEPTADO -> EnumSet.of(EN_CAMINO, CANCELADO);
            case EN_CAMINO -> EnumSet.of(ENTREGADO);
            case RECHAZADO, ENTREGADO, CANCELADO -> EnumSet.noneOf(EstadoPedido.class);
        };
    }
}
