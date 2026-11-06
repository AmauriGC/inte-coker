package com.gc.back.auth.dto;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;

/** Solo un correo: reenviar verificación y olvidé mi contraseña. */
public record CorreoRequest(
        @NotBlank(message = "El correo es obligatorio")
        @Email(message = "El correo no es válido")
        String email
) {
}
