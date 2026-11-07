package com.gc.back.vendedor.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

/** Título y descripción de un trabajo de la galería (la imagen viaja aparte, en multipart). */
public record TrabajoRequest(
        @NotBlank(message = "Escribe un título")
        @Size(max = 80, message = "El título admite hasta 80 caracteres")
        String titulo,

        @Size(max = 280, message = "La descripción admite hasta 280 caracteres")
        String descripcion
) {
}
