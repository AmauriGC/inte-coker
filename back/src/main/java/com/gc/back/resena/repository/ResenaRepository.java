package com.gc.back.resena.repository;

import com.gc.back.resena.entity.Resena;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.EntityGraph;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;
import java.util.Optional;

public interface ResenaRepository extends JpaRepository<Resena, Long> {

    /** Cuántas reseñas visibles hay de cada número de estrellas. */
    interface ConteoEstrellas {
        int getEstrellas();

        long getTotal();
    }

    @EntityGraph(attributePaths = {"cliente"})
    Optional<Resena> findByClienteIdAndMuebleId(Long clienteId, Long muebleId);

    @EntityGraph(attributePaths = {"cliente", "mueble", "mueble.vendedor"})
    Optional<Resena> findDetalleById(Long id);

    /** Reseñas visibles de un mueble; estrellas null = todas. */
    @EntityGraph(attributePaths = {"cliente"})
    @Query("""
            select r from Resena r
            where r.mueble.id = :muebleId and r.oculta = false
              and (:estrellas is null or r.estrellas = :estrellas)
            """)
    Page<Resena> visibles(@Param("muebleId") Long muebleId, @Param("estrellas") Integer estrellas, Pageable pageable);

    @Query("""
            select r.estrellas as estrellas, count(r) as total from Resena r
            where r.mueble.id = :muebleId and r.oculta = false
            group by r.estrellas
            """)
    List<ConteoEstrellas> distribucion(@Param("muebleId") Long muebleId);

    /** Moderación: todas las reseñas; oculta null = ambas; buscar en mueble, autor o texto. */
    @EntityGraph(attributePaths = {"cliente", "mueble"})
    @Query("""
            select r from Resena r
            where (:oculta is null or r.oculta = :oculta)
              and (:buscar is null
                   or lower(r.mueble.nombre) like lower(concat('%', :buscar, '%'))
                   or lower(r.cliente.nombre) like lower(concat('%', :buscar, '%'))
                   or lower(r.texto) like lower(concat('%', :buscar, '%')))
            """)
    Page<Resena> moderacion(@Param("oculta") Boolean oculta, @Param("buscar") String buscar, Pageable pageable);
}
