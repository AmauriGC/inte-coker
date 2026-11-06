package com.gc.back.pedido.exception;

import com.gc.back.common.exception.ApiException;
import org.springframework.http.HttpStatus;

/** 403: la persona ve el pedido, pero esa acción le toca a otro lado (cliente, vendedor o admin). */
public class AccionPedidoNoPermitidaException extends ApiException {

    public AccionPedidoNoPermitidaException(String mensaje) {
        super(HttpStatus.FORBIDDEN, mensaje);
    }
}
