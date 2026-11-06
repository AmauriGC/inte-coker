package com.gc.back.auth.exception;

import com.gc.back.common.exception.ApiException;
import org.springframework.http.HttpStatus;

/** 400: el enlace del correo no existe, ya se usó o caducó. */
public class TokenInvalidoException extends ApiException {

    public TokenInvalidoException() {
        super(HttpStatus.BAD_REQUEST, "El enlace no es válido o ya caducó, pide uno nuevo");
    }
}
