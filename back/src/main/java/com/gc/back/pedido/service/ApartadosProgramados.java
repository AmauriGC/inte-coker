package com.gc.back.pedido.service;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;

import java.time.Instant;

/**
 * Cada hora (propiedad app.apartados.revision-ms) vence los apartados pasados de fecha, devuelve sus
 * existencias y avisa a quien tiene uno por vencer en las próximas 24 horas.
 */
@Slf4j
@Component
@RequiredArgsConstructor
public class ApartadosProgramados {

    private final PedidoService pedidoService;

    @Scheduled(initialDelayString = "${app.apartados.revision-inicial-ms:60000}",
            fixedDelayString = "${app.apartados.revision-ms:3600000}")
    public void revisar() {
        Instant ahora = Instant.now();
        int vencidos = pedidoService.vencerApartados(ahora);
        int avisados = pedidoService.avisarApartadosPorVencer(ahora);
        if (vencidos + avisados > 0) {
            log.info("Apartados: {} vencidos, {} avisos de vencimiento", vencidos, avisados);
        }
    }
}
