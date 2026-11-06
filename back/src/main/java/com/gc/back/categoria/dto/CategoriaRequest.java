package com.gc.back.categoria.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

public record CategoriaRequest(
        @NotBlank(message = "El nombre es obligatorio")
        @Size(max = 60, message = "El nombre admite hasta 60 caracteres")
        String nombre,

        @Size(max = 255, message = "La descripción admite hasta 255 caracteres")
        String descripcion
) {
}
