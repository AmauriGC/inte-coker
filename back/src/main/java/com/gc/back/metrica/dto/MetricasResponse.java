package com.gc.back.metrica.dto;

import com.gc.back.pedido.entity.MetodoPago;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;
import java.util.Map;

/**
 * Métricas de un periodo. tienda = true: toda la tienda (administración); si no, solo los
 * muebles de quien consulta. Las ventas son pedidos ENTREGADOS en el periodo; los pedidos,
 * los que se solicitaron en el periodo (para la conversión contra vistas).
 */
public record MetricasResponse(
        Periodo periodo,
        Resumen resumen,
        List<Punto> serie,
        List<Zona> ciudades,
        List<Zona> codigosPostales,
        List<MuebleMetrica> muebles,
        Map<MetodoPago, Long> pagos
) {

    /** agrupacion: DIA (hasta 31 días) o SEMANA (empieza en lunes). */
    public record Periodo(LocalDate desde, LocalDate hasta, int dias, boolean tienda, String agrupacion) {
    }

    /**
     * conversion = pedidos / vistas en porcentaje (null sin vistas). Horas promedio de
     * solicitado a aceptado y de aceptado a entregado. calificacion: reseñas nuevas del periodo.
     */
    public record Resumen(long ventas, long piezas, BigDecimal ingresos, BigDecimal ticketPromedio, long pedidos,
                          long vistas, Double conversion, Double horasAceptacion, Double horasEntrega,
                          Double calificacion, long resenas) {
    }

    public record Punto(LocalDate inicio, long ventas, BigDecimal ingresos) {
    }

    /** Ciudad (detalle null) o código postal (detalle = ciudad). */
    public record Zona(String nombre, String detalle, long ventas, long piezas, BigDecimal ingresos) {
    }

    /** calificacion y resenas son históricas (todas las reseñas visibles del mueble). */
    public record MuebleMetrica(Long id, String nombre, String slug, long vendidos, BigDecimal ingresos, long pedidos,
                                long vistas, Double conversion, Double calificacion, long resenas) {
    }
}
