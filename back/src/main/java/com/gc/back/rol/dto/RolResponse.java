package com.gc.back.rol.dto;

import com.gc.back.rol.entity.Permiso;
import com.gc.back.rol.entity.Rol;

import java.util.List;

public record RolResponse(Long id, String nombre, String descripcion, List<String> permisos) {

    public static RolResponse desde(Rol rol) {
        List<String> permisos = rol.getPermisos().stream()
                .map(Permiso::getNombre)
                .sorted()
                .toList();
        return new RolResponse(rol.getId(), rol.getNombre(), rol.getDescripcion(), permisos);
    }
}
