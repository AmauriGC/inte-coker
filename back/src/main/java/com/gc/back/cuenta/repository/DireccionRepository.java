package com.gc.back.cuenta.repository;

import com.gc.back.cuenta.entity.Direccion;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface DireccionRepository extends JpaRepository<Direccion, Long> {

    /** La predeterminada primero; después, en el orden en que se guardaron. */
    List<Direccion> findByUsuarioIdOrderByPredeterminadaDescIdAsc(Long usuarioId);

    Optional<Direccion> findByIdAndUsuarioId(Long id, Long usuarioId);

    long countByUsuarioId(Long usuarioId);
}
