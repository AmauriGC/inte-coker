package com.gc.back.pedido.repository;

import com.gc.back.pedido.dto.ConteoSinLeer;
import com.gc.back.pedido.entity.MensajePedido;
import org.springframework.data.jpa.repository.EntityGraph;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.Collection;
import java.util.List;
import java.util.Optional;

public interface MensajePedidoRepository extends JpaRepository<MensajePedido, Long> {

    /** Los más recientes (al abrir la conversación); el service los voltea a orden cronológico. */
    @EntityGraph(attributePaths = "autor")
    List<MensajePedido> findTop200ByPedidoIdOrderByIdDesc(Long pedidoId);

    /** Los nuevos desde el último que tiene el front (consulta periódica). */
    @EntityGraph(attributePaths = "autor")
    List<MensajePedido> findTop200ByPedidoIdAndIdGreaterThanOrderByIdAsc(Long pedidoId, Long despuesDe);

    @Query("select max(m.id) from MensajePedido m where m.pedido.id = :pedidoId")
    Optional<Long> ultimoId(@Param("pedidoId") Long pedidoId);

    /** No leídos por pedido para el cliente: mensajes después de su marca que no escribió él. */
    @Query("""
            select new com.gc.back.pedido.dto.ConteoSinLeer(p.id, count(m)) from MensajePedido m join m.pedido p
            where p.id in :ids and m.id > p.leidoClienteHasta and (m.autor is null or m.autor.id <> p.cliente.id)
            group by p.id
            """)
    List<ConteoSinLeer> sinLeerCliente(@Param("ids") Collection<Long> ids);

    /** No leídos por pedido para el vendedor. */
    @Query("""
            select new com.gc.back.pedido.dto.ConteoSinLeer(p.id, count(m)) from MensajePedido m join m.pedido p
            where p.id in :ids and m.id > p.leidoVendedorHasta and (m.autor is null or m.autor.id <> p.vendedor.id)
            group by p.id
            """)
    List<ConteoSinLeer> sinLeerVendedor(@Param("ids") Collection<Long> ids);
}
