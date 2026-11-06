package com.gc.back.security;

import io.jsonwebtoken.Claims;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.MalformedJwtException;
import io.jsonwebtoken.io.Decoders;
import io.jsonwebtoken.security.Keys;
import org.springframework.stereotype.Service;

import javax.crypto.SecretKey;
import java.time.Instant;
import java.util.Date;
import java.util.UUID;

/**
 * Genera y valida los JWT. Dos tipos, distinguidos por el claim "tipo":
 * access (va en cada petición) y refresh (solo sirve para pedir un par nuevo).
 */
@Service
public class JwtService {

    private static final String CLAIM_TIPO = "tipo";
    private static final String TIPO_ACCESS = "access";
    private static final String TIPO_REFRESH = "refresh";

    private final JwtProperties propiedades;
    private final SecretKey clave;

    public JwtService(JwtProperties propiedades) {
        if (propiedades.secret() == null || propiedades.secret().isBlank()) {
            throw new IllegalStateException("Falta JWT_SECRET en el .env");
        }
        byte[] bytes = Decoders.BASE64.decode(propiedades.secret());
        if (bytes.length < 32) {
            throw new IllegalStateException("JWT_SECRET debe tener al menos 32 bytes en Base64");
        }
        this.propiedades = propiedades;
        this.clave = Keys.hmacShaKeyFor(bytes);
    }

    public String generarAccessToken(UsuarioPrincipal usuario) {
        Instant ahora = Instant.now();
        return Jwts.builder()
                .subject(usuario.email())
                .claim(CLAIM_TIPO, TIPO_ACCESS)
                .claim("uid", usuario.id())
                .claim("nombre", usuario.nombre())
                .claim("roles", usuario.roles())
                .claim("permisos", usuario.permisos())
                .issuedAt(Date.from(ahora))
                .expiration(Date.from(ahora.plusMillis(propiedades.expirationMs())))
                .signWith(clave)
                .compact();
    }

    public String generarRefreshToken(UsuarioPrincipal usuario) {
        Instant ahora = Instant.now();
        return Jwts.builder()
                .id(UUID.randomUUID().toString())
                .subject(usuario.email())
                .claim(CLAIM_TIPO, TIPO_REFRESH)
                .issuedAt(Date.from(ahora))
                .expiration(Date.from(ahora.plusMillis(propiedades.refreshExpirationMs())))
                .signWith(clave)
                .compact();
    }

    /** Devuelve el correo del access token o lanza JwtException. */
    public String validarAccessToken(String token) {
        return leer(token, TIPO_ACCESS).getSubject();
    }

    /** Devuelve el correo del refresh token o lanza JwtException. */
    public String validarRefreshToken(String token) {
        return leer(token, TIPO_REFRESH).getSubject();
    }

    public long expiracionAccessSegundos() {
        return propiedades.expirationMs() / 1000;
    }

    private Claims leer(String token, String tipoEsperado) {
        Claims claims = Jwts.parser().verifyWith(clave).build().parseSignedClaims(token).getPayload();
        if (!tipoEsperado.equals(claims.get(CLAIM_TIPO, String.class))) {
            throw new MalformedJwtException("Tipo de token incorrecto");
        }
        return claims;
    }
}
