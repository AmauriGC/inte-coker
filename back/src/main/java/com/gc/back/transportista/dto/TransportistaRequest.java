package com.gc.back.transportista.dto;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;

/** Datos con los que el vendedor registra a un transportista. */
public record TransportistaRequest(
        @NotBlank(message = "Escribe su nombre")
        @Size(max = 100, message = "El nombre admite hasta 100 caracteres")
        String nombre,

        @NotBlank(message = "Escribe su correo")
        @Email(message = "Escribe un correo válido")
        @Size(max = 150, message = "El correo admite hasta 150 caracteres")
        String email,

        @NotBlank(message = "Escribe su teléfono")
        @Pattern(regexp = "^[0-9 +()-]{7,20}$", message = "Escribe un teléfono válido")
        String telefono
) {
}
