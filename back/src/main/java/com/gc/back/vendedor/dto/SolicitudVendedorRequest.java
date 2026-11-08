package com.gc.back.vendedor.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;

/** Lo que el cliente cuenta al pedir vender. */
public record SolicitudVendedorRequest(
        @NotBlank(message = "Escribe tu ciudad")
        @Size(max = 80, message = "La ciudad admite hasta 80 caracteres")
        String ciudad,

        @NotBlank(message = "Escribe un teléfono")
        @Pattern(regexp = "^[0-9 +()-]{7,20}$", message = "Escribe un teléfono válido")
        String telefono,

        @NotBlank(message = "Cuéntanos qué muebles haces o vendes")
        @Size(min = 20, max = 500, message = "Cuéntanos entre 20 y 500 caracteres")
        String mensaje
) {
}
