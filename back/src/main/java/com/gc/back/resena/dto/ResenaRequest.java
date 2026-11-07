package com.gc.back.resena.dto;

import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;

/** Crear o editar mi reseña de un mueble. El texto es opcional. */
public record ResenaRequest(
        @NotNull(message = "Elige de 1 a 5 estrellas")
        @Min(value = 1, message = "Elige de 1 a 5 estrellas")
        @Max(value = 5, message = "Elige de 1 a 5 estrellas")
        Integer estrellas,

        @Size(max = 1000, message = "La reseña admite hasta 1000 caracteres")
        String texto
) {
}
