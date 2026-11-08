package com.gc.back.transportista.dto;

import com.gc.back.usuario.entity.Usuario;

/**
 * Transportista del vendedor. invitacionPendiente = aún no pone su contraseña; enCamino =
 * entregas que lleva ahora. Solo los activos y sin invitación pendiente se pueden asignar.
 */
public record TransportistaResponse(
        Long id,
        String nombre,
        String email,
        String telefono,
        boolean activo,
        boolean invitacionPendiente,
        long enCamino
) {

    public static TransportistaResponse desde(Usuario u, long enCamino) {
        return new TransportistaResponse(u.getId(), u.getNombre(), u.getEmail(), u.getTelefono(),
                u.isActivo(), !u.isVerificado(), enCamino);
    }
}
