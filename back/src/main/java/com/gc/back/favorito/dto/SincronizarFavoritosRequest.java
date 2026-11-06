package com.gc.back.favorito.dto;

import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;
import jakarta.validation.constraints.Size;

import java.util.List;

/** Favoritos guardados en el dispositivo antes de entrar; se suman a los de la cuenta. */
public record SincronizarFavoritosRequest(
        @NotNull(message = "Envía la lista de muebles")
        @Size(max = 100, message = "Se sincronizan como máximo 100 favoritos a la vez")
        List<@NotNull(message = "El id del mueble es obligatorio")
             @Positive(message = "El id del mueble no es válido") Long> muebleIds
) {
}
