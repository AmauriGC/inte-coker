package com.gc.back.pedido.dto;

import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.Digits;
import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotNull;

import java.math.BigDecimal;

/** El vendedor confirma que recibió el anticipo y da el plazo para liquidar (1 a 30 días). */
public record ConfirmarApartadoRequest(
        @NotNull(message = "Escribe el anticipo que recibiste")
        @DecimalMin(value = "0.01", message = "El anticipo debe ser mayor que cero")
        @Digits(integer = 10, fraction = 2, message = "El anticipo admite hasta dos decimales")
        BigDecimal anticipo,

        @NotNull(message = "Indica cuántos días tiene para liquidar")
        @Min(value = 1, message = "El plazo es de al menos un día")
        @Max(value = 30, message = "El plazo es de hasta 30 días")
        Integer dias
) {
}
