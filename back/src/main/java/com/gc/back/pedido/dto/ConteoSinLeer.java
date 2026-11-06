package com.gc.back.pedido.dto;

/** Mensajes sin leer de un pedido (resultado de consulta, no sale al front). */
public record ConteoSinLeer(Long pedidoId, long total) {
}
