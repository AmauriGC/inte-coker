package com.gc.back.pedido.repository;

import com.gc.back.pedido.entity.EstadoPedido;
import com.gc.back.pedido.entity.Pedido;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.EntityGraph;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.Collection;
import java.util.Optional;

public interface PedidoRepository extends JpaRepository<Pedido, Long> {

    @EntityGraph(attributePaths = {"cliente", "vendedor", "mueble"})
    Optional<Pedido> findDetalleById(Long id);

    /** La consulta abierta de un cliente sobre un mueble (solo hay una). */
    @EntityGraph(attributePaths = {"cliente", "vendedor", "mueble"})
    Optional<Pedido> findFirstByClienteIdAndMuebleIdAndEstado(Long clienteId, Long muebleId, EstadoPedido estado);

    boolean existsByMuebleIdAndEstadoIn(Long muebleId, Collection<EstadoPedido> estados);

    long countByVendedorIdAndEstado(Long vendedorId, EstadoPedido estado);

    /** Mis compras; estado null = todos. */
    @EntityGraph(attributePaths = {"cliente", "vendedor", "mueble"})
    @Query(value = "select p from Pedido p where p.cliente.id = :usuarioId and (:estado is null or p.estado = :estado)",
            countQuery = "select count(p) from Pedido p where p.cliente.id = :usuarioId and (:estado is null or p.estado = :estado)")
    Page<Pedido> compras(@Param("usuarioId") Long usuarioId, @Param("estado") EstadoPedido estado, Pageable pageable);

    /** Pedidos de mis muebles; estado null = todos. */
    @EntityGraph(attributePaths = {"cliente", "vendedor", "mueble"})
    @Query(value = "select p from Pedido p where p.vendedor.id = :usuarioId and (:estado is null or p.estado = :estado)",
            countQuery = "select count(p) from Pedido p where p.vendedor.id = :usuarioId and (:estado is null or p.estado = :estado)")
    Page<Pedido> ventas(@Param("usuarioId") Long usuarioId, @Param("estado") EstadoPedido estado, Pageable pageable);

    /** Administrador: todos; busca por mueble, cliente, vendedor o folio. */
    @EntityGraph(attributePaths = {"cliente", "vendedor", "mueble"})
    @Query(value = """
            select p from Pedido p
            where (:estado is null or p.estado = :estado)
              and (:buscar is null or p.id = :folio
                   or lower(p.muebleNombre) like lower(concat('%', :buscar, '%'))
                   or lower(p.cliente.nombre) like lower(concat('%', :buscar, '%'))
                   or lower(p.vendedor.nombre) like lower(concat('%', :buscar, '%')))
            """,
            countQuery = """
            select count(p) from Pedido p
            where (:estado is null or p.estado = :estado)
              and (:buscar is null or p.id = :folio
                   or lower(p.muebleNombre) like lower(concat('%', :buscar, '%'))
                   or lower(p.cliente.nombre) like lower(concat('%', :buscar, '%'))
                   or lower(p.vendedor.nombre) like lower(concat('%', :buscar, '%')))
            """)
    Page<Pedido> todos(@Param("estado") EstadoPedido estado,
                       @Param("buscar") String buscar,
                       @Param("folio") Long folio,
                       Pageable pageable);

    /** Cuántas compras tienen mensajes que el cliente no ha visto (los suyos no cuentan). */
    @Query("""
            select count(p) from Pedido p where p.cliente.id = :usuarioId and exists (
              select m.id from MensajePedido m where m.pedido = p and m.id > p.leidoClienteHasta
                and (m.autor is null or m.autor.id <> :usuarioId))
            """)
    long comprasSinLeer(@Param("usuarioId") Long usuarioId);

    /** Cuántas ventas tienen mensajes que el vendedor no ha visto. */
    @Query("""
            select count(p) from Pedido p where p.vendedor.id = :usuarioId and exists (
              select m.id from MensajePedido m where m.pedido = p and m.id > p.leidoVendedorHasta
                and (m.autor is null or m.autor.id <> :usuarioId))
            """)
    long ventasSinLeer(@Param("usuarioId") Long usuarioId);
}
