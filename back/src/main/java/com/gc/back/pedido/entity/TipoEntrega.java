package com.gc.back.pedido.entity;

/** Cómo recibe el cliente el mueble. Con DOMICILIO los datos de entrega son obligatorios. */
public enum TipoEntrega {

    DOMICILIO("envío a domicilio"),
    RECOGER("recoger con el vendedor");

    private final String descripcion;

    TipoEntrega(String descripcion) {
        this.descripcion = descripcion;
    }

    public String getDescripcion() {
        return descripcion;
    }
}
