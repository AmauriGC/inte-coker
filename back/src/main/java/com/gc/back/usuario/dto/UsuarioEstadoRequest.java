package com.gc.back.usuario.dto;

import jakarta.validation.constraints.NotNull;

public record UsuarioEstadoRequest(
        @NotNull(message = "Indica si la cuenta queda activa")
        Boolean activo
) {
}
