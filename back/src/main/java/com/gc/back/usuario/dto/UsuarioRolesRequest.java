package com.gc.back.usuario.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotEmpty;

import java.util.Set;

/** Roles que debe tener el usuario (reemplaza los anteriores). Multirol: uno o varios. */
public record UsuarioRolesRequest(
        @NotEmpty(message = "Asigna al menos un rol")
        Set<@NotBlank(message = "El nombre del rol no puede ir vacío") String> roles
) {
}
