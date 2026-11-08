package com.gc.back.vendedor.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

/** Por qué se rechaza una solicitud; le llega a quien la hizo. */
public record RechazoRequest(
        @NotBlank(message = "Escribe por qué se rechaza")
        @Size(max = 300, message = "El motivo admite hasta 300 caracteres")
        String motivo
) {
}
