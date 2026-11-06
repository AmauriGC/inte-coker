package com.gc.back.auth.dto;

import jakarta.validation.constraints.NotBlank;

/** Token del enlace de verificación o el refresh token. */
public record TokenRequest(
        @NotBlank(message = "El token es obligatorio")
        String token
) {
}
