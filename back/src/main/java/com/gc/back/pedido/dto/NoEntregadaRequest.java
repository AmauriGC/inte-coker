package com.gc.back.pedido.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

/** El transportista no pudo entregar: el motivo llega a la conversación del pedido. */
public record NoEntregadaRequest(
        @NotBlank(message = "Escribe por qué no se pudo entregar")
        @Size(max = 300, message = "El motivo admite hasta 300 caracteres")
        String motivo
) {
}
