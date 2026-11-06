package com.gc.back.security;

import org.springframework.boot.context.properties.ConfigurationProperties;

/**
 * Propiedades app.jwt.* (salen del .env).
 *
 * @param secret              clave HMAC en Base64, al menos 32 bytes
 * @param expirationMs        vida del access token
 * @param refreshExpirationMs vida del refresh token
 */
@ConfigurationProperties(prefix = "app.jwt")
public record JwtProperties(String secret, long expirationMs, long refreshExpirationMs) {
}
