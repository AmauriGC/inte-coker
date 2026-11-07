package com.gc.back.vendedor.dto;

import jakarta.validation.constraints.NotEmpty;
import jakarta.validation.constraints.Size;

import java.util.List;

/** Ids de mis trabajos en el orden en que deben mostrarse. */
public record OrdenTrabajosRequest(
        @NotEmpty(message = "Indica el orden de los trabajos")
        @Size(max = 24, message = "La galería admite hasta 24 trabajos")
        List<Long> ids
) {
}
