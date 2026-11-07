package com.gc.back.vendedor.repository;

import com.gc.back.vendedor.entity.TrabajoVendedor;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface TrabajoVendedorRepository extends JpaRepository<TrabajoVendedor, Long> {

    List<TrabajoVendedor> findByVendedorIdOrderByOrdenAscIdAsc(Long vendedorId);

    long countByVendedorId(Long vendedorId);

    Optional<TrabajoVendedor> findByIdAndVendedorId(Long id, Long vendedorId);
}
