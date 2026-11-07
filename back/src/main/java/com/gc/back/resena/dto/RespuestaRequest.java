package com.gc.back.resena.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

/** Respuesta del vendedor a una reseña (se puede corregir). */
public record RespuestaRequest(
        @NotBlank(message = "Escribe la respuesta")
        @Size(max = 1000, message = "La respuesta admite hasta 1000 caracteres")
        String texto
) {
}
