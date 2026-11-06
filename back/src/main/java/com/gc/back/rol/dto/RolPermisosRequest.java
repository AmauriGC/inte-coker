package com.gc.back.rol.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;

import java.util.Set;

/**
 * Lista completa de permisos que debe quedar en el rol (reemplaza a la anterior).
 * Puede ir vacía para dejar al rol sin permisos.
 */
public record RolPermisosRequest(
        @NotNull(message = "Envía la lista de permisos, aunque sea vacía")
        Set<@NotBlank(message = "El nombre del permiso no puede ir vacío") String> permisos
) {
}
