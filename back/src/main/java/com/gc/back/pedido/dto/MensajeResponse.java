package com.gc.back.pedido.dto;

import com.gc.back.pedido.entity.MensajePedido;
import com.gc.back.pedido.entity.Pedido;

import java.time.Instant;

/** Mensaje de la conversación. autor = SISTEMA en los cambios de estado (sin autorId). */
public record MensajeResponse(
        Long id,
        String texto,
        Autor autor,
        Long autorId,
        String autorNombre,
        Instant creadoEn
) {

    public enum Autor { CLIENTE, VENDEDOR, SISTEMA }

    public static MensajeResponse desde(MensajePedido m, Pedido pedido) {
        if (m.getAutor() == null) {
            return new MensajeResponse(m.getId(), m.getTexto(), Autor.SISTEMA, null, null, m.getCreadoEn());
        }
        Autor autor = m.getAutor().getId().equals(pedido.getCliente().getId()) ? Autor.CLIENTE : Autor.VENDEDOR;
        return new MensajeResponse(m.getId(), m.getTexto(), autor, m.getAutor().getId(), m.getAutor().getNombre(),
                m.getCreadoEn());
    }
}
