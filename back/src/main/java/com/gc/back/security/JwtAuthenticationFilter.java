package com.gc.back.security;

import io.jsonwebtoken.ExpiredJwtException;
import io.jsonwebtoken.JwtException;
import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpHeaders;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.context.SecurityContext;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.security.web.authentication.WebAuthenticationDetailsSource;
import org.springframework.web.filter.OncePerRequestFilter;

import java.io.IOException;

/**
 * Lee "Authorization: Bearer <token>", lo valida y autentica al usuario.
 * Si el token falla no corta la petición: deja el motivo en un atributo y la ruta
 * protegida termina en ManejadorErroresSeguridad con 401.
 * No es @Component a propósito: solo vive dentro de la cadena de seguridad.
 */
@RequiredArgsConstructor
public class JwtAuthenticationFilter extends OncePerRequestFilter {

    public static final String ATRIBUTO_ERROR = "jwt.error";
    private static final String PREFIJO = "Bearer ";

    private final JwtService jwtService;
    private final UserDetailsService userDetailsService;

    @Override
    protected void doFilterInternal(HttpServletRequest request, HttpServletResponse response, FilterChain chain)
            throws ServletException, IOException {
        String cabecera = request.getHeader(HttpHeaders.AUTHORIZATION);
        if (cabecera != null && cabecera.startsWith(PREFIJO)) {
            autenticar(cabecera.substring(PREFIJO.length()).trim(), request);
        }
        chain.doFilter(request, response);
    }

    private void autenticar(String token, HttpServletRequest request) {
        try {
            String email = jwtService.validarAccessToken(token);
            UserDetails usuario = userDetailsService.loadUserByUsername(email);
            if (!usuario.isEnabled()) {
                request.setAttribute(ATRIBUTO_ERROR, "Tu cuenta no está disponible");
                return;
            }
            UsernamePasswordAuthenticationToken autenticacion =
                    UsernamePasswordAuthenticationToken.authenticated(usuario, null, usuario.getAuthorities());
            autenticacion.setDetails(new WebAuthenticationDetailsSource().buildDetails(request));
            SecurityContext contexto = SecurityContextHolder.createEmptyContext();
            contexto.setAuthentication(autenticacion);
            SecurityContextHolder.setContext(contexto);
        } catch (ExpiredJwtException ex) {
            request.setAttribute(ATRIBUTO_ERROR, "Tu sesión expiró, vuelve a entrar");
        } catch (JwtException | IllegalArgumentException | UsernameNotFoundException ex) {
            request.setAttribute(ATRIBUTO_ERROR, "El token no es válido");
        }
    }
}
