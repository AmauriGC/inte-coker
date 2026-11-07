package com.gc.back.vendedor.dto;

import java.math.BigDecimal;

/**
 * Perfil público de quien vende. calificacion es el promedio (un decimal) de las reseñas
 * visibles de todos sus muebles; ventas cuenta pedidos entregados; vendeDesde es el año
 * en que creó su cuenta. propio = quien consulta es el dueño del perfil.
 */
public record PerfilVendedorResponse(
        Long id,
        String nombre,
        String slug,
        String bio,
        String ciudad,
        String fotoUrl,
        String portadaUrl,
        BigDecimal calificacion,
        long totalResenas,
        long mueblesPublicados,
        long ventas,
        long trabajos,
        int vendeDesde,
        boolean propio
) {
}
