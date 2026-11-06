package com.gc.back.mueble.dto;

import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.Size;

import java.math.BigDecimal;

/** Filtros opcionales del catálogo público (?categoriaId=&buscar=&precioMin=&precioMax=). */
public record FiltroCatalogoRequest(
        Long categoriaId,

        @Size(max = 60, message = "La búsqueda admite hasta 60 caracteres")
        String buscar,

        @DecimalMin(value = "0", message = "El precio mínimo no puede ser negativo")
        BigDecimal precioMin,

        @DecimalMin(value = "0", message = "El precio máximo no puede ser negativo")
        BigDecimal precioMax
) {
}
