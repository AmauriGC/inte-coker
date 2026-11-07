package com.gc.back.resena.dto;

import com.gc.back.resena.entity.Resena;

import java.time.Instant;

/**
 * Reseña para el front. El autor sale como "Nombre I." (sin apellido completo).
 * propia: la escribió la persona que consulta. mueble solo viene en la moderación.
 */
public record ResenaResponse(
        Long id,
        int estrellas,
        String texto,
        String autor,
        boolean propia,
        boolean editada,
        Instant creadoEn,
        String respuesta,
        Instant respondidaEn,
        boolean oculta,
        MuebleResumen mueble
) {

    public record MuebleResumen(Long id, String nombre, String slug) {
    }

    public static ResenaResponse desde(Resena r, Long actualId, boolean conMueble) {
        MuebleResumen mueble = conMueble
                ? new MuebleResumen(r.getMueble().getId(), r.getMueble().getNombre(), r.getMueble().getSlug())
                : null;
        return new ResenaResponse(r.getId(), r.getEstrellas(), r.getTexto(), nombreCorto(r.getCliente().getNombre()),
                r.getCliente().getId().equals(actualId), r.getEditadaEn() != null, r.getCreadoEn(),
                r.getRespuesta(), r.getRespondidaEn(), r.isOculta(), mueble);
    }

    static String nombreCorto(String nombre) {
        String[] partes = nombre == null ? new String[0] : nombre.trim().split("\\s+");
        if (partes.length == 0 || partes[0].isEmpty()) {
            return "Cliente";
        }
        return partes.length == 1 ? partes[0] : partes[0] + " " + Character.toUpperCase(partes[1].charAt(0)) + ".";
    }
}
