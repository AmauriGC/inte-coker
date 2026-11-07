package com.gc.back.resena.exception;

import com.gc.back.common.exception.ApiException;
import org.springframework.http.HttpStatus;

/** 403: reseñar sin haber recibido el mueble, o responder una reseña de un mueble ajeno. */
public class ResenaNoPermitidaException extends ApiException {

    public ResenaNoPermitidaException(String mensaje) {
        super(HttpStatus.FORBIDDEN, mensaje);
    }
}
