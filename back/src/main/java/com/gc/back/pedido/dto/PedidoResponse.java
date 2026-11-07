package com.gc.back.pedido.dto;

import com.gc.back.config.RecursosEstaticosConfig;
import com.gc.back.mueble.entity.Mueble;
import com.gc.back.pedido.entity.EstadoPedido;
import com.gc.back.pedido.entity.Pedido;
import com.gc.back.pedido.entity.TipoEntrega;

import java.math.BigDecimal;
import java.time.Instant;
import java.util.List;

/**
 * Pedido visto por quien lo pide. lado dice desde dónde lo ve (cliente, vendedor o
 * administrador que supervisa); acciones son los estados a los que esa persona puede
 * pasarlo ahora (SOLICITADO = convertir la consulta en pedido).
 * mueble.id es null si el vendedor borró el mueble; nombre y precio son los acordados.
 */
public record PedidoResponse(
        Long id,
        String folio,
        EstadoPedido estado,
        Participante cliente,
        Participante vendedor,
        MuebleResumen mueble,
        Color color,
        BigDecimal precioUnitario,
        int cantidad,
        BigDecimal total,
        TipoEntrega tipoEntrega,
        Entrega entrega,
        String motivoCierre,
        Instant creadoEn,
        Instant solicitadoEn,
        Instant aceptadoEn,
        Instant enCaminoEn,
        Instant entregadoEn,
        Instant cerradoEn,
        Instant actividadEn,
        Lado lado,
        List<EstadoPedido> acciones,
        boolean puedeEscribir,
        long sinLeer
) {

    public enum Lado { CLIENTE, VENDEDOR, SUPERVISOR }

    public record Participante(Long id, String nombre) {
    }

    public record MuebleResumen(Long id, String nombre, String slug, String imagenUrl, Integer existencias,
                                boolean publicado) {
    }

    /** Color elegido (copia del pedido; sigue aunque el vendedor borre el color). */
    public record Color(String nombre, String hex) {
    }

    public record Entrega(String nombreRecibe, String telefono, String direccion, String ciudad, String codigoPostal) {
    }

    public static PedidoResponse desde(Pedido p, Lado lado, List<EstadoPedido> acciones, boolean puedeEscribir,
                                       long sinLeer) {
        Mueble m = p.getMueble();
        MuebleResumen mueble = m == null
                ? new MuebleResumen(null, p.getMuebleNombre(), null, null, null, false)
                : new MuebleResumen(m.getId(), p.getMuebleNombre(), m.getSlug(),
                m.getImagenRuta() == null ? null : RecursosEstaticosConfig.RUTA_PUBLICA + m.getImagenRuta(),
                m.getExistencias(), m.isPublicado());
        return new PedidoResponse(
                p.getId(), p.getFolio(), p.getEstado(),
                new Participante(p.getCliente().getId(), p.getCliente().getNombre()),
                new Participante(p.getVendedor().getId(), p.getVendedor().getNombre()),
                mueble, p.getVarianteNombre() == null ? null : new Color(p.getVarianteNombre(), p.getVarianteHex()),
                p.getPrecioUnitario(), p.getCantidad(), p.getTotal(), p.getTipoEntrega(),
                new Entrega(p.getNombreRecibe(), p.getTelefono(), p.getDireccion(), p.getCiudad(), p.getCodigoPostal()),
                p.getMotivoCierre(), p.getCreadoEn(), p.getSolicitadoEn(), p.getAceptadoEn(), p.getEnCaminoEn(),
                p.getEntregadoEn(), p.getCerradoEn(), p.getActividadEn(), lado, acciones, puedeEscribir, sinLeer);
    }
}
