package com.gc.back.aviso.repository;

import com.gc.back.aviso.entity.AvisoExistencia;
import org.springframework.data.jpa.repository.EntityGraph;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface AvisoExistenciaRepository extends JpaRepository<AvisoExistencia, Long> {

    @EntityGraph(attributePaths = {"usuario", "variante"})
    List<AvisoExistencia> findByMuebleId(Long muebleId);

    List<AvisoExistencia> findByUsuarioIdAndMuebleId(Long usuarioId, Long muebleId);

    Optional<AvisoExistencia> findByUsuarioIdAndMuebleIdAndVarianteId(Long usuarioId, Long muebleId, Long varianteId);

    Optional<AvisoExistencia> findByUsuarioIdAndMuebleIdAndVarianteIsNull(Long usuarioId, Long muebleId);

    long countByUsuarioId(Long usuarioId);
}
