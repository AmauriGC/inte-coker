package com.gc.back.cuenta.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;

/** predeterminada = true la vuelve la primera opción al pedir (las demás dejan de serlo). */
public record DireccionRequest(
        @NotBlank(message = "Ponle un nombre, como Casa u Oficina")
        @Size(max = 40, message = "El nombre admite hasta 40 caracteres")
        String alias,

        @NotBlank(message = "Escribe quién recibe")
        @Size(max = 100, message = "El nombre admite hasta 100 caracteres")
        String nombreRecibe,

        @NotBlank(message = "Escribe un teléfono")
        @Pattern(regexp = "^[0-9 +()-]{7,20}$", message = "Escribe un teléfono válido")
        String telefono,

        @NotBlank(message = "Escribe la dirección")
        @Size(max = 255, message = "La dirección admite hasta 255 caracteres")
        String direccion,

        @NotBlank(message = "Escribe la ciudad")
        @Size(max = 80, message = "La ciudad admite hasta 80 caracteres")
        String ciudad,

        @NotBlank(message = "Escribe el código postal")
        @Pattern(regexp = "^[0-9]{5}$", message = "El código postal tiene 5 dígitos")
        String codigoPostal,

        Boolean predeterminada
) {
}
