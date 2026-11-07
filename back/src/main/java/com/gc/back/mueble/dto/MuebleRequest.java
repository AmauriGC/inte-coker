package com.gc.back.mueble.dto;

import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.Digits;
import jakarta.validation.Valid;
import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;

import java.math.BigDecimal;
import java.util.List;

/** Datos del mueble. Los archivos se suben aparte y la publicación se cambia aparte. */
public record MuebleRequest(
        @NotBlank(message = "El nombre es obligatorio")
        @Size(max = 120, message = "El nombre admite hasta 120 caracteres")
        String nombre,

        @Size(max = 2000, message = "La descripción admite hasta 2000 caracteres")
        String descripcion,

        @NotNull(message = "El precio es obligatorio")
        @DecimalMin(value = "0.01", message = "El precio debe ser mayor que cero")
        @Digits(integer = 8, fraction = 2, message = "El precio admite hasta 8 enteros y 2 decimales")
        BigDecimal precio,

        @NotNull(message = "El ancho es obligatorio")
        @Min(value = 1, message = "El ancho debe ser de al menos 1 cm")
        @Max(value = 1000, message = "El ancho no puede pasar de 1000 cm")
        Integer anchoCm,

        @NotNull(message = "El fondo es obligatorio")
        @Min(value = 1, message = "El fondo debe ser de al menos 1 cm")
        @Max(value = 1000, message = "El fondo no puede pasar de 1000 cm")
        Integer fondoCm,

        @NotNull(message = "El alto es obligatorio")
        @Min(value = 1, message = "El alto debe ser de al menos 1 cm")
        @Max(value = 1000, message = "El alto no puede pasar de 1000 cm")
        Integer altoCm,

        @Size(max = 255, message = "Los materiales admiten hasta 255 caracteres")
        String materiales,

        @NotNull(message = "Las existencias son obligatorias")
        @Min(value = 0, message = "Las existencias no pueden ser negativas")
        @Max(value = 9999, message = "Las existencias no pueden pasar de 9999")
        Integer existencias,

        @NotNull(message = "La categoría es obligatoria")
        Long categoriaId,

        /** Colores en existencia; vacío o null = el mueble no se vende por color. */
        @Valid
        @Size(max = 8, message = "Un mueble admite hasta 8 colores")
        List<VarianteRequest> variantes
) {
}
