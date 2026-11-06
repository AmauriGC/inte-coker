package com.gc.back.common.exception;

import org.springframework.http.HttpStatus;

/**
 * Base de las excepciones de negocio. Cada una trae su estado HTTP y un mensaje
 * en español; GlobalExceptionHandler las convierte en ApiResponse.
 * Los módulos crean las suyas extendiendo esta clase.
 */
public abstract class ApiException extends RuntimeException {

    private final HttpStatus estado;

    protected ApiException(HttpStatus estado, String mensaje) {
        super(mensaje);
        this.estado = estado;
    }

    public HttpStatus getEstado() {
        return estado;
    }
}
