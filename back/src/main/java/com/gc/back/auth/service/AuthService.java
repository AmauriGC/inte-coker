package com.gc.back.auth.service;

import com.gc.back.auth.dto.AuthResponse;
import com.gc.back.auth.dto.CorreoRequest;
import com.gc.back.auth.dto.LoginRequest;
import com.gc.back.auth.dto.RegistroRequest;
import com.gc.back.auth.dto.RestablecerPasswordRequest;
import com.gc.back.auth.dto.TokenRequest;
import com.gc.back.auth.entity.TipoTokenCorreo;
import com.gc.back.auth.exception.CredencialesInvalidasException;
import com.gc.back.auth.exception.CuentaNoDisponibleException;
import com.gc.back.correo.service.CorreoService;
import com.gc.back.notificacion.service.NotificacionService;
import com.gc.back.rol.entity.RolBase;
import com.gc.back.security.JwtService;
import com.gc.back.security.UsuarioPrincipal;
import com.gc.back.usuario.dto.UsuarioResponse;
import com.gc.back.usuario.entity.Usuario;
import com.gc.back.usuario.service.UsuarioService;
import io.jsonwebtoken.JwtException;
import lombok.RequiredArgsConstructor;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.Set;

/**
 * Registro, verificación por correo, login con JWT, refresh y recuperación de contraseña.
 * Los mensajes de "olvidé" y "reenviar" son iguales exista o no el correo, para no
 * revelar qué cuentas están registradas.
 */
@Service
@RequiredArgsConstructor
public class AuthService {

    private final UsuarioService usuarioService;
    private final TokenCorreoService tokenCorreoService;
    private final CorreoService correoService;
    private final NotificacionService notificacionService;
    private final JwtService jwtService;
    private final PasswordEncoder passwordEncoder;

    @Transactional
    public UsuarioResponse registrar(RegistroRequest request) {
        Usuario usuario = usuarioService.crear(request.nombre(), request.email(), request.password(),
                Set.of(RolBase.CLIENTE.name()), false);
        notificacionService.crear(usuario, "novedad", "Bienvenido a GC-Confort",
                "Gira cada mueble en 3D y pruébalo en tu sala con realidad aumentada.", "/catalogo");
        enviarVerificacion(usuario);
        return UsuarioResponse.desde(usuario);
    }

    @Transactional
    public void verificar(TokenRequest request) {
        Usuario usuario = tokenCorreoService.consumir(request.token(), TipoTokenCorreo.VERIFICACION);
        usuarioService.marcarVerificado(usuario);
    }

    @Transactional
    public void reenviarVerificacion(CorreoRequest request) {
        usuarioService.buscarPorEmail(request.email())
                .filter(u -> !u.isVerificado() && u.isActivo())
                .ifPresent(this::enviarVerificacion);
    }

    @Transactional(readOnly = true)
    public AuthResponse login(LoginRequest request) {
        Usuario usuario = usuarioService.buscarPorEmail(request.email())
                .filter(u -> passwordEncoder.matches(request.password(), u.getPassword()))
                .orElseThrow(() -> new CredencialesInvalidasException("Correo o contraseña incorrectos"));
        validarQuePuedeEntrar(usuario);
        return emitirTokens(usuario);
    }

    @Transactional(readOnly = true)
    public AuthResponse refrescar(TokenRequest request) {
        String email;
        try {
            email = jwtService.validarRefreshToken(request.token());
        } catch (JwtException | IllegalArgumentException ex) {
            throw new CredencialesInvalidasException("Tu sesión expiró, vuelve a entrar");
        }
        Usuario usuario = usuarioService.buscarPorEmail(email)
                .orElseThrow(() -> new CredencialesInvalidasException("Tu sesión expiró, vuelve a entrar"));
        validarQuePuedeEntrar(usuario);
        return emitirTokens(usuario);
    }

    @Transactional
    public void olvidePassword(CorreoRequest request) {
        usuarioService.buscarPorEmail(request.email())
                .filter(Usuario::isActivo)
                .ifPresent(usuario -> {
                    String token = tokenCorreoService.generar(usuario, TipoTokenCorreo.RECUPERACION);
                    correoService.enviarRecuperacion(usuario.getEmail(), usuario.getNombre(), token);
                });
    }

    /** Cambia la contraseña. Como el usuario probó que el correo es suyo, también queda verificado. */
    @Transactional
    public void restablecerPassword(RestablecerPasswordRequest request) {
        Usuario usuario = tokenCorreoService.consumir(request.token(), TipoTokenCorreo.RECUPERACION);
        usuarioService.cambiarPassword(usuario, request.password());
        if (!usuario.isVerificado()) {
            usuarioService.marcarVerificado(usuario);
        }
    }

    /** El transportista pone su contraseña con el enlace de la invitación; la cuenta queda verificada. */
    @Transactional
    public void activar(RestablecerPasswordRequest request) {
        Usuario usuario = tokenCorreoService.consumir(request.token(), TipoTokenCorreo.INVITACION);
        usuarioService.cambiarPassword(usuario, request.password());
        usuarioService.marcarVerificado(usuario);
    }

    @Transactional(readOnly = true)
    public UsuarioResponse perfil(String email) {
        return usuarioService.obtenerPerfil(email);
    }

    private void enviarVerificacion(Usuario usuario) {
        String token = tokenCorreoService.generar(usuario, TipoTokenCorreo.VERIFICACION);
        correoService.enviarVerificacion(usuario.getEmail(), usuario.getNombre(), token);
    }

    private void validarQuePuedeEntrar(Usuario usuario) {
        if (!usuario.isActivo()) {
            throw new CuentaNoDisponibleException("Tu cuenta está desactivada, contacta al administrador");
        }
        if (!usuario.isVerificado()) {
            throw new CuentaNoDisponibleException("Verifica tu correo antes de entrar");
        }
    }

    private AuthResponse emitirTokens(Usuario usuario) {
        UsuarioPrincipal principal = UsuarioPrincipal.desde(usuario);
        return new AuthResponse(
                jwtService.generarAccessToken(principal),
                jwtService.generarRefreshToken(principal),
                "Bearer",
                jwtService.expiracionAccessSegundos(),
                UsuarioResponse.desde(usuario));
    }
}
