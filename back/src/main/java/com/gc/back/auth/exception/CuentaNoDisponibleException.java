package com.gc.back.auth.exception;

import com.gc.back.common.exception.ApiException;
import org.springframework.http.HttpStatus;

/** 403: la contraseña es correcta pero la cuenta no está verificada o está desactivada. */
public class CuentaNoDisponibleException extends ApiException {

    public CuentaNoDisponibleException(String mensaje) {
        super(HttpStatus.FORBIDDEN, mensaje);
    }
}
