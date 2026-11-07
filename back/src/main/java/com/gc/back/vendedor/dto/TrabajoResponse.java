package com.gc.back.vendedor.dto;

import com.gc.back.config.RecursosEstaticosConfig;
import com.gc.back.vendedor.entity.TrabajoVendedor;

import java.time.Instant;

public record TrabajoResponse(Long id, String titulo, String descripcion, String imagenUrl, int orden, Instant creadoEn) {

    public static TrabajoResponse desde(TrabajoVendedor t) {
        return new TrabajoResponse(t.getId(), t.getTitulo(), t.getDescripcion(),
                RecursosEstaticosConfig.RUTA_PUBLICA + t.getImagenRuta(), t.getOrden(), t.getCreadoEn());
    }
}
