package com.gc.back.security;

import com.gc.back.usuario.service.UsuarioService;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

/** Carga el usuario por correo en cada petición con token. */
@Service
@RequiredArgsConstructor
public class UsuarioDetailsService implements UserDetailsService {

    private final UsuarioService usuarioService;

    @Override
    @Transactional(readOnly = true)
    public UserDetails loadUserByUsername(String email) {
        return usuarioService.buscarPorEmail(email)
                .map(UsuarioPrincipal::desde)
                .orElseThrow(() -> new UsernameNotFoundException("El usuario no existe"));
    }
}
