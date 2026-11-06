package com.gc.back.auth.exception;

import com.gc.back.common.exception.ApiException;
import org.springframework.http.HttpStatus;

/** 401: correo o contraseña incorrectos, o refresh token no válido. */
public class CredencialesInvalidasException extends ApiException {

    public CredencialesInvalidasException(String mensaje) {
        super(HttpStatus.UNAUTHORIZED, mensaje);
    }
}
