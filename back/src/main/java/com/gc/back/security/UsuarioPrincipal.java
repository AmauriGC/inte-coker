package com.gc.back.security;

import com.gc.back.rol.entity.Permiso;
import com.gc.back.rol.entity.Rol;
import com.gc.back.usuario.entity.Usuario;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.userdetails.UserDetails;

import java.util.ArrayList;
import java.util.Collection;
import java.util.List;
import java.util.Set;
import java.util.TreeSet;
import java.util.stream.Collectors;

/**
 * Usuario autenticado. Autoridades = permisos (MUEBLE_CREAR...) + roles con prefijo (ROLE_ADMIN...).
 * Se obtiene en un controller con {@code @AuthenticationPrincipal UsuarioPrincipal}.
 */
public record UsuarioPrincipal(
        Long id,
        String nombre,
        String email,
        String password,
        boolean habilitado,
        Set<String> roles,
        Set<String> permisos
) implements UserDetails {

    public static UsuarioPrincipal desde(Usuario usuario) {
        Set<String> roles = usuario.getRoles().stream()
                .map(Rol::getNombre)
                .collect(Collectors.toCollection(TreeSet::new));
        Set<String> permisos = usuario.getRoles().stream()
                .flatMap(rol -> rol.getPermisos().stream())
                .map(Permiso::getNombre)
                .collect(Collectors.toCollection(TreeSet::new));
        return new UsuarioPrincipal(usuario.getId(), usuario.getNombre(), usuario.getEmail(),
                usuario.getPassword(), usuario.puedeEntrar(), roles, permisos);
    }

    public boolean esAdmin() {
        return roles.contains("ADMIN");
    }

    @Override
    public Collection<? extends GrantedAuthority> getAuthorities() {
        List<GrantedAuthority> autoridades = new ArrayList<>();
        permisos.forEach(p -> autoridades.add(new SimpleGrantedAuthority(p)));
        roles.forEach(r -> autoridades.add(new SimpleGrantedAuthority("ROLE_" + r)));
        return autoridades;
    }

    @Override
    public String getPassword() {
        return password;
    }

    @Override
    public String getUsername() {
        return email;
    }

    @Override
    public boolean isEnabled() {
        return habilitado;
    }
}
