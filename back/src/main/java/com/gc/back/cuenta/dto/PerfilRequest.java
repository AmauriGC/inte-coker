package com.gc.back.cuenta.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

/** Datos que la persona edita de su cuenta. El correo no se cambia aquí. */
public record PerfilRequest(
        @NotBlank(message = "Escribe tu nombre")
        @Size(min = 2, max = 100, message = "El nombre va de 2 a 100 caracteres")
        String nombre
) {
}
