package com.gc.back.pedido.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;

/** "Preguntar" desde el detalle del mueble. Si ya hay una consulta abierta, se agrega a ella. */
public record ConsultaRequest(
        @NotNull(message = "El mueble es obligatorio")
        Long muebleId,

        @NotBlank(message = "Escribe tu pregunta")
        @Size(max = 1000, message = "El mensaje admite hasta 1000 caracteres")
        String mensaje
) {
}
