package com.gc.back.auth.dto;

import com.gc.back.usuario.dto.UsuarioResponse;

/**
 * Par de tokens y datos del usuario. El front guarda los tokens y manda
 * "Authorization: Bearer accessToken" en cada petición.
 */
public record AuthResponse(
        String accessToken,
        String refreshToken,
        String tipo,
        long expiraEnSegundos,
        UsuarioResponse usuario
) {
}
