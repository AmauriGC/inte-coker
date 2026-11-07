package com.gc.back.pedido.dto;

/** Transportista para elegir al enviar; enCamino = entregas que lleva ahora. */
public record TransportistaResponse(Long id, String nombre, long enCamino) {
}
