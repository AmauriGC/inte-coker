package com.gc.back.rol.dto;

import com.gc.back.rol.entity.Permiso;

public record PermisoResponse(Long id, String nombre, String descripcion) {

    public static PermisoResponse desde(Permiso permiso) {
        return new PermisoResponse(permiso.getId(), permiso.getNombre(), permiso.getDescripcion());
    }
}
