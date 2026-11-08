package com.gc.back.cuenta.dto;

import com.gc.back.auth.dto.PoliticaPassword;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;

/** Cambiar la contraseña con la sesión abierta: pide la actual para confirmar que es la persona. */
public record CambiarPasswordRequest(
        @NotBlank(message = "Escribe tu contraseña actual")
        String actual,

        @NotBlank(message = "Escribe la nueva contraseña")
        @Size(min = 8, max = 72, message = "La contraseña debe tener entre 8 y 72 caracteres")
        @Pattern(regexp = PoliticaPassword.REGEX, message = PoliticaPassword.MENSAJE)
        String nueva,

        @NotBlank(message = "Confirma la nueva contraseña")
        String confirmacion
) {
}
