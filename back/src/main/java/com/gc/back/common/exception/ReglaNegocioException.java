package com.gc.back.common.exception;

import org.springframework.http.HttpStatus;

/** 400: la petición es válida en forma pero rompe una regla de negocio. */
public class ReglaNegocioException extends ApiException {

    public ReglaNegocioException(String mensaje) {
        super(HttpStatus.BAD_REQUEST, mensaje);
    }
}
