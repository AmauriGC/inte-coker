package com.gc.back.common.response;

import com.fasterxml.jackson.annotation.JsonInclude;

import java.time.Instant;
import java.util.Map;

/**
 * Envoltura única de todas las respuestas de la API.
 *
 * @param exito   true si la operación salió bien
 * @param mensaje texto en español para mostrar al usuario
 * @param datos   carga útil; se omite si es null
 * @param errores errores por campo (validaciones); se omite si es null
 * @param fecha   momento de la respuesta
 */
@JsonInclude(JsonInclude.Include.NON_NULL)
public record ApiResponse<T>(
        boolean exito,
        String mensaje,
        T datos,
        Map<String, String> errores,
        Instant fecha
) {

    public static <T> ApiResponse<T> ok(String mensaje, T datos) {
        return new ApiResponse<>(true, mensaje, datos, null, Instant.now());
    }

    public static ApiResponse<Void> ok(String mensaje) {
        return new ApiResponse<>(true, mensaje, null, null, Instant.now());
    }

    public static ApiResponse<Void> error(String mensaje) {
        return new ApiResponse<>(false, mensaje, null, null, Instant.now());
    }

    public static ApiResponse<Void> error(String mensaje, Map<String, String> errores) {
        return new ApiResponse<>(false, mensaje, null, errores, Instant.now());
    }
}
