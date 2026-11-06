package com.gc.back.categoria.repository;

import com.gc.back.categoria.entity.Categoria;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.Optional;

public interface CategoriaRepository extends JpaRepository<Categoria, Long> {

    Optional<Categoria> findByNombreIgnoreCase(String nombre);

    boolean existsByNombreIgnoreCase(String nombre);

    boolean existsByNombreIgnoreCaseAndIdNot(String nombre, Long id);

    boolean existsBySlug(String slug);

    boolean existsBySlugAndIdNot(String slug, Long id);

    Page<Categoria> findByNombreContainingIgnoreCase(String nombre, Pageable pageable);

    /** Cuántos muebles usan la categoría; si hay alguno no se puede borrar. */
    @Query("select count(m) from Mueble m where m.categoria.id = :id")
    long contarMuebles(@Param("id") Long id);
}
