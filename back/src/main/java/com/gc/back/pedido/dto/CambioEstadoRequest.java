package com.gc.back.pedido.dto;

import com.gc.back.pedido.entity.EstadoPedido;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;

/** El motivo es obligatorio al rechazar y cuando un administrador cancela. */
public record CambioEstadoRequest(
        @NotNull(message = "El estado es obligatorio")
        EstadoPedido estado,

        @Size(max = 300, message = "El motivo admite hasta 300 caracteres")
        String motivo
) {
}
