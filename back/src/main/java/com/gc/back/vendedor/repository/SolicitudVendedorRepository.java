package com.gc.back.vendedor.repository;

import com.gc.back.vendedor.entity.EstadoSolicitud;
import com.gc.back.vendedor.entity.SolicitudVendedor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.EntityGraph;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface SolicitudVendedorRepository extends JpaRepository<SolicitudVendedor, Long> {

    /** La más reciente de la cuenta (pendiente, aprobada o rechazada). */
    Optional<SolicitudVendedor> findFirstByUsuarioIdOrderByIdDesc(Long usuarioId);

    boolean existsByUsuarioIdAndEstado(Long usuarioId, EstadoSolicitud estado);

    @EntityGraph(attributePaths = {"usuario", "revisadoPor"})
    Page<SolicitudVendedor> findByEstado(EstadoSolicitud estado, Pageable pageable);

    @EntityGraph(attributePaths = {"usuario", "revisadoPor"})
    Page<SolicitudVendedor> findAllBy(Pageable pageable);

    long countByEstado(EstadoSolicitud estado);
}
