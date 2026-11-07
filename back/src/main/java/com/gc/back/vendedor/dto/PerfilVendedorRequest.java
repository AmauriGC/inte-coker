package com.gc.back.vendedor.dto;

import jakarta.validation.constraints.Size;

/** Datos públicos que el vendedor edita en "Mi perfil". Vacío = quitar el dato. */
public record PerfilVendedorRequest(
        @Size(max = 280, message = "La presentación admite hasta 280 caracteres")
        String bio,

        @Size(max = 80, message = "La ciudad admite hasta 80 caracteres")
        String ciudad
) {
}
