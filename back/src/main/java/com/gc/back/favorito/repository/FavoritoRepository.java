package com.gc.back.favorito.repository;

import com.gc.back.favorito.entity.Favorito;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.EntityGraph;
import org.springframework.data.jpa.repository.JpaRepository;

public interface FavoritoRepository extends JpaRepository<Favorito, Long> {

    boolean existsByUsuarioIdAndMuebleId(Long usuarioId, Long muebleId);

    long deleteByUsuarioIdAndMuebleId(Long usuarioId, Long muebleId);

    /** Favoritos del usuario cuyo mueble sigue publicado (un mueble oculto no se muestra). */
    @EntityGraph(attributePaths = {"mueble", "mueble.categoria", "mueble.vendedor"})
    Page<Favorito> findByUsuarioIdAndMueblePublicadoTrue(Long usuarioId, Pageable pageable);
}
