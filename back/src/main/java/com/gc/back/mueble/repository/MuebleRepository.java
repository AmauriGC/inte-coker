package com.gc.back.mueble.repository;

import com.gc.back.mueble.entity.Mueble;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.EntityGraph;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.math.BigDecimal;
import java.util.Collection;
import java.util.List;
import java.util.Optional;

public interface MuebleRepository extends JpaRepository<Mueble, Long> {

    boolean existsBySlug(String slug);

    boolean existsBySlugAndIdNot(String slug, Long id);

    @EntityGraph(attributePaths = {"categoria", "vendedor"})
    Optional<Mueble> findBySlug(String slug);

    @EntityGraph(attributePaths = {"categoria", "vendedor"})
    Optional<Mueble> findWithRelacionesById(Long id);

    @EntityGraph(attributePaths = {"categoria", "vendedor"})
    List<Mueble> findAllByIdInAndPublicadoTrue(Collection<Long> ids);

    /** Descuenta solo si alcanzan, en una sola sentencia (dos pedidos a la vez no dejan negativo). */
    @Modifying
    @Query("update Mueble m set m.existencias = m.existencias - :cantidad where m.id = :id and m.existencias >= :cantidad")
    int descontarExistencias(@Param("id") Long id, @Param("cantidad") int cantidad);

    @Modifying
    @Query("update Mueble m set m.existencias = least(m.existencias + :cantidad, 9999) where m.id = :id")
    int devolverExistencias(@Param("id") Long id, @Param("cantidad") int cantidad);

    @Query("select m.existencias from Mueble m where m.id = :id")
    Optional<Integer> existenciasDe(@Param("id") Long id);

    /** Catálogo público: solo publicados; cada filtro se ignora si llega null. */
    @EntityGraph(attributePaths = {"categoria", "vendedor"})
    @Query(value = """
            select m from Mueble m
            where m.publicado = true
              and (:categoriaId is null or m.categoria.id = :categoriaId)
              and (:buscar is null or lower(m.nombre) like lower(concat('%', :buscar, '%')))
              and (:precioMin is null or m.precio >= :precioMin)
              and (:precioMax is null or m.precio <= :precioMax)
            """,
            countQuery = """
            select count(m) from Mueble m
            where m.publicado = true
              and (:categoriaId is null or m.categoria.id = :categoriaId)
              and (:buscar is null or lower(m.nombre) like lower(concat('%', :buscar, '%')))
              and (:precioMin is null or m.precio >= :precioMin)
              and (:precioMax is null or m.precio <= :precioMax)
            """)
    Page<Mueble> buscarPublicados(@Param("categoriaId") Long categoriaId,
                                  @Param("buscar") String buscar,
                                  @Param("precioMin") BigDecimal precioMin,
                                  @Param("precioMax") BigDecimal precioMax,
                                  Pageable pageable);

    /** Panel: publicados y borradores; vendedorId null = todos (administrador). */
    @EntityGraph(attributePaths = {"categoria", "vendedor"})
    @Query(value = """
            select m from Mueble m
            where (:vendedorId is null or m.vendedor.id = :vendedorId)
              and (:buscar is null or lower(m.nombre) like lower(concat('%', :buscar, '%')))
            """,
            countQuery = """
            select count(m) from Mueble m
            where (:vendedorId is null or m.vendedor.id = :vendedorId)
              and (:buscar is null or lower(m.nombre) like lower(concat('%', :buscar, '%')))
            """)
    Page<Mueble> buscarGestion(@Param("vendedorId") Long vendedorId,
                               @Param("buscar") String buscar,
                               Pageable pageable);
}
