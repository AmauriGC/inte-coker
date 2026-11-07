package com.gc.back.pedido.dto;

import com.gc.back.config.RecursosEstaticosConfig;
import com.gc.back.mueble.entity.Mueble;
import com.gc.back.pedido.entity.EstadoPedido;
import com.gc.back.pedido.entity.MetodoPago;
import com.gc.back.pedido.entity.Pedido;
import com.gc.back.pedido.service.PedidoService;

import java.math.BigDecimal;
import java.time.Instant;

/**
 * Pedido visto por el transportista. La dirección y el teléfono solo llegan mientras el
 * pedido va EN_CAMINO; al cerrarse, entrega es null para no dejar datos personales a la vista.
 * porCobrar es 0 cuando el cliente ya pagó (apartado liquidado).
 */
public record EntregaResponse(
        Long id,
        String folio,
        EstadoPedido estado,
        String mueble,
        String imagenUrl,
        PedidoResponse.Color color,
        int cantidad,
        BigDecimal total,
        BigDecimal porCobrar,
        MetodoPago metodoPago,
        String vendedor,
        PedidoResponse.Entrega entrega,
        String motivoCierre,
        Instant asignadoEn,
        Instant entregadoEn,
        Instant cobradoEn
) {

    public static EntregaResponse desde(Pedido p) {
        Mueble m = p.getMueble();
        String imagen = m == null || m.getImagenRuta() == null ? null : RecursosEstaticosConfig.RUTA_PUBLICA + m.getImagenRuta();
        PedidoResponse.Entrega entrega = p.getEstado() != EstadoPedido.EN_CAMINO ? null
                : new PedidoResponse.Entrega(p.getNombreRecibe(), p.getTelefono(), p.getDireccion(), p.getCiudad(),
                p.getCodigoPostal());
        return new EntregaResponse(p.getId(), p.getFolio(), p.getEstado(), p.getMuebleNombre(), imagen,
                p.getVarianteNombre() == null ? null : new PedidoResponse.Color(p.getVarianteNombre(), p.getVarianteHex()),
                p.getCantidad(), p.getTotal(), PedidoService.porCobrar(p), p.getMetodoPago(), p.getVendedor().getNombre(),
                entrega, p.getMotivoCierre(), p.getAsignadoEn(), p.getEntregadoEn(), p.getCobradoEn());
    }
}
