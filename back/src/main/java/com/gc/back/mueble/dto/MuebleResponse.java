package com.gc.back.mueble.dto;

import com.gc.back.config.RecursosEstaticosConfig;
import com.gc.back.mueble.entity.Mueble;

import java.math.BigDecimal;
import java.time.Instant;

/**
 * Mueble para el front. modeloUrl e imagenUrl son rutas relativas al servidor del back
 * (por ejemplo "/uploads/muebles/3/modelo-1a2b3c4d.glb"); el front les antepone el origen de la API.
 */
public record MuebleResponse(
        Long id,
        String nombre,
        String slug,
        String descripcion,
        BigDecimal precio,
        Integer anchoCm,
        Integer fondoCm,
        Integer altoCm,
        String materiales,
        int existencias,
        int totalMeGusta,
        int totalResenas,
        BigDecimal calificacion,
        boolean publicado,
        String modeloUrl,
        String imagenUrl,
        CategoriaResumen categoria,
        VendedorResumen vendedor,
        Instant creadoEn,
        Instant actualizadoEn
) {

    public record CategoriaResumen(Long id, String nombre, String slug) {
    }

    public record VendedorResumen(Long id, String nombre, String slug, String fotoUrl) {
    }

    public static MuebleResponse desde(Mueble m) {
        return new MuebleResponse(
                m.getId(), m.getNombre(), m.getSlug(), m.getDescripcion(), m.getPrecio(),
                m.getAnchoCm(), m.getFondoCm(), m.getAltoCm(), m.getMateriales(), m.getExistencias(),
                m.getTotalMeGusta(), m.getTotalResenas(), m.getCalificacion(), m.isPublicado(),
                url(m.getModeloRuta()), url(m.getImagenRuta()),
                new CategoriaResumen(m.getCategoria().getId(), m.getCategoria().getNombre(), m.getCategoria().getSlug()),
                new VendedorResumen(m.getVendedor().getId(), m.getVendedor().getNombre(),
                        m.getVendedor().getSlug(), url(m.getVendedor().getFotoRuta())),
                m.getCreadoEn(), m.getActualizadoEn());
    }

    private static String url(String ruta) {
        return ruta == null ? null : RecursosEstaticosConfig.RUTA_PUBLICA + ruta;
    }
}
