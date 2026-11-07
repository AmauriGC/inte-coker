package com.gc.back.resena.dto;

import jakarta.validation.constraints.NotNull;

/** Moderación: ocultar o volver a mostrar una reseña. */
public record OcultarResenaRequest(
        @NotNull(message = "Indica si la reseña queda oculta")
        Boolean oculta
) {
}
