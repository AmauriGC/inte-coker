package com.gc.back.common.exception;

import org.springframework.http.HttpStatus;

/** 409: ya existe un recurso con ese dato único (correo, nombre, etc.). */
public class RecursoDuplicadoException extends ApiException {

    public RecursoDuplicadoException(String mensaje) {
        super(HttpStatus.CONFLICT, mensaje);
    }
}
