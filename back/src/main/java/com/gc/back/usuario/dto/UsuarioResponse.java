package com.gc.back.usuario.dto;

import com.gc.back.config.RecursosEstaticosConfig;
import com.gc.back.rol.entity.Permiso;
import com.gc.back.rol.entity.Rol;
import com.gc.back.usuario.entity.Usuario;

import java.time.Instant;
import java.util.List;
import java.util.Map;
import java.util.TreeMap;

/**
 * Usuario para el front. permisos = todos los de sus roles (lo que valida el back).
 * permisosPorRol = los de cada rol por separado: el front los usa para el selector de rol
 * cuando la persona tiene más de uno (solo filtra la interfaz). fotoUrl: foto de la cuenta o null.
 */
public record UsuarioResponse(
        Long id,
        String nombre,
        String email,
        boolean verificado,
        boolean activo,
        List<String> roles,
        List<String> permisos,
        Map<String, List<String>> permisosPorRol,
        Instant creadoEn,
        String fotoUrl,
        String portadaUrl
) {

    public static UsuarioResponse desde(Usuario usuario) {
        List<String> roles = usuario.getRoles().stream().map(Rol::getNombre).sorted().toList();
        List<String> permisos = usuario.getRoles().stream()
                .flatMap(rol -> rol.getPermisos().stream())
                .map(Permiso::getNombre)
                .distinct()
                .sorted()
                .toList();
        Map<String, List<String>> permisosPorRol = new TreeMap<>();
        usuario.getRoles().forEach(rol -> permisosPorRol.put(rol.getNombre(),
                rol.getPermisos().stream().map(Permiso::getNombre).sorted().toList()));
        return new UsuarioResponse(
                usuario.getId(),
                usuario.getNombre(),
                usuario.getEmail(),
                usuario.isVerificado(),
                usuario.isActivo(),
                roles,
                permisos,
                permisosPorRol,
                usuario.getCreadoEn(),
                url(usuario.getFotoRuta()),
                url(usuario.getPortadaRuta())
        );
    }

    private static String url(String ruta) {
        return ruta == null ? null : RecursosEstaticosConfig.RUTA_PUBLICA + ruta;
    }
}
