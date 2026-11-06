package com.gc.back.pedido.service;

import com.gc.back.common.exception.ReglaNegocioException;
import com.gc.back.mueble.entity.Mueble;
import com.gc.back.mueble.service.ReglaBorradoMueble;
import com.gc.back.pedido.entity.EstadoPedido;
import com.gc.back.pedido.repository.PedidoRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Component;

/**
 * Un mueble con pedidos abiertos no se borra: se oculta. Con pedidos cerrados sí; esos
 * pedidos conservan nombre y precio y la base pone su mueble en null.
 */
@Component
@RequiredArgsConstructor
public class PedidosAlBorrarMueble implements ReglaBorradoMueble {

    private final PedidoRepository pedidoRepository;

    @Override
    public void validarBorrado(Mueble mueble) {
        if (pedidoRepository.existsByMuebleIdAndEstadoIn(mueble.getId(), EstadoPedido.ABIERTOS)) {
            throw new ReglaNegocioException("Este mueble tiene pedidos en curso; ocúltalo en lugar de borrarlo");
        }
    }
}
