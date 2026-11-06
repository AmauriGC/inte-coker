package com.gc.back.mueble.exception;

import com.gc.back.common.exception.ApiException;
import org.springframework.http.HttpStatus;

/** 403: un vendedor intenta modificar un mueble que no es suyo. */
public class MuebleAjenoException extends ApiException {

    public MuebleAjenoException() {
        super(HttpStatus.FORBIDDEN, "Solo puedes modificar tus propios muebles");
    }
}
