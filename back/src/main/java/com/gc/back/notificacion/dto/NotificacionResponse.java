package com.gc.back.notificacion.dto;

import com.gc.back.notificacion.entity.Notificacion;

import java.time.Instant;

public record NotificacionResponse(
        Long id,
        String tipo,
        String titulo,
        String texto,
        String ruta,
        boolean leida,
        Instant fecha
) {

    public static NotificacionResponse desde(Notificacion n) {
        return new NotificacionResponse(n.getId(), n.getTipo(), n.getTitulo(), n.getTexto(), n.getRuta(),
                n.isLeida(), n.getCreadoEn());
    }
}
