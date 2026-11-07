package com.gc.back.pedido.entity;

/** Cómo paga el cliente al recibir el mueble. Lo elige al pedir; el transportista confirma el cobro. */
public enum MetodoPago {

    EFECTIVO("efectivo"),
    TARJETA("tarjeta");

    private final String descripcion;

    MetodoPago(String descripcion) {
        this.descripcion = descripcion;
    }

    public String getDescripcion() {
        return descripcion;
    }
}
