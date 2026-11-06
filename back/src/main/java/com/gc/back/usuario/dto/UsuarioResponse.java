package com.gc.back.usuario.dto;

import com.gc.back.rol.entity.Permiso;
import com.gc.back.rol.entity.Rol;
import com.gc.back.usuario.entity.Usuario;

import java.time.Instant;
import java.util.List;

public record UsuarioResponse(
        Long id,
        String nombre,
        String email,
        boolean verificado,
        boolean activo,
        List<String> roles,
        List<String> permisos,
        Instant creadoEn
) {

    public static UsuarioResponse desde(Usuario usuario) {
        List<String> roles = usuario.getRoles().stream().map(Rol::getNombre).sorted().toList();
        List<String> permisos = usuario.getRoles().stream()
                .flatMap(rol -> rol.getPermisos().stream())
                .map(Permiso::getNombre)
                .distinct()
                .sorted()
                .toList();
        return new UsuarioResponse(
                usuario.getId(),
                usuario.getNombre(),
                usuario.getEmail(),
                usuario.isVerificado(),
                usuario.isActivo(),
                roles,
                permisos,
                usuario.getCreadoEn()
        );
    }
}
