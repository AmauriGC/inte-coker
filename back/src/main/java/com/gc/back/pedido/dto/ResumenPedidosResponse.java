package com.gc.back.pedido.dto;

/**
 * Contadores para los avisos del front.
 *
 * @param comprasSinLeer   compras con mensajes nuevos del vendedor o del sistema
 * @param ventasSinLeer    ventas con mensajes nuevos del cliente o del sistema
 * @param ventasPorAtender ventas solicitadas que esperan aceptar o rechazar
 */
public record ResumenPedidosResponse(long comprasSinLeer, long ventasSinLeer, long ventasPorAtender) {
}
