package com.gc.back.metrica.dto;

import com.gc.back.pedido.entity.MetodoPago;

import java.math.BigDecimal;
import java.time.Instant;

/** Un pedido entregado, solo con lo que piden las métricas. muebleId es null si se borró el mueble. */
public record FilaVenta(
        Long muebleId,
        String muebleNombre,
        int cantidad,
        BigDecimal total,
        String ciudad,
        String codigoPostal,
        MetodoPago metodoPago,
        Instant solicitadoEn,
        Instant aceptadoEn,
        Instant entregadoEn
) {
}
