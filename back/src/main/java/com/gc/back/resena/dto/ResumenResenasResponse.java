package com.gc.back.resena.dto;

import java.math.BigDecimal;
import java.util.List;

/**
 * Resumen de la calificación de un mueble. distribucion va de 5 a 1 estrellas.
 * meGusta, puedeResenar y miResena dependen de quién consulta (sin sesión: false y null).
 */
public record ResumenResenasResponse(
        BigDecimal promedio,
        int total,
        List<Barra> distribucion,
        int totalMeGusta,
        boolean meGusta,
        boolean puedeResenar,
        ResenaResponse miResena
) {

    public record Barra(int estrellas, long total) {
    }
}
