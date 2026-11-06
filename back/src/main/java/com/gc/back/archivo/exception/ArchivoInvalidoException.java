package com.gc.back.archivo.exception;

import com.gc.back.common.exception.ApiException;
import org.springframework.http.HttpStatus;

/** 400: archivo vacío, muy pesado o con un formato que no se acepta. */
public class ArchivoInvalidoException extends ApiException {

    public ArchivoInvalidoException(String mensaje) {
        super(HttpStatus.BAD_REQUEST, mensaje);
    }
}
