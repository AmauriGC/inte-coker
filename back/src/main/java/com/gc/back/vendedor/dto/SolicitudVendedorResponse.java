package com.gc.back.vendedor.dto;

import com.gc.back.vendedor.entity.EstadoSolicitud;
import com.gc.back.vendedor.entity.SolicitudVendedor;

import java.time.Instant;

public record SolicitudVendedorResponse(
        Long id,
        EstadoSolicitud estado,
        Solicitante usuario,
        String ciudad,
        String telefono,
        String mensaje,
        String motivo,
        String revisadoPor,
        Instant creadaEn,
        Instant revisadaEn
) {

    public record Solicitante(Long id, String nombre, String email) {
    }

    public static SolicitudVendedorResponse desde(SolicitudVendedor s) {
        return new SolicitudVendedorResponse(
                s.getId(),
                s.getEstado(),
                new Solicitante(s.getUsuario().getId(), s.getUsuario().getNombre(), s.getUsuario().getEmail()),
                s.getCiudad(),
                s.getTelefono(),
                s.getMensaje(),
                s.getMotivo(),
                s.getRevisadoPor() == null ? null : s.getRevisadoPor().getNombre(),
                s.getCreadoEn(),
                s.getRevisadoEn());
    }
}
