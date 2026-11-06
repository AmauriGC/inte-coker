package com.gc.back.correo.dto;

/**
 * Aviso por correo que un módulo publica como evento; se envía después de confirmar la
 * transacción y en otro hilo. Los textos ya van armados para no tocar la base al enviar.
 *
 * @param ruta ruta del front a la que lleva el botón (por ejemplo "/pedidos/12")
 */
public record AvisoCorreo(
        String email,
        String nombre,
        String asunto,
        String titulo,
        String texto,
        String boton,
        String ruta
) {
}
