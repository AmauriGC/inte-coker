package com.gc.back.metrica.repository;

import com.gc.back.metrica.dto.Calificacion;
import com.gc.back.metrica.dto.Conteo;
import com.gc.back.metrica.dto.FilaVenta;
import com.gc.back.pedido.entity.EstadoPedido;
import com.gc.back.pedido.entity.Pedido;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.Repository;
import org.springframework.data.repository.query.Param;

import java.time.Instant;
import java.time.LocalDate;
import java.util.Collection;
import java.util.List;

/** Consultas de solo lectura para las métricas (y la suma de vistas). vendedor null = toda la tienda. */
public interface MetricaRepository extends Repository<Pedido, Long> {

    /** Suma una vista del día; la fila se crea la primera vez (MySQL: on duplicate key). */
    @Modifying
    @Query(value = """
            insert into vistas_mueble (mueble_id, fecha, vistas, creado_en, actualizado_en)
            values (:mueble, :fecha, 1, :ahora, :ahora)
            on duplicate key update vistas = vistas + 1, actualizado_en = :ahora
            """, nativeQuery = true)
    void sumarVista(@Param("mueble") Long muebleId, @Param("fecha") LocalDate fecha, @Param("ahora") Instant ahora);

    @Query("""
            select new com.gc.back.metrica.dto.FilaVenta(m.id, p.muebleNombre, p.cantidad, p.total, p.ciudad,
                   p.codigoPostal, p.metodoPago, p.solicitadoEn, p.aceptadoEn, p.entregadoEn)
            from Pedido p left join p.mueble m
            where p.estado = :estado and p.entregadoEn >= :desde
              and (:vendedor is null or p.vendedor.id = :vendedor)
            """)
    List<FilaVenta> ventas(@Param("estado") EstadoPedido entregado, @Param("desde") Instant desde,
                           @Param("vendedor") Long vendedor);

    /** Pedidos solicitados en el periodo (sin contar consultas), por mueble. */
    @Query("""
            select new com.gc.back.metrica.dto.Conteo(m.id, count(p))
            from Pedido p join p.mueble m
            where p.solicitadoEn >= :desde and (:vendedor is null or p.vendedor.id = :vendedor)
            group by m.id
            """)
    List<Conteo> pedidosPorMueble(@Param("desde") Instant desde, @Param("vendedor") Long vendedor);

    @Query("""
            select count(p) from Pedido p
            where p.solicitadoEn >= :desde and (:vendedor is null or p.vendedor.id = :vendedor)
            """)
    long pedidos(@Param("desde") Instant desde, @Param("vendedor") Long vendedor);

    @Query("""
            select new com.gc.back.metrica.dto.Conteo(v.mueble.id, sum(v.vistas))
            from VistaMueble v
            where v.fecha >= :desde and (:vendedor is null or v.mueble.vendedor.id = :vendedor)
            group by v.mueble.id
            """)
    List<Conteo> vistasPorMueble(@Param("desde") LocalDate desde, @Param("vendedor") Long vendedor);

    @Query("""
            select new com.gc.back.metrica.dto.Calificacion(r.mueble.id, avg(r.estrellas), count(r))
            from Resena r where r.oculta = false and r.mueble.id in :ids
            group by r.mueble.id
            """)
    List<Calificacion> calificaciones(@Param("ids") Collection<Long> ids);

    @Query("""
            select avg(r.estrellas) from Resena r
            where r.oculta = false and r.creadoEn >= :desde
              and (:vendedor is null or r.mueble.vendedor.id = :vendedor)
            """)
    Double promedioResenas(@Param("desde") Instant desde, @Param("vendedor") Long vendedor);

    @Query("""
            select count(r) from Resena r
            where r.oculta = false and r.creadoEn >= :desde
              and (:vendedor is null or r.mueble.vendedor.id = :vendedor)
            """)
    long resenas(@Param("desde") Instant desde, @Param("vendedor") Long vendedor);
}
