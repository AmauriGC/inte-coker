package com.gc.back.correo.service;

import com.gc.back.correo.dto.AvisoCorreo;
import lombok.RequiredArgsConstructor;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Component;
import org.springframework.transaction.event.TransactionalEventListener;

/**
 * Envía los {@link AvisoCorreo} solo si la operación se guardó (después del commit) y en
 * segundo plano: la respuesta al usuario no espera a Gmail.
 */
@Component
@RequiredArgsConstructor
public class AvisosCorreoListener {

    private final CorreoService correoService;

    @Async
    @TransactionalEventListener
    public void alConfirmar(AvisoCorreo aviso) {
        correoService.enviarAviso(aviso);
    }
}
