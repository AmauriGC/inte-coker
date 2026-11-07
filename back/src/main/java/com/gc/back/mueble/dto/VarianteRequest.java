package com.gc.back.mueble.dto;

import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;

/** Un color del mueble. id = null para un color nuevo; con id se edita el existente. */
public record VarianteRequest(
        Long id,

        @NotBlank(message = "Escribe el nombre del color")
        @Size(max = 40, message = "El nombre del color admite hasta 40 caracteres")
        String nombre,

        @NotBlank(message = "Elige el color")
        @Pattern(regexp = "^#[0-9A-Fa-f]{6}$", message = "El color debe ir como #RRGGBB")
        String hex,

        @NotNull(message = "Indica las existencias del color")
        @Min(value = 0, message = "Las existencias no pueden ser negativas")
        @Max(value = 9999, message = "Las existencias no pueden pasar de 9999")
        Integer existencias
) {
}
