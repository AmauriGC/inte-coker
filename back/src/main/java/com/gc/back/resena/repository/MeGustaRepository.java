package com.gc.back.resena.repository;

import com.gc.back.resena.entity.MeGusta;
import org.springframework.data.jpa.repository.JpaRepository;

public interface MeGustaRepository extends JpaRepository<MeGusta, Long> {

    boolean existsByUsuarioIdAndMuebleId(Long usuarioId, Long muebleId);

    long deleteByUsuarioIdAndMuebleId(Long usuarioId, Long muebleId);

    long countByMuebleId(Long muebleId);
}
