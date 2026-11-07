package com.gc.back.metrica.dto;

/** Promedio de estrellas y número de reseñas visibles de un mueble. */
public record Calificacion(Long muebleId, Double promedio, Long resenas) {
}
