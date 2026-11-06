package com.gc.back.mueble.dto;

import jakarta.validation.constraints.NotNull;

public record MueblePublicacionRequest(
        @NotNull(message = "Indica si el mueble queda publicado")
        Boolean publicado
) {
}
