package com.gc.back.correo.dto;

/**
 * Aviso por correo que un módulo publica como evento; se envía después de confirmar la
 * transacción y en otro hilo. Los textos ya van armados para no tocar la base al enviar.
 * El mismo aviso queda en la bandeja de la cuenta (módulo notificacion).
 *
 * @param ruta ruta del front a la que lleva el botón (por ejemplo "/pedidos/12")
 * @param tipo tipo para la bandeja (pedido, mueble, exito, info...); null lo deduce de la ruta
 */
public record AvisoCorreo(
        String email,
        String nombre,
        String asunto,
        String titulo,
        String texto,
        String boton,
        String ruta,
        String tipo
) {

    public AvisoCorreo(String email, String nombre, String asunto, String titulo, String texto, String boton, String ruta) {
        this(email, nombre, asunto, titulo, texto, boton, ruta, null);
    }
}
